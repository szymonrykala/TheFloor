from datetime import datetime
import json
from typing import Dict, List, Literal, Optional
from pydantic import field_serializer
from sqlmodel import Field, SQLModel
from uuid import uuid4

from src.utils.converters import XYPoint, convert_xy_points


def _gen_uid():
    return str(uuid4())


class Base(SQLModel):
    created_at: datetime = Field(default_factory=datetime.now)
    updated_at: datetime = Field(default_factory=datetime.now)

    @field_serializer("created_at", "updated_at")
    def datetime_serializer(self, datetime: datetime) -> str:
        return datetime.isoformat()


class Category(Base, table=True):
    name: str = Field(primary_key=True)
    description: str


class Question(Base, table=True):
    id: str = Field(default_factory=_gen_uid, primary_key=True)
    category_name: str = Field(foreign_key="category.name")
    image_path: str
    answer: str


class GameAssociation(Base, table=True):
    id: str = Field(default_factory=_gen_uid, primary_key=True)
    game_id: str = Field(foreign_key="game.id", index=True)
    category_name: str = Field(foreign_key="category.name")
    player_name: str
    time_left: int = 45
    xy_points: str = Field(default=convert_xy_points([]))

    @field_serializer("xy_points")
    def serialize_xy_points(self, points: str) -> List[Dict[Literal["x", "y"], int]]:
        return json.loads(points)

    def set_points(self, x: int, y: int):
        self.xy_points = json.dumps([XYPoint(x=x, y=y)])

    def erase_points(self):
        self.xy_points = json.dumps([])

    def extend_points(self, won_points: List[XYPoint]):
        points = self.get_points()
        points.extend(won_points)
        self.xy_points = json.dumps(points)

    def get_points(self) -> List[XYPoint]:
        if isinstance(self.xy_points, str):
            return json.loads(self.xy_points)
        else:
            return self.xy_points


class _GameData(Base):
    id: str = Field(default_factory=_gen_uid, primary_key=True)
    name: str
    winner_id: Optional[str] = Field(default=None, foreign_key="gameassociation.id")
    started: bool = False
    finished: bool = False
    sufler_present: bool = False


class Game(_GameData, table=True):
    pass


class GameDetails(_GameData):
    state: list[GameAssociation]
