package middleware

import (
	"github.com/gofiber/fiber/v2"
)

func Auth(c *fiber.Ctx) error {
	tokenString := c.Cookies("auth")
	if tokenString == "" {
		c.JSON(fiber.Map{"message": "not logged in"})
	}

	c.Next()
	return nil
}
