"""default admin user

Revision ID: 4c61a3d81fb4
Revises: a5b05b38c859
Create Date: 2024-12-11 11:23:02.922940

"""
from alembic import op
import sqlalchemy as sa
from sqlalchemy.orm import Session
from api.models import User, UserBalance


# revision identifiers, used by Alembic.
revision = '4c61a3d81fb4'
down_revision = 'a5b05b38c859'
branch_labels = None
depends_on = None


def upgrade():
    bind = op.get_bind()
    session = Session(bind=bind)
    admin_user = User(
        username="admin", email="admin@ethz.ch",
        api_key="api", is_superuser=True
    )
    admin_user.set_password("changeme")
    session.add(admin_user)
    session.commit()

    user_balance = UserBalance(
        user_id=1, market_id=1, dog_balance=1000,
        yes_balance=0, no_balance=0
    )
    session.add(user_balance)
    session.commit()
    



def downgrade():
    bind = op.get_bind()
    session = Session(bind=bind)

    session.query(User).filter(User.username == "admin").delete(synchronize_session=False)
    session.query(UserBalance).filter(UserBalance.market_id == 1).delete(synchronize_session=False)
    
    session.commit()

