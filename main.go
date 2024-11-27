package main

import (
	"fmt"
	"os"

	"github.com/gofiber/fiber/v2"
	"github.com/gofiber/template/html/v2"
	"github.com/maximmikhailov1/go-labs/api/initializers"
	"github.com/maximmikhailov1/go-labs/api/routes"
	"github.com/maximmikhailov1/go-labs/api/utils"
)

func init() {
	initializers.LoadEnvVariables()
	initializers.ConnectToDB()
}
func main() {
	//Load templates
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
	ip := fmt.Sprintf("%s:%s", os.Getenv("IP_LOCAL"), os.Getenv("PORT_LOCAL"))
	app.Listen(ip)
}

//TODO: Придумать как узнать на какую конкретно лабу записался студент (возможно придётся ввести какую-то тройную таблицу, но звучит как кринж)
//TODO: Добавить кол-во оставшихся роутеров на recordInfo
//TODO: Добавить выполненные лабы на studentInfo
//TODO: Сделать как просили с календареком
