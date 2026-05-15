import logging
from contextlib import asynccontextmanager

from fastapi import Depends, FastAPI, HTTPException, Request, status
from pydantic import BaseModel
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from slowapi import Limiter, _rate_limit_exceeded_handler
from slowapi.errors import RateLimitExceeded

from app.auth import TokenResponse, create_access_token, get_current_token
from app.config import Settings
from app.schemas import IdentifyRequest, IdentifyResponse
from app.services import identify_plant

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

settings = Settings()


def get_client_ip(request: Request) -> str:
    """Return the real client IP, preferring X-Forwarded-For when present."""
    forwarded = request.headers.get("x-forwarded-for")
    if forwarded:
        return forwarded.split(",")[0].strip()
    return request.client.host if request.client else "unknown"


# Rate limiter using slowapi (in-memory by default, no Redis required)
limiter = Limiter(key_func=get_client_ip)


@asynccontextmanager
async def lifespan(app: FastAPI):
    logger.info("Starting Plant ID proxy service")
    if not settings.plant_id_api_key:
        logger.warning("PLANT_ID_API_KEY is not set")
    if not settings.jwt_secret_key:
        logger.warning("JWT_SECRET_KEY is not set")
    yield
    logger.info("Shutting down Plant ID proxy service")


app = FastAPI(
    title="Plant ID Proxy",
    description="Secure proxy for Plant.id API - keeps the API key server-side",
    version="0.1.0",
    lifespan=lifespan,
)

# Attach limiter and register the standard rate-limit exceeded handler
app.state.limiter = limiter
app.add_exception_handler(RateLimitExceeded, _rate_limit_exceeded_handler)

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origin_list,
    allow_credentials=True,
    allow_methods=["POST", "GET"],
    allow_headers=["*"],
)

# Health check endpoint for Docker / Render
@app.get("/health", tags=["system"])
async def health_check():
    return {"status": "ok"}


@app.post("/session", response_model=TokenResponse, tags=["auth"])
async def create_session():
    """
    Public endpoint that issues a JWT for anonymous clients.
    In production this would include rate limiting, device fingerprinting, etc.
    """
    token = create_access_token(subject="anonymous")
    return TokenResponse(access_token=token)


@app.post("/identify", response_model=IdentifyResponse, tags=["identification"])
@limiter.limit(settings.rate_limit)
async def identify(
    req: IdentifyRequest,
    request: Request,
    token: str = Depends(get_current_token),
):
    result = await identify_plant(req.image_base64)
    return IdentifyResponse(result=result)


@app.exception_handler(Exception)
async def global_exception_handler(request: Request, exc: Exception):
    """Log all unhandled exceptions and return a safe response to the client."""
    if isinstance(exc, HTTPException):
        return JSONResponse(
            status_code=exc.status_code,
            content={"detail": exc.detail},
        )

    logger.exception("Unhandled exception on %s", request.url.path)
    return JSONResponse(
        status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
        content={"detail": "Internal server error"},
    )
