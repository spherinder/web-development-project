from api.models import User
from extensions import db
from flask import Blueprint, request
import secrets
import sqlalchemy as sa
from pydantic import BaseModel, ValidationError

auth_blueprint = Blueprint("auth", __name__, url_prefix="/auth")

class RegisterReq(BaseModel):
    username: str
    email: str
    password: str

@auth_blueprint.post("/register")
def register():
    api_key = secrets.token_urlsafe(32)
    # todo: input sanitisation
    # todo: fail gracefully with missing data

    try:
        json = RegisterReq.model_validate(request.get_json())
    except ValidationError as e:
        return ({
            "status": "error",
            "msg": "Invalid input",
            "error": e.errors()
        }, 400)

    user = User(
        username=json.username,
        email=json.email,
        api_key=api_key,
        is_superuser=False,
    )
    user.set_password(json.password)
    db.session.add(user)
    db.session.commit()

    return {"status": "ok", "msg": "Created that user", "data": None}

class LoginReq(BaseModel):
    username: str
    password: str

@auth_blueprint.post("/login")
def login():
    try:
        json = RegisterReq.model_validate(request.get_json())
    except ValidationError as e:
        return ({
            "status": "error",
            "msg": "Invalid input",
            "error": e.errors()
        }, 400)

    user = db.session.scalar(sa.select(User).where(User.username == json.username))
    if user is None or not user.check_password(json.password):
        return {
            "status": "err",
            "msg": "Error: invalid username or password.",
            "data": None,
        }, 400
    return {
        "status": "ok",
        "msg": "API key in the data field",
        "data": {"api_key": user.api_key},
    }
