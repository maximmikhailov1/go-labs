package controllers

import (
	"net/http"

	"github.com/gofiber/fiber/v2"
	"github.com/gofiber/fiber/v2/log"
	"github.com/maximmikhailov1/go-labs/backend/api/initializers"
	"github.com/maximmikhailov1/go-labs/backend/api/models"
)

func LabCreate(c *fiber.Ctx) error {
	lab := new(models.Lab)
	if err := c.BodyParser(lab); err != nil {
		log.Info(err)
		return err
	}
	result := initializers.DB.Create(lab)
	if result.Error != nil {
		return c.Status(400).JSON(result.Error)
	}

	return c.JSON(lab)
}
func LabsGet(c *fiber.Ctx) error {
	var labs []models.Lab
	result := initializers.DB.Find(&labs)
	if result.Error != nil {
		log.Info(result.Error)
	}
	return c.Status(http.StatusAccepted).JSON(labs)
}
func LabDelete(c *fiber.Ctx) error {
	id := c.Params("id")

	userCredentials := c.Locals("user").(fiber.Map)
	role := userCredentials["Role"].(string)

	if role != "tutor" {
		return c.Status(http.StatusUnauthorized).JSON(fiber.Map{
			"error": "unauthorized to perform this action",
		})
	}

	result := initializers.DB.Delete(&models.Lab{}, id)
	if result.Error != nil {
		return c.Status(http.StatusBadRequest).JSON(
			fiber.Map{
				"status":  "error",
				"message": "No lab with given id",
			})
	}
	return c.Status(http.StatusAccepted).JSON(
		fiber.Map{
			"status":  "success",
			"message": "deleted successfully",
		})
}
func LabsNumbersGet(c *fiber.Ctx) error {
	var labNumbers []models.Lab
	initializers.DB.Model(&labNumbers).
		Distinct().
		Pluck("number", &labNumbers)
	numbers := make([]string, len(labNumbers))

	for i, labNumber := range labNumbers {
		number := labNumber.Number
		numbers[i] = number
	}
	return c.Status(http.StatusOK).JSON(numbers)
}
