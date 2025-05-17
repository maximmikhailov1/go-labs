# Этап сборки
FROM golang:1.23.2-alpine AS builder

WORKDIR /app
COPY go.mod go.sum ./
COPY . .

RUN go mod download
RUN CGO_ENABLED=0 GOOS=linux go build -o backend ./cmd/main.go

# Этап продакшн
FROM alpine:latest

WORKDIR /app

COPY --from=builder /app/.env .  
COPY --from=builder /app/backend .
COPY --from=builder /app/migrations ./migrations


EXPOSE 3000

CMD ["./backend"]