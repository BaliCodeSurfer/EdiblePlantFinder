import httpx
from fastapi import HTTPException, status

from app.config import Settings

settings = Settings()

async def identify_plant(image_base64: str) -> dict | None:
    """Forward the image to Plant.id and return the identification result."""
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

    response.raise_for_status()   # raises only on 4xx/5xx

    data = response.json()
    return data.get("result")