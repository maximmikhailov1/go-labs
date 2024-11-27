package controllers

import (
	"net/http"

	"github.com/gofiber/fiber/v2"
	"github.com/maximmikhailov1/go-labs/api/initializers"
	"github.com/maximmikhailov1/go-labs/api/models"
)

func StudentGetRecords(c *fiber.Ctx) error {
	id := c.Params("id")
	records := []models.Record{}
	student := models.Student{}
	res := initializers.DB.First(&student, id)
	if res.Error != nil {
		return c.Status(http.StatusBadRequest).JSON(fiber.Map{"message": "no such student"})
	}
	initializers.DB.Model(&student).Association("Records").Find(&records)

	return c.Status(http.StatusOK).JSON(fiber.Map{"Records": records})
	// return c.Status(http.StatusAccepted).JSON(fiber.Map{"records": records})

}
func StudentRender(c *fiber.Ctx) error {

	return c.Render("studentInfo", c.Locals("student").(fiber.Map))
}
