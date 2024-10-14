package main

import (
	"github.com/gofiber/fiber/v2"
	"github.com/gofiber/template/html/v2"
	"github.com/maximmikhailov1/go-labs/api/initializers"
	"github.com/maximmikhailov1/go-labs/api/routes"
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
	routes.SetupRoutes(app)
	app.Listen(":3000")
}
