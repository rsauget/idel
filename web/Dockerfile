FROM alpine:latest
WORKDIR /app
RUN apk add --no-cache nodejs npm && \
    adduser -D -g '' idel && \
    chown idel:idel .
USER idel
COPY --chown=idel:idel package*.json ./
RUN npm ci
COPY --chown=idel:idel . .
VOLUME /app/public
RUN npm run build
ENTRYPOINT npm run start
EXPOSE 3000