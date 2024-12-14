from flask_sqlalchemy import SQLAlchemy
from flask_migrate import Migrate

from api.messaging import MessageBroker

# avoids circular imports
db = SQLAlchemy()
migrate = Migrate()
announcer = MessageBroker()
