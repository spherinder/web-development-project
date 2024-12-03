# Web development project

## Run server

Create a virtual environment

```
python3 -m venv .venv
source .venv/bin/activate
```

Install dependencies

```
pip install -r requirements.txt
```

Run database migrations

```
flask db upgrade
```

Run application

```
flask run
```

This will serve on port 4000 by default.

### Alternative Reproducible approach

Install the python project manager [uv](https://docs.astral.sh/uv/getting-started/installation/)

Start the API server using `uv run -- flask run`

## Run server tests

From inside the virtual environment, run

```
python tests.py
```

## Client
Install packages: `cd client && npm i`

Start the client development server using `npm run start`
