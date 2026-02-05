package scoreboard

import (
	"github.com/gofiber/fiber/v2"
	"github.com/maximmikhailov1/go-labs/backend/internal/middleware"
	"github.com/maximmikhailov1/go-labs/backend/internal/models"
)

type Handler struct {
	service *Service
}

func NewHandler(service *Service) *Handler {
	return &Handler{service: service}
}

func (h *Handler) Get(c *fiber.Ctx) error {
	claims := c.Locals("user").(*middleware.AuthClaims)
	if claims.Role != models.RoleStudent {
		return fiber.NewError(fiber.StatusForbidden, "only students can view scoreboard")
	}

	list, err := h.service.GetScoreboard(c.Context(), claims.UserID)
	if err != nil {
		return fiber.NewError(fiber.StatusInternalServerError, err.Error())
	}
	return c.JSON(list)
}
