package record

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

// GetUserRecords godoc
// @Summary Получить записи пользователя
// @Tags Record
// @Security ApiKeyAuth
// @Success 200 {object} object "Возвращает []UserRecordDTO для студентов или []TutorRecordResponse для преподавателей"
// @Router /records/my [get]
func (h *Handler) GetUserRecords(c *fiber.Ctx) error {
	claims := c.Locals("user").(*middleware.AuthClaims)

	records, err := h.service.GetUserRecords(claims.UserID, claims.Role)
	if err != nil {
		return fiber.NewError(fiber.StatusInternalServerError, err.Error())
	}

	return c.JSON(records)
}

// Enroll godoc
// @Summary Записаться на лабораторную работу
// @Tags Record
// @Security ApiKeyAuth
// @Param input body EnrollRequest true "Данные для записи"
// @Success 200 {object} EnrollResponse
// @Router /records/enroll [post]
func (h *Handler) Enroll(c *fiber.Ctx) error {
	claims := c.Locals("user").(*middleware.AuthClaims)
	if claims.Role != "student" {
		return fiber.NewError(fiber.StatusForbidden, "only students can enroll")
	}

	var req EnrollRequest
	if err := c.BodyParser(&req); err != nil {
		return fiber.NewError(fiber.StatusBadRequest, "invalid request body")
	}

	response, err := h.service.Enroll(claims.UserID, req)
	if err != nil {
		return fiber.NewError(fiber.StatusBadRequest, err.Error())
	}

	return c.JSON(response)
}
