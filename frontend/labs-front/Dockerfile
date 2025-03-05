# Этап сборки
FROM node:18-alpine AS builder

WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci
COPY . .
RUN npm run build

# Этап продакшн
FROM node:18-alpine

WORKDIR /app
ENV NODE_ENV production
ENV PORT 8080
ENV HOSTNAME 0.0.0.0 
# Указываем, чтобы Next.js слушал все интерфейсы

# Копируем standalone-сборку
COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static
COPY --from=builder /app/public ./public

EXPOSE 3223

CMD ["node", "server.js"]