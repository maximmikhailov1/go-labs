package handlers

import (
	"net/http"

	"github.com/gofiber/fiber/v2"
)

func IndexRender(c *fiber.Ctx) error {
	return c.Status(http.StatusOK).Render("index", c.Locals("user"))
}
