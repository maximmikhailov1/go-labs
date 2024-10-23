package routes

import (
	"github.com/gofiber/fiber/v2"
	"github.com/maximmikhailov1/go-labs/api/controllers"
)

func SetupRoutes(app *fiber.App) {
	app.Static("/static", "./public/assets")
	app.Get("/", func(c *fiber.Ctx) error {
		return c.Render("index", fiber.Map{})
	})
	app.Get("/records", func(c *fiber.Ctx) error {
		return c.Render("records", fiber.Map{})
	})
	app.Get("/records/:id", func(c *fiber.Ctx) error {
		return c.Render("recordInfo", fiber.Map{})
	})
	app.Post("/api/records", controllers.RecordCreate)
	app.Get("/api/records", controllers.RecordsGet)
	app.Get("/api/records/dates", controllers.RecordsDatesGet)
	app.Get("/api/records/times/:date", controllers.RecordsClassesGet)
	app.Get("/api/records/:id", controllers.RecordIndexRedirect)
	app.Delete("/api/records/:id", controllers.RecordDelete)

}
