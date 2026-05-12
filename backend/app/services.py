import logging

import httpx
from fastapi import HTTPException, status
from tenacity import (
    before_sleep_log,
    retry,
    retry_if_exception,
    stop_after_attempt,
    wait_exponential,
)

from app.config import Settings

settings = Settings()
logger = logging.getLogger(__name__)


def _is_transient_error(exc: Exception) -> bool:
    """Return True for errors worth retrying (network issues, rate limits, 5xx)."""
    if isinstance(exc, (httpx.TimeoutException, httpx.ConnectError, httpx.ReadError)):
        return True
    if isinstance(exc, httpx.HTTPStatusError):
        code = exc.response.status_code
        return code == 429 or 500 <= code < 600
    return False


@retry(
    stop=stop_after_attempt(3),
    wait=wait_exponential(multiplier=1, min=1, max=10),
    retry=retry_if_exception(_is_transient_error),
    before_sleep=before_sleep_log(logger, logging.INFO),
    reraise=True,
)
async def identify_plant(image_base64: str) -> dict | None:
    """
    Forward the image to Plant.id and return the identification result.

    Includes retry with exponential backoff for transient failures:
    - Network timeouts / connection errors
    - HTTP 429 (rate limit) and 5xx responses
    Non-retryable errors (e.g. 4xx client errors other than 429) fail immediately.
    """
    payload = {
        "images": [f"data:image/jpeg;base64,{image_base64}"],
        "classification_level": "all",
    }

    async with httpx.AsyncClient(timeout=30.0) as client:
        response = await client.post(
            settings.plant_id_url,
            headers={
                "Api-Key": settings.plant_id_api_key,
                "Content-Type": "application/json",
            },
            json=payload,
        )

    response.raise_for_status()

    data = response.json()
    return data.get("result")
