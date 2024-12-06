from dataclasses import dataclass
import datetime
from typing import Any, override
import sqlalchemy as sa
from sqlalchemy.inspection import Inspectable
import sqlalchemy.orm as so
from extensions import db
from werkzeug.security import generate_password_hash, check_password_hash


@dataclass
class User(db.Model):
    id: so.Mapped[int] = so.mapped_column(primary_key=True)
    username: so.Mapped[str] = so.mapped_column(sa.String(64), index=True, unique=True)
    email: so.Mapped[str] = so.mapped_column(sa.String(120), index=True, unique=True)
    password_hash: so.Mapped[str | None] = so.mapped_column(sa.String(256))
    api_key: so.Mapped[str] = so.mapped_column(sa.String(256))
    is_superuser: so.Mapped[bool] = so.mapped_column(sa.Boolean)

    def as_dict(self):
        """
        Returns data that the user can see about other users.
        """
        return {"id": self.id, "username": self.username}

    def as_dict_self(self):
        """
        Returns data that the user can see about themself.
        """
        return {"email": self.email, **self.as_dict()}

    def set_password(self, password: str):
        self.password_hash = generate_password_hash(password)

    def check_password(self, password: str) -> bool:
        if self.password_hash is None:
            return False
        return check_password_hash(self.password_hash, password)

    @override
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
    resolved: so.Mapped[bool] = so.mapped_column(
        default=False, nullable=False
    )

@dataclass
class MarketLiquidity(db.Model):
    id: so.Mapped[int] = so.mapped_column(primary_key=True)
    market_id: so.Mapped[int] = so.mapped_column(
        sa.ForeignKey(PredictionMarket.id), index=True
    )
    yes_liquidity: so.Mapped[float] = so.mapped_column(sa.Float())
    no_liquidity: so.Mapped[float] = so.mapped_column(sa.Float())
    timestamp: so.Mapped[datetime.datetime] = so.mapped_column(
        index=True, default=lambda: datetime.datetime.now(datetime.timezone.utc)
    )

@dataclass
class UserBalance(db.Model, Inspectable[so.Mapper[Any]]):
    id: so.Mapped[int] = so.mapped_column(primary_key=True)
    user_id: so.Mapped[int] = so.mapped_column(sa.ForeignKey(User.id), index=True)
    market_id: so.Mapped[int] = so.mapped_column(
        sa.ForeignKey(PredictionMarket.id), index=True
    )
    yes_balance: so.Mapped[float] = so.mapped_column(sa.Float())
    no_balance: so.Mapped[float] = so.mapped_column(sa.Float())
    dog_balance: so.Mapped[float] = so.mapped_column(sa.Float())
    timestamp: so.Mapped[datetime.datetime] = so.mapped_column(
        index=True, default=lambda: datetime.datetime.now(datetime.timezone.utc)
    )

    def as_dict(self) -> dict[str, Any]:
        return {
            c.key: getattr(self, c.key) for c in sa.inspect(self).mapper.column_attrs
        }
