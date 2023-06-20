from pydantic import BaseSettings


class Settings(BaseSettings):
    client_id: str
    redirect_uri: str
    scope: str
    code_challenge: str
    code_challenge_method: str

    class Config:
        env_file = ".env"
