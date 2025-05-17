package team

import (
	"github.com/gofiber/fiber/v2"
	"github.com/gofiber/fiber/v2/log"
	"github.com/maximmikhailov1/go-labs/backend/internal/middleware"
)

type Handler struct {
	service *Service
}

func NewHandler(service *Service) *Handler {
	return &Handler{service: service}
}

// CreateTeam godoc
// @Summary Создать новую команду
// @Tags Team
// @Security ApiKeyAuth
// @Param input body CreateRequest true "Данные команды"
// @Success 201 {object} TeamResponse
// @Router /team [post]
func (h *Handler) CreateTeam(c *fiber.Ctx) error {
	claims := c.Locals("user").(*middleware.AuthClaims)

	var req CreateRequest
	if err := c.BodyParser(&req); err != nil {
		return fiber.NewError(fiber.StatusBadRequest, "invalid request body")
	}

	response, err := h.service.CreateTeam(req, claims.UserID)
	if err != nil {
		return fiber.NewError(fiber.StatusBadRequest, err.Error())
	}

	return c.Status(fiber.StatusCreated).JSON(response)
}

// JoinTeam godoc
// @Summary Вступить в команду
// @Tags Team
// @Security ApiKeyAuth
// @Param code query string true "Код команды"
// @Success 200 {object} TeamResponse
// @Router /team/join [post]
func (h *Handler) JoinTeam(c *fiber.Ctx) error {
	claims := c.Locals("user").(*middleware.AuthClaims)
	code := c.Query("code")

	if code == "" {
		return fiber.NewError(fiber.StatusBadRequest, "team code is required")
	}

	response, err := h.service.JoinTeam(code, claims.UserID)
	if err != nil {
		return fiber.NewError(fiber.StatusBadRequest, err.Error())
	}

	return c.JSON(response)
}

// LeaveTeam godoc
// @Summary Покинуть команду
// @Tags Team
// @Security ApiKeyAuth
// @Param code query string true "Код команды"
// @Success 204
// @Router /team/leave [delete]
func (h *Handler) LeaveTeam(c *fiber.Ctx) error {
	claims := c.Locals("user").(*middleware.AuthClaims)
	code := c.Query("code")

	if code == "" {
		return fiber.NewError(fiber.StatusBadRequest, "team code is required")
	}

	if err := h.service.LeaveTeam(code, claims.UserID); err != nil {
		return fiber.NewError(fiber.StatusBadRequest, err.Error())
	}

	return c.SendStatus(fiber.StatusNoContent)
}

// UpdateTeamName godoc
// @Summary Изменить название команды
// @Tags Team
// @Security ApiKeyAuth
// @Param code query string true "Код команды"
// @Param input body UpdateNameRequest true "Новое название"
// @Success 200 {object} TeamResponse
// @Router /team/name [patch]
func (h *Handler) UpdateTeamName(c *fiber.Ctx) error {
	claims := c.Locals("user").(*middleware.AuthClaims)
	code := c.Query("code")

	var req UpdateNameRequest
	if err := c.BodyParser(&req); err != nil {
		return fiber.NewError(fiber.StatusBadRequest, "invalid request body")
	}

	if code == "" {
		return fiber.NewError(fiber.StatusBadRequest, "team code is required")
	}

	response, err := h.service.UpdateTeamName(code, claims.UserID, req.NewName)
	if err != nil {
		return fiber.NewError(fiber.StatusBadRequest, err.Error())
	}

	return c.JSON(response)
}

// GetUserTeams godoc
// @Summary Получить команды пользователя
// @Tags Team
// @Security ApiKeyAuth
// @Success 200 {array} TeamWithMembers
// @Router /team/my [get]
func (h *Handler) GetUserTeams(c *fiber.Ctx) error {
	claims := c.Locals("user").(*middleware.AuthClaims)
	log.Info(claims)
	teams, err := h.service.GetUserTeams(claims.UserID)
	if err != nil {
		return fiber.NewError(fiber.StatusInternalServerError, err.Error())
	}

	return c.JSON(teams)
}
