package handlers

import (
	models2 "github.com/maximmikhailov1/go-labs/backend/internal/models"
	"github.com/maximmikhailov1/go-labs/backend/pkg/database"
	"net/http"
	"strconv"

	"github.com/gofiber/fiber/v2"
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
	records := []models2.Record{}
	student := models2.User{}
	res := database.DB.First(&student, id)
	if res.Error != nil {
		return c.Status(http.StatusBadRequest).JSON(fiber.Map{"message": "no such student"})
	}
	database.DB.Model(&student).Association("Records").Find(&records)

	return c.Status(http.StatusOK).JSON(fiber.Map{"Records": records})

}
func StudentRender(c *fiber.Ctx) error {
	return c.Status(http.StatusOK).Render("studentInfo", fiber.Map{})
}
