package controllers

import (
	"net/http"

	"github.com/gofiber/fiber/v2"
	"github.com/maximmikhailov1/go-labs/api/initializers"
	"github.com/maximmikhailov1/go-labs/api/models"
)

func UsersIndex(c *fiber.Ctx) error {
	var users []models.User

	result := initializers.DB.Find(&users)
	if result.Error != nil {
		return result.Error
	}
	return c.Status(http.StatusAccepted).JSON(users)
}
