"""Add default market

Revision ID: a5b05b38c859
Revises: 5377b93239a9
Create Date: 2024-12-06 15:52:47.686571

"""
from alembic import op
import sqlalchemy as sa
from sqlalchemy.orm import Session
from api.models import PredictionMarket, MarketLiquidity

# revision identifiers, used by Alembic.
revision = 'a5b05b38c859'
down_revision = '5377b93239a9'
branch_labels = None
depends_on = None


def upgrade():
    bind = op.get_bind()
    session = Session(bind=bind)
    if not PredictionMarket.query.first():
        market = PredictionMarket(
            name="Default market", description="Default market"
        )
        session.add(market)
        session.commit()

        liquidity = MarketLiquidity(
            market_id=market.id, yes_liquidity=420, no_liquidity=69
        )
        session.add(liquidity)
        session.commit()

def downgrade():
    bind = op.get_bind()
    session = Session(bind=bind)

    session.query(PredictionMarket).filter(PredictionMarket.id == 1).delete(synchronize_session=False)

    session.query(MarketLiquidity).filter(MarketLiquidity.market_id == 1).delete(synchronize_session=False)
    
    session.commit()
