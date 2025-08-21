from random import shuffle
from typing import Generator, Iterable, List, Optional, Sequence

from sqlalchemy import Executable
from src.utils.converters import convert_xy_points
from src.exceptions import HttpNotFoundException
from src.requests.game import RCreatePlayerAssociation
from .models import Category, Game, GameDetails, Question, GameAssociation
from .engine import engine
from sqlmodel import SQLModel, Session, delete, select
from sqlite3 import IntegrityError


def __reload_objects[T](
    objects: Iterable[SQLModel], model: type[SQLModel], flush_table=False
):
    with Session(engine) as session:
        statement = delete(model)
        session.exec(statement)  # type: ignore

        session.add_all(objects)
        session.commit()


def save_categories(data: Iterable[Category]):
    try:
        __reload_objects(data, Category, flush_table=True)
    except IntegrityError:
        pass


def read_categories() -> Sequence[Category]:
    stmt = select(Category)
    with Session(engine) as session:
        return session.exec(stmt).all()


def save_questions(data: Iterable[Question]):
    try:
        __reload_objects(data, Question, flush_table=True)
    except IntegrityError:
        pass


def create_game_item(name: str) -> str:
    game = Game(name=name)
    id = game.id

    with Session(engine) as session:
        session.add(game)
        session.commit()

        return id


def read_games() -> Sequence[Game]:
    stmt = select(Game)
    with Session(engine) as session:
        return session.exec(stmt).all()


def read_game(id: str) -> Optional[Game]:
    stmt = select(Game).where(Game.id == id)
    with Session(engine) as session:
        return session.exec(stmt).first()


def delete_whole_game(id: str) -> None:
    with Session(engine) as session:
        assoc_stmt: Executable = delete(GameAssociation).where(
            GameAssociation.game_id == id
        )
        game_stmt: Executable = delete(Game).where(Game.id == id)

        session.exec(assoc_stmt)
        session.exec(game_stmt)
        session.commit()


def read_game_associations(game_id: str) -> List[GameAssociation]:
    stmt = select(GameAssociation).where(GameAssociation.game_id == game_id)

    with Session(engine) as session:
        return list(session.exec(stmt).all())


def read_game_details(id: str) -> GameDetails:
    stmt = select(GameAssociation).where(GameAssociation.game_id == id)

    with Session(engine) as session:
        game = session.get(Game, id)
        if not game:
            raise HttpNotFoundException

        return GameDetails(**game.model_dump(), state=session.exec(stmt).all())


def create_game_association(game_id: str, data: RCreatePlayerAssociation) -> str:
    assoc = GameAssociation(
        game_id=game_id,
        player_name=data.player_name,
        category_name=data.category_name,
    )
    with Session(engine) as session:
        session.add(assoc)
        session.commit()
        return assoc.id


def remove_game_association(game_id: str, player_id: str):
    stmt: Executable = (
        delete(GameAssociation)
        .where(GameAssociation.id == player_id)
        .where(GameAssociation.game_id == game_id)
    )

    with Session(engine) as session:
        session.exec(stmt)
        session.commit()


def update_model(obj: SQLModel):
    with Session(engine) as session:
        session.add(obj)
        session.commit()
        session.refresh(obj)


def read_player_association(id: str) -> GameAssociation:
    stmt = select(GameAssociation).where(GameAssociation.id == id)

    player: Optional[GameAssociation] = None
    with Session(engine) as session:
        player = session.exec(stmt).first()

    if not player:
        raise HttpNotFoundException

    return player


def category_questions_generator(category: str) -> Generator[Question]:
    stmt = select(Question).where(Question.category_name == category)

    questions = []
    with Session(engine) as session:
        questions = list(session.exec(stmt).all())

    shuffle(questions)
    i = 0
    while True:
        yield questions[i % len(questions)]
        i += 1
