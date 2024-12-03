from dataclasses import dataclass
import datetime
from typing import Optional
import sqlalchemy as sa
import sqlalchemy.orm as so
from api import db
from werkzeug.security import generate_password_hash, check_password_hash


class User(db.Model):
    id: so.Mapped[int] = so.mapped_column(primary_key=True)
    username: so.Mapped[str] = so.mapped_column(sa.String(64), index=True, unique=True)
    email: so.Mapped[str] = so.mapped_column(sa.String(120), index=True, unique=True)
    password_hash: so.Mapped[Optional[str]] = so.mapped_column(sa.String(256))
    api_key: so.Mapped[str] = so.mapped_column(sa.String(256))
    is_superuser: so.Mapped[bool] = so.mapped_column(sa.Boolean)

    def set_password(self, password):
        self.password_hash = generate_password_hash(password)

    def check_password(self, password):
        return check_password_hash(self.password_hash, password)

    def __repr__(self):
        return "<User {}>".format(self.username)


@dataclass
class PredictionMarket(db.Model):
    id: so.Mapped[int] = so.mapped_column(primary_key=True)
    name: so.Mapped[str] = so.mapped_column(sa.String(256), nullable=False)
    description: so.Mapped[str] = so.mapped_column(sa.String(1025), nullable=False)
    created_at: so.Mapped[datetime.datetime] = so.mapped_column(
        index=True, default=lambda: datetime.datetime.now(datetime.timezone.utc)
    )


class MarketLiquidity(db.Model):
    id: so.Mapped[int] = so.mapped_column(primary_key=True)
    market_id: so.Mapped[int] = so.mapped_column(
        sa.ForeignKey(PredictionMarket.id), index=True
    )
    yes_balance: so.Mapped[float] = so.mapped_column(sa.Float())
    no_balance: so.Mapped[float] = so.mapped_column(sa.Float())
    timestamp: so.Mapped[datetime.datetime] = so.mapped_column(
        index=True, default=lambda: datetime.now(datetime.timezone.utc)
    )


class UserBalance(db.Model):
    id: so.Mapped[int] = so.mapped_column(primary_key=True)
    user_id: so.Mapped[int] = so.mapped_column(sa.ForeignKey(User.id), index=True)
    market_id: so.Mapped[int] = so.mapped_column(
        sa.ForeignKey(PredictionMarket.id), index=True
    )
    yes_balance: so.Mapped[float] = so.mapped_column(sa.Float())
    no_balance: so.Mapped[float] = so.mapped_column(sa.Float())
    dog_balance: so.Mapped[float] = so.mapped_column(sa.Float())
    timestamp: so.Mapped[datetime.datetime] = so.mapped_column(
        index=True, default=lambda: datetime.now(datetime.timezone.utc)
    )
