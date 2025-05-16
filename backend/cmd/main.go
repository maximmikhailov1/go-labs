package main

import (
	"fmt"
	"github.com/maximmikhailov1/go-labs/backend/internal/routes"
	"github.com/maximmikhailov1/go-labs/backend/migrations"
	"github.com/maximmikhailov1/go-labs/backend/pkg/database"
	"github.com/maximmikhailov1/go-labs/backend/pkg/utils"
	"os"

	"github.com/gofiber/fiber/v2"
)

func init() {
	utils.LoadEnvVariables()
	database.ConnectToDB()
}
func main() {
	app := fiber.New(fiber.Config{})

	fiber.SetParserDecoder(fiber.ParserConfig{
		IgnoreUnknownKeys: true,
		ParserType:        []fiber.ParserType{utils.AddDateParser()},
		ZeroEmpty:         true,
	})

	routes.SetupRoutes(app)
	ip := fmt.Sprintf(":%s", os.Getenv("PORT"))
	migrations.Migrate()
	app.Listen(ip)
}

//TODO: Придумать как узнать на какую конкретно лабу записался студент (возможно придётся ввести какую-то тройную таблицу, но звучит как кринж)
//TODO: Добавить выполненные лабы на studentInfo
//TODO: Развесить аутентификация на руты и побить на группы App.Group
//TODO: Если будет пытать попасть туда куда не должен выдавать unauthorized
//TODO: Сделать так чтобы на главную страницу нельзя было попасть без аутентификации
