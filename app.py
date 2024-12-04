from types import ModuleType
from flask import Flask
from flask_sqlalchemy import SQLAlchemy
import sqlalchemy as sa
import sqlalchemy.orm as so
from api import create_app, db
from api.models import User

app: Flask = create_app()

@app.shell_context_processor
def make_shell_context() -> dict[str, SQLAlchemy | ModuleType | type[User]]:
    return {"sa": sa, "so": so, "db": db, "User": User}

