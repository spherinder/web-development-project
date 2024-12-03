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


class PredictionMarket(db.Model):
    id: so.Mapped[int] = so.mapped_column(primary_key=True)
    name: so.Mapped[str] = so.mapped_column(sa.String(256), nullable=False)
    description: so.Mapped[str] = so.mapped_column(sa.String(1025), nullable=False)
    transactions: so.WriteOnlyMapped["TransactionInPredictionMarket"] = so.relationship(
        back_populates="market"
    )


class TransactionInPredictionMarket(db.Model):
    """
    A singular transaction which takes place in the market. A user will either
    buy into, or sell out of, the market.
    """

    id: so.Mapped[int] = so.mapped_column(primary_key=True)
    market_id: so.Mapped[int] = so.mapped_column(
        sa.ForeignKey(PredictionMarket.id), index=True
    )
    market: so.Mapped[PredictionMarket] = so.relationship(back_populates="transactions")
    # either "buy[yes]", "buy[no]", "initial"
    #
    # todo: we might want to make it possible to increase the size of the
    # liquidity pool, or
    tx_type: so.Mapped[str] = so.mapped_column(sa.String(8))
    amount: so.Mapped[float] = so.mapped_column(sa.Integer())
    price_yes_after: so.Mapped[float] = so.mapped_column(sa.Float())
    price_no_after: so.Mapped[float] = so.mapped_column(sa.Float())
    yes_shares_in_liquidity_pool_after: so.Mapped[float] = so.mapped_column(sa.Float())
    no_shares_in_liquidity_pool_after: so.Mapped[float] = so.mapped_column(sa.Float())


# todo: should enforce a UNIQUE constraint on this table
transaction_user = db.Table(
    "transaction_user",
    db.Column("user_id", db.Integer, db.ForeignKey("user.id")),
    db.Column(
        "tx_id", db.Integer, db.ForeignKey("transaction_in_prediction_market.id")
    ),
)
