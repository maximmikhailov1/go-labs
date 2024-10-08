package main

import (
	"github.com/gofiber/fiber/v2"
	"github.com/gofiber/template/html/v2"
)

func main() {
	//Load templates
	engine := html.New("./views", ".tmpl")
	app := fiber.New(fiber.Config{
		Views: engine,
	})

	app.Get("/", func(c *fiber.Ctx) error {
		return c.Render("index", fiber.Map{
			"Name": "Max",
		})
	})
	app.Static("/", "./public")
	app.Listen(":3000")
}
