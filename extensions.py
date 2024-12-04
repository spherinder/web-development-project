from flask_sqlalchemy import SQLAlchemy
from flask_migrate import Migrate

# avoids circular imports
db = SQLAlchemy()
migrate = Migrate()
