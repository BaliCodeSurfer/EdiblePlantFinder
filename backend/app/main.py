import logging
from contextlib import asynccontextmanager

from fastapi import FastAPI, HTTPException, status
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse

from app.config import Settings
from app.schemas import IdentifyRequest, IdentifyResponse
from app.services import identify_plant

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

settings = Settings()


@asynccontextmanager
async def lifespan(app: FastAPI):
    logger.info("Starting Plant ID proxy service")
    if not settings.plant_id_api_key:
        logger.warning("PLANT_ID_API_KEY is not set")
    yield
    logger.info("Shutting down Plant ID proxy service")


app = FastAPI(
    title="Plant ID Proxy",
    description="Secure proxy for Plant.id API - keeps the API key server-side",
    version="0.1.0",
    lifespan=lifespan,
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origin_list,
    allow_credentials=True,
    allow_methods=["POST", "GET"],
    allow_headers=["*"],
)


@app.get("/health", tags=["system"])
async def health_check():
    return {"status": "ok"}


@app.post("/identify", response_model=IdentifyResponse, tags=["identification"])
async def identify(req: IdentifyRequest):
    try:
        result = await identify_plant(req.image_base64)
        return IdentifyResponse(result=result)
    except HTTPException:
        raise
    except Exception as exc:
        logger.exception("Unexpected error during identification")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Internal server error",
        ) from exc


@app.exception_handler(HTTPException)
async def http_exception_handler(request, exc: HTTPException):
    return JSONResponse(
        status_code=exc.status_code,
        content={"detail": exc.detail},
    )
