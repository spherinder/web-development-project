export SQLALCHEMY_DATABASE_URI="/http/app.db"
python -m flask db upgrade
gunicorn --config gunicorn_config.py app:app --env SQLALCHEMY_DATABASE_URI="/http/app.db"
