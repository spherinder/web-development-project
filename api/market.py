from flask import Blueprint, g, request
from api import db
from api.models import (
    MarketLiquidity,
    PredictionMarket,
    User,
    UserBalance,
)
from api.api_key import require_api_key

market_blueprint = Blueprint("market", __name__, url_prefix="/market")


def purchase(is_yes: bool, dollar_amount, market: PredictionMarket, user: User):
    """
    Turn dollar_amount in Ð into dollar_amount in ¥ and dollar_amount in ₦

    k ≔ market.yes_balance * market.no_balance

    Suppose is_yes is true

    (market.no_balance + dollar_amount) * (market.yes_balance - delta) = k
    """
    # TODO: check that the user has enough money
    # TODO: assert market balance doesn't go negative (it shouldn't)
    liquidity: MarketLiquidity = (
        MarketLiquidity.query.filter(MarketLiquidity.market_id == market.id)
        .order_by(MarketLiquidity.timestamp.desc())
        .first_or_404()
    )

    product = liquidity.no_balance * liquidity.yes_balance
    buy_liquidity, sell_liquidity = (liquidity.yes_balance, liquidity.no_balance) if is_yes else (liquidity.no_balance, liquidity.yes_balance)
    delta = buy_liquidity - product / (
        sell_liquidity + dollar_amount
    )
    buy_key, sell_key = ("yes_balance", "no_balance") if is_yes else ("no_balance", "yes_balance")

    # when we create the market we create an initial balance
    new_liquidity = MarketLiquidity(
        market_id=market.id,
        **{
            buy_key: buy_liquidity - delta,
            sell_key: sell_liquidity + dollar_amount
        })

    db.session.add(new_liquidity)

    dog_balance = (
        UserBalance.query.filter(UserBalance.user_id == user.id)
        .order_by(UserBalance.timestamp.desc())
        .first_or_404()
    ).dog_balance

    tok_balance: UserBalance = (
        UserBalance.query.filter(
            UserBalance.user_id == user.id and MarketLiquidity.market_id == market.id
        )
        .order_by(UserBalance.timestamp.desc())
        .first_or_404()
    )

    new_balance = UserBalance(
        user_id=user.id,
        market_id=market.id,
        dollar_amount=dog_balance - dollar_amount,
        **{
            buy_key: buy_balance + dollar_amount + delta,
            sell_key: sell_balance
        }
    )

    db.session.add(new_balance)

    db.session.commit()

def sell(is_yes: bool, token_amount, market: PredictionMarket, user: User):
    """
    Suppose is_yes is true. Part of token_amount in ¥ must be converted into ₦, such that

    token_amount - convert_amount =ꜝ delta

    (market.yes_balance + convert_amount) * (market.no_balance - delta) = k

    where σ ≔ market.yes_balance + market.no_balance:

    ⇒ -(market.yes_balance * token_amount)
      + convert_amount * (σ - token_amount)
      + (market.yes_balance)²
     =ꜝ 0

    ⇒ convert_amount = (token_amount - σ)/2
      + sqrt[(token_amount - σ)²/4 + market.yes_balance * token_amount]
    """
    # TODO: check that the user has more than token_amount of token
    # TODO: assert market balance doesn't go negative (it shouldn't)

    sell_key, buy_key = ("yes_balance", "no_balance") if is_yes else ("no_balance", "yes_balance")
    sell_liquidity, buy_liquidity = (liquidity.yes_balance, liquidity.no_balance) if is_yes else (liquidity.no_balance, liquidity.yes_balance)

    liquidity: MarketLiquidity = (
        MarketLiquidity.query.filter(MarketLiquidity.market_id == market.id)
        .order_by(MarketLiquidity.timestamp.desc())
        .first_or_404()
    )

    sigma = liquidity.no_balance + liquidity.yes_balance
    convert_amount = (token_amount - sigma)/2
      + math.sqrt(
          (token_amount - sigma)**2 / 4
          + sell_liquidity * token_amount
      )
    delta = token_amount - convert_amount

    dog_balance = (
        UserBalance.query.filter(UserBalance.user_id == user.id)
        .order_by(UserBalance.timestamp.desc())
        .first_or_404()
    ).dog_balance

    tok_balance: UserBalance = (
        UserBalance.query.filter(
            UserBalance.user_id == user.id and MarketLiquidity.market_id == market.id
        )
        .order_by(UserBalance.timestamp.desc())
        .first_or_404()
    )

    # when we create the market we create an initial balance
    new_liquidity = MarketLiquidity(
        market_id=market.id,
        **{
            buy_key: buy_liquidity + convert_amount,
            sell_key: sell_liquidity - delta
        })

    db.session.add(new_liquidity)

    new_balance = UserBalance(
        user_id=user.id,
        market_id=market.id,
        dollar_amount=dog_balance + delta,
        **{
            buy_key: buy_balance,
            sell_key: sell_balance - token_amount
        }
    )

    db.session.add(new_balance)

    db.session.commit()


@market_blueprint.post("/<market_id>/tx")
@require_api_key
def do_transaction(market_id):
    market = PredictionMarket.query.filter(
        PredictionMarket.id == market_id
    ).first_or_404()
    user: User = g.user

    json = request.get_json()
    dollars = json["dollars"]
    kind = json["kind"]

    if kind == "buy[yes]":
        is_yes = True
    else:
        assert kind == "buy[no]"
        is_yes = False

    purchase(is_yes, dollars, market, user)

    return {"status": "ok", "msg": "Purchased", "data": None}
