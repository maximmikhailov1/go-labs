package controllers

import (
	"net/http"

	"github.com/gofiber/fiber/v2"
	"github.com/maximmikhailov1/go-labs/api/initializers"
	"github.com/maximmikhailov1/go-labs/api/models"
)

func RecordCreate(c *fiber.Ctx) error {
	record := new(models.Record)
	if err := c.BodyParser(record); err != nil {
		return err
	}
	result := initializers.DB.Create(record)
	if result.Error != nil {
		return c.Status(400).JSON(result.Error)
	}

	return c.JSON(record)
}
func RecordsGet(c *fiber.Ctx) error {
	var records []models.Record
	result := initializers.DB.Find(&records)
	if result.Error != nil {
		return c.Status(404).JSON(fiber.Map{"status": "error", "message": "No records present", "data": nil})
	}
	return c.Status(http.StatusAccepted).JSON(records)
}
