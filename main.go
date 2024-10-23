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
