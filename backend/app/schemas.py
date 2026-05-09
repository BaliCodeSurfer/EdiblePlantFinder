from pydantic import BaseModel, Field


class IdentifyRequest(BaseModel):
    image_base64: str = Field(
        ...,
        min_length=100,
        description="Raw base64-encoded JPEG image data (no data: URI prefix)",
    )


class IdentifyResponse(BaseModel):
    result: dict | None = Field(
        default=None,
        description="Plant identification result from Plant.id or null",
    )
