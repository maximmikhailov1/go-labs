package controllers

import (
	"net/http"
	"strconv"

	"github.com/gofiber/fiber/v2"
	"github.com/maximmikhailov1/go-labs/api/initializers"
	"github.com/maximmikhailov1/go-labs/api/models"
)

func StudentGetRecords(c *fiber.Ctx) error {
	id, err := strconv.Atoi((c.Params("id")))
	if err != nil {
		return c.Status(http.StatusNotFound).JSON(
			fiber.Map{
				"status":   "error",
				"true:err": err,
			})
	}
	if c.Locals("user") == nil || int((c.Locals("user").(fiber.Map)["Id"]).(uint)) != id {
		return c.Status(http.StatusUnauthorized).JSON(fiber.Map{"message": "unauthorized"})
	}
	records := []models.Record{}
	student := models.User{}
	res := initializers.DB.First(&student, id)
	if res.Error != nil {
		return c.Status(http.StatusBadRequest).JSON(fiber.Map{"message": "no such student"})
	}
	initializers.DB.Model(&student).Association("Records").Find(&records)

	return c.Status(http.StatusOK).JSON(fiber.Map{"Records": records})

}
func StudentRender(c *fiber.Ctx) error {
	return c.Status(http.StatusOK).Render("studentInfo", fiber.Map{})
}
