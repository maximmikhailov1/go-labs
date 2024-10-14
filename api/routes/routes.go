package routes

import (
	"github.com/gofiber/fiber/v2"
	"github.com/maximmikhailov1/go-labs/api/controllers"
)

func SetupRoutes(app *fiber.App) {
	app.Static("/", "./public")
	app.Get("/", func(c *fiber.Ctx) error {
		return c.Render("index", fiber.Map{
			"Name": "Max",
		})
	})
	app.Post("/add-record", controllers.RecordCreate)
	app.Get("/get-records", controllers.RecordsGet)
}
