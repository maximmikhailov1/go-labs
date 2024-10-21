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
	app.Post("/add-record", controllers.RecordCreate)
	app.Get("/get-records", controllers.RecordsGet)
	app.Get("/get-records/dates", controllers.RecordsDatesGet)
	app.Get("/get-records/times/:date", controllers.RecordsTimesGet)
	app.Delete("/delete-record/:id")
}
