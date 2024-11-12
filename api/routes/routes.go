package routes

import (
	"github.com/gofiber/fiber/v2"
	"github.com/gofiber/fiber/v2/middleware/monitor"
	"github.com/maximmikhailov1/go-labs/api/controllers"
)

func SetupRoutes(app *fiber.App) {
	//Static files mounting
	app.Static("/static", "./public/assets")
	//Renders config
	app.Get("/", func(c *fiber.Ctx) error {
		return c.Render("index", fiber.Map{"Name": "Maxim Mikhailov"})
	})
	app.Get("/records", func(c *fiber.Ctx) error {
		return c.Render("records", fiber.Map{})
	})
	app.Get("/labs", func(c *fiber.Ctx) error {
		return c.Render("labs", fiber.Map{})
	})
	app.Get("/auth", func(c *fiber.Ctx) error {
		return c.Render("auth", fiber.Map{})
	})

	//API Routes
	app.Post("/api/login", controllers.SingIn)
	app.Post("/api/register", controllers.SignUp)
	app.Get("/api/validate", controllers.Validate)
	app.Get("/metrics", monitor.New()) //default fiber metrics
	//RECORDS
	app.Post("/api/records", controllers.RecordCreate)
	app.Get("/api/records", controllers.RecordsGet)
	app.Get("/api/records/dates", controllers.RecordsDatesGet)
	app.Get("/api/records/times/:date", controllers.RecordsClassesGet)
	app.Get("/api/records/:id", controllers.RecordIndex)
	app.Delete("/api/records/:id", controllers.RecordDelete)
	//LABS
	app.Post("/api/labs", controllers.LabCreate)
	app.Get("/api/labs", controllers.LabsGet)
	app.Delete("/api/labs/:id", controllers.LabDelete)
	app.Get("/api/labs/numbers", controllers.LabsNumbersGet)
	//REGISTRATION
	app.Post("/api/registration", controllers.RegisterAppointment)
}
