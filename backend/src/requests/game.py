from pydantic import BaseModel


class RCreateGame(BaseModel):
    name: str


class RCreatePlayerAssociation(BaseModel):
    player_name: str
    category_name: str
