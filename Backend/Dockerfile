# Base image
FROM python:3.12-slim

# Working directory inside container
WORKDIR /app

# Copy requirements first and install dependencies
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copy entire backend source code
COPY . .

# Expose FastAPI port
EXPOSE 8000

# Run Alembic migrations, then start Uvicorn server
CMD ["sh", "-c", "alembic upgrade head && uvicorn src:app --host 0.0.0.0 --port 8000"]
