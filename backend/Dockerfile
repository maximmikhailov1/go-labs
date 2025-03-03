# Этап сборки
FROM golang:1.23.2-alpine AS builder

WORKDIR /app

COPY . .
COPY .env .
RUN go mod download
RUN CGO_ENABLED=0 GOOS=linux go build -o main .

# Этап продакшн
FROM alpine:latest

WORKDIR /app
COPY --from=builder /app/.env .  
COPY --from=builder /app/main .
COPY --from=builder /app/api/views ./api/views
COPY --from=builder /app/api/assets ./api/assets

EXPOSE 3000

CMD ["./main"]