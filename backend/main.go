package main

import (
	"fmt"
	"os"

	"github.com/gofiber/fiber/v2"
	"github.com/gofiber/template/html/v2"
	"github.com/maximmikhailov1/go-labs/backend/api/initializers"
	"github.com/maximmikhailov1/go-labs/backend/api/migrations"
	"github.com/maximmikhailov1/go-labs/backend/api/routes"
	"github.com/maximmikhailov1/go-labs/backend/api/utils"
)

func init() {
	initializers.LoadEnvVariables()
	initializers.ConnectToDB()
}
func main() {
	engine := html.New("./views", ".tmpl")
	app := fiber.New(fiber.Config{
		Views: engine,
	})
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
