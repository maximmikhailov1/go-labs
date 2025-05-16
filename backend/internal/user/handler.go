package user

import (
	"github.com/gofiber/fiber/v2"
	"github.com/maximmikhailov1/go-labs/backend/internal/middleware"
)

type UserHandler struct {
	service *UserService
}

func NewUserHandler(service *UserService) *UserHandler {
	return &UserHandler{service: service}
}

func (h *UserHandler) GetAllUsers(c *fiber.Ctx) error {
	// Проверка роли через middleware
	claims := c.Locals("user").(*middleware.AuthClaims)
	if claims.Role != "tutor" {
		return fiber.NewError(fiber.StatusForbidden, "access denied")
	}

	users, err := h.service.GetAllUsers()
	if err != nil {
		return fiber.NewError(fiber.StatusInternalServerError, "failed to get users")
	}

	return c.JSON(users)
}

func (h *UserHandler) GetProfile(c *fiber.Ctx) error {
	claims := c.Locals("user").(*middleware.AuthClaims)

	profile, err := h.service.GetUserProfile(claims.UserID)
	if err != nil {
		return fiber.NewError(fiber.StatusNotFound, err.Error())
	}

	return c.JSON(profile)
}

// GetTutors godoc
// @Summary Получить список преподавателей
// @Tags User
// @Security ApiKeyAuth
// @Success 200 {array} TutorResponse
// @Router /users/tutors [get]
func (h *UserHandler) GetTutors(c *fiber.Ctx) error {
	claims := c.Locals("user").(*middleware.AuthClaims)
	if claims.Role != "tutor" {
		return fiber.NewError(fiber.StatusForbidden, "access denied")
	}

	tutors, err := h.service.GetTutors()
	if err != nil {
		return fiber.NewError(fiber.StatusInternalServerError, "failed to get tutors list")
	}

	return c.JSON(tutors)
}
