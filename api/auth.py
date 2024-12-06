from api.models import User, UserBalance
from extensions import db
from flask import Blueprint
import secrets
import sqlalchemy as sa
from pydantic import BaseModel
from flask_pydantic import validate # pyright: ignore[reportMissingTypeStubs, reportUnknownVariableType]

auth_blueprint = Blueprint("auth", __name__, url_prefix="/auth")

class RegisterReq(BaseModel):
    username: str
    email: str
    password: str

@auth_blueprint.post("/register")
@validate()
def register(body: RegisterReq):
    api_key = secrets.token_urlsafe(32)
    # todo: input sanitisation
    # todo: fail gracefully with missing data
    if User.query.filter(User.username == body.username).first():
        return { "status": "err", "msg": "Duplicate username", "data": None }, 409
    user = User(
        username=body.username,
        email=body.email,
        api_key=api_key,
        is_superuser=False,
    )
    user.set_password(body.password)

    db.session.add(user)
    db.session.commit()
    init_balance = UserBalance(dog_balance=100_000, yes_balance=0, no_balance=0, user_id=user.id, market_id=1)
    db.session.add(init_balance)
    db.session.commit()

    return {"status": "ok", "msg": "Created that user", "data": None}

class LoginReq(BaseModel):
    username: str
    password: str

@auth_blueprint.post("/login")
@validate()
def login(body: LoginReq):
    user = db.session.scalar(sa.select(User).where(User.username == body.username))
    print("user ", user)
    if user is not None:
        print("check ", user.check_password(body.password))
    if user is None or not user.check_password(body.password):
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
