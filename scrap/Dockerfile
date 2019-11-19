FROM alpine:latest
WORKDIR /app
COPY requirements.txt .
RUN apk add --no-cache python3 chromium chromium-chromedriver && \
    apk add --no-cache --virtual .build-deps build-base python3-dev && \
    python3 -m ensurepip && \
    python3 -m pip install -U pip wheel && \
    python3 -m pip install -r requirements.txt && \
    apk del .build-deps
COPY . .
VOLUME /app/public
COPY public/locations.json public/locations.json
ENTRYPOINT python3 scrap.py
