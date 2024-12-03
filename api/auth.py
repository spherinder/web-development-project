from api.models import User
from api import db
from flask import Blueprint, request
import secrets
import sqlalchemy as sa


auth_blueprint = Blueprint("auth", __name__, url_prefix="/auth")


@auth_blueprint.post("/register")
def register():
    api_key = secrets.token_urlsafe(32)
    # todo: input sanitisation
    # todo: fail gracefully with missing data

    json = request.get_json()
    user = User(
        username=json["username"],
        email=json["email"],
        api_key=api_key,
        is_superuser=False,
    )
    user.set_password(json["password"])
    db.session.add(user)
    db.session.commit()

    return {"status": "ok", "msg": "Created that user", "data": None}


@auth_blueprint.post("/login")
def login():
    json = request.get_json()
    user = db.session.scalar(sa.select(User).where(User.username == json["username"]))
    if user is None or not user.check_password(json["password"]):
        return {
            "status": "err",
            "msg": "Error: invalid username or password.",
            "data": None,
        }, 400
    return {
        "status": user.api_key,
        "msg": "API key in the data field",
        "data": {"api_key": user.api_key},
    }
