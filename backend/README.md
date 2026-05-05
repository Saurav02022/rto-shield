# Backend (FastAPI)

Local API for the assignment. See **[`AGENTS.md`](AGENTS.md)** for architecture rules.

## Setup

```bash
cd backend
python3 -m venv venv
venv/bin/python -m pip install -r requirements.txt
venv/bin/python -m pip install -r requirements-dev.txt
cp .env.example .env
./start.sh
```

- API: [http://localhost:8000](http://localhost:8000)
- OpenAPI: [http://localhost:8000/docs](http://localhost:8000/docs)

## Tests

```bash
cd backend
venv/bin/python -m pytest tests/ -v
```

## Docker

```bash
docker build -t bolna-backend backend
docker run -p 8000:8000 bolna-backend
```
