# go-labs

Система записи на лабораторные работы: студенты и преподаватели, группы, предметы, расписание, команды.

## Стек

- Backend: Go 1.23, Fiber, GORM, PostgreSQL, JWT (cookie)
- Frontend: Next.js, React
- Инфраструктура: Docker, Traefik (prod)

## Локальный запуск (Docker)

Собрать и поднять все сервисы без Traefik:

```bash
cp env.example .env
# При необходимости отредактировать .env (SECRET, TUTOR_SECRET, пароль БД)

docker compose -f docker-compose.local.yml up --build
```

- Frontend: http://localhost:3001
- Backend API: http://localhost:3000
- PostgreSQL: localhost:5432 (логин/пароль из .env)

Остановка: `docker compose -f docker-compose.local.yml down`.

## Тесты (backend)

Требуется установленный Go.

```bash
cd backend
go test ./...
```

Тесты: `internal/auth` (SignIn/SignUp с моком), `internal/middleware` (JWT, отсутствие cookie), `internal/record` (некорректная роль).
