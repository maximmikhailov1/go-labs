package controllers

import (
	"github.com/gofiber/fiber/v2"
	"github.com/maximmikhailov1/go-labs/api/initializers"
	"github.com/maximmikhailov1/go-labs/api/models"
)

func StudentGetRecords(c *fiber.Ctx) error {
	id := c.Params("id")
	record := models.Record{}
	student := models.Student{}
	initializers.DB.First(&student, id).Association("Record").Find(&record)

	return c.Render("studentInfo", fiber.Map{
		"records": record,
	})
}
