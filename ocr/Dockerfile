# The ID scanner. It runs as its own small web service (Render, free plan), separate from the website.
FROM python:3.12-slim
RUN apt-get update && apt-get install -y --no-install-recommends tesseract-ocr tesseract-ocr-eng \
    && rm -rf /var/lib/apt/lists/*
WORKDIR /app
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt
COPY matcher.py reader.py app.py ./
RUN useradd -m app
USER app
# Render tells the container which port to use through $PORT. One worker keeps memory under the free plan's 512 MB.
ENV PORT=10000
CMD ["sh", "-c", "exec gunicorn -b 0.0.0.0:${PORT} -w 1 --threads 2 --timeout 90 app:app"]
