package group

import (
	"github.com/gofiber/fiber/v2"
	"github.com/maximmikhailov1/go-labs/backend/internal/middleware"
)

type Handler struct {
	service *Service
}

func NewHandler(service *Service) *Handler {
	return &Handler{service: service}
}

// CreateGroup godoc
// @Summary Создать новую группу
// @Tags Groups
// @Security ApiKeyAuth
// @Accept json
// @Produce json
// @Param input body CreateRequest true "Данные группы"
// @Success 201 {object} GroupResponse
// @Failure 400 {object} middleware.ErrorResponse
// @Failure 403 {object} middleware.ErrorResponse
// @Failure 500 {object} middleware.ErrorResponse
// @Router /groups [post]
func (h *Handler) CreateGroup(c *fiber.Ctx) error {
	claims := c.Locals("user").(*middleware.AuthClaims)
	if claims.Role != "tutor" {
		return fiber.NewError(fiber.StatusForbidden, "only tutors can create groups")
	}

	var req CreateRequest
	if err := c.BodyParser(&req); err != nil {
		return fiber.NewError(fiber.StatusBadRequest, "invalid request body")
	}

	group, err := h.service.CreateGroup(req)
	if err != nil {
		return fiber.NewError(fiber.StatusInternalServerError, err.Error())
	}

	return c.Status(fiber.StatusCreated).JSON(group)
}

// GetAllGroups godoc
// @Summary Получить все группы
// @Tags Groups
// @Security ApiKeyAuth
// @Produce json
// @Success 200 {array} GroupWithSubjectResponse
// @Failure 403 {object} middleware.ErrorResponse
// @Failure 500 {object} middleware.ErrorResponse
// @Router /groups [get]
func (h *Handler) GetAllGroups(c *fiber.Ctx) error {
	claims := c.Locals("user").(*middleware.AuthClaims)
	if claims.Role != "tutor" {
		return fiber.NewError(fiber.StatusForbidden, "only tutors can view groups")
	}

	groups, err := h.service.GetAllGroups()
	if err != nil {
		return fiber.NewError(fiber.StatusInternalServerError, err.Error())
	}

	return c.JSON(groups)
}

// UpdateGroupSubject godoc
// @Summary Обновить предмет группы
// @Tags Groups
// @Security ApiKeyAuth
// @Accept json
// @Produce json
// @Param input body UpdateSubjectRequest true "Данные для обновления"
// @Success 204
// @Failure 400 {object} middleware.ErrorResponse
// @Failure 403 {object} middleware.ErrorResponse
// @Failure 404 {object} middleware.ErrorResponse
// @Failure 500 {object} middleware.ErrorResponse
// @Router /groups/subject [patch]
func (h *Handler) UpdateGroupSubject(c *fiber.Ctx) error {
	claims := c.Locals("user").(*middleware.AuthClaims)
	if claims.Role != "tutor" {
		return fiber.NewError(fiber.StatusForbidden, "only tutors can update groups")
	}

	var req UpdateSubjectRequest
	if err := c.BodyParser(&req); err != nil {
		return fiber.NewError(fiber.StatusBadRequest, "invalid request body")
	}

	if err := h.service.UpdateGroupSubject(req); err != nil {
		status := fiber.StatusInternalServerError
		if err.Error() == "subject not found" || err.Error() == "group not found" {
			status = fiber.StatusNotFound
		}
		return fiber.NewError(status, err.Error())
	}

	return c.SendStatus(fiber.StatusNoContent)
}

// DeleteGroup godoc
// @Summary Удалить группу
// @Tags Group
// @Security ApiKeyAuth
// @Param id path int true "ID группы"
// @Success 204
// @Router /groups/{id} [delete]
func (h *Handler) DeleteGroup(c *fiber.Ctx) error {
	claims := c.Locals("user").(*middleware.AuthClaims)
	if claims.Role != "tutor" {
		return fiber.NewError(fiber.StatusForbidden, "only tutors can delete groups")
	}

	groupID, err := c.ParamsInt("id")
	if err != nil {
		return fiber.NewError(fiber.StatusBadRequest, "invalid group ID")
	}

	if err := h.service.DeleteGroup(uint(groupID)); err != nil {
		return fiber.NewError(fiber.StatusInternalServerError, err.Error())
	}

	return c.SendStatus(fiber.StatusNoContent)
}
