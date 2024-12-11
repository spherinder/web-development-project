python -m flask db upgrade
gunicorn --config gunicorn_config.py app:app
