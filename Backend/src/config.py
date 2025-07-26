from pydantic_settings import BaseSettings, SettingsConfigDict

class Settings(BaseSettings):
    DATABASE_URL: str 

    model_config = SettingsConfigDict(
        env_file=".env",
        extra="ignore",
    )

Config = Settings()
print("Loaded DB URL:", Config.DATABASE_URL)