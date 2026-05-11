from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    model_config = SettingsConfigDict(env_file=".env", env_file_encoding="utf-8")

    plant_id_api_key: str
    plant_id_url: str = (
        "https://api.plant.id/v3/identification"
        "?details=common_names,edible_parts,toxicity,description,url"
    )
    cors_origins: str = "*"  # comma-separated in production

    jwt_secret_key: str
    jwt_algorithm: str = "HS256"
    jwt_expire_minutes: int = 60 * 24 * 30  # 30 days for demo convenience

    @property
    def cors_origin_list(self) -> list[str]:
        if self.cors_origins == "*":
            return ["*"]
        return [o.strip() for o in self.cors_origins.split(",") if o.strip()]