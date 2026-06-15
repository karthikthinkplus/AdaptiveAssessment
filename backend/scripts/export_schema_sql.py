from pathlib import Path

from sqlalchemy import create_mock_engine
from sqlalchemy.schema import CreateIndex, CreateTable

from app.shared.db import models  # noqa: F401
from app.shared.db.base import Base


def main() -> None:
    statements: list[str] = ['CREATE EXTENSION IF NOT EXISTS "pgcrypto";']

    def dump(sql, *multiparams, **params) -> None:
        statements.append(str(sql.compile(dialect=engine.dialect)).rstrip() + ";")

    engine = create_mock_engine("postgresql+psycopg://", dump)
    for table in Base.metadata.sorted_tables:
        statements.append(str(CreateTable(table).compile(dialect=engine.dialect)).rstrip() + ";")
    for table in Base.metadata.sorted_tables:
        for index in table.indexes:
            statements.append(str(CreateIndex(index).compile(dialect=engine.dialect)).rstrip() + ";")

    output = Path(__file__).resolve().parents[1] / "schema.sql"
    output.write_text("\n\n".join(statements) + "\n", encoding="utf-8")
    print(f"Wrote {output}")


if __name__ == "__main__":
    main()
