import sqlalchemy as sa
import sqlalchemy.orm as so
from api import create_app, db
from api.models import User

app = create_app()


@app.shell_context_processor
def make_shell_context():
    return {"sa": sa, "so": so, "db": db, "User": User}