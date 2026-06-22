from app.database.session import engine
from sqlalchemy import text


def test_connection():
    with engine.connect() as connection:
        result = connection.execute(text("SELECT version();"))
        print(result.fetchone())


test_connection()