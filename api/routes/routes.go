package routes

import (
	"github.com/gofiber/fiber/v2"
	"github.com/maximmikhailov1/go-labs/api/controllers"
)

func SetupRoutes(app *fiber.App) {
	//Static files mounting
	app.Static("/static", "./public/assets")
	//Renders config
	app.Get("/", func(c *fiber.Ctx) error {
		return c.Render("index", fiber.Map{})
	})
	app.Get("/records", func(c *fiber.Ctx) error {
		return c.Render("records", fiber.Map{})
	})
	app.Get("/records/:id", func(c *fiber.Ctx) error {
		return c.Render("recordInfo", fiber.Map{})
	})
	app.Get("/labs", func(c *fiber.Ctx) error {
		return c.Render("labs", fiber.Map{})
	})

	//API Routes
	//RECORDS
	app.Post("/api/records", controllers.RecordCreate)
	app.Get("/api/records", controllers.RecordsGet)
	app.Get("/api/records/dates", controllers.RecordsDatesGet)
	app.Get("/api/records/times/:date", controllers.RecordsClassesGet)
	app.Get("/api/records/:id", controllers.RecordIndexRedirect)
	app.Delete("/api/records/:id", controllers.RecordDelete)
	//LABS
	app.Post("/api/labs", controllers.LabCreate)
	app.Get("/api/labs", controllers.LabsGet)
	app.Delete("/api/labs/:id", controllers.LabDelete)
	app.Get("/api/labs/numbers", controllers.LabsNumbersGet)
	//REGISTRATION
	app.Post("/api/registration", controllers.Register)
}
