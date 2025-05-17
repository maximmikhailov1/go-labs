package lab

import (
	"github.com/gofiber/fiber/v2"
	"github.com/maximmikhailov1/go-labs/backend/internal/middleware"
	"strconv"
)

type Handler struct {
	service *Service
}

func NewHandler(service *Service) *Handler {
	return &Handler{service: service}
}

// GetLabsBySubject godoc
// @Summary Получить лабораторные работы по предмету
// @Tags Lab
// @Param subjectId query int true "ID предмета"
// @Success 200 {array} LabResponse
// @Router /labs/by-subject [get]
func (h *Handler) GetLabsBySubject(c *fiber.Ctx) error {
	subjectID, err := strconv.Atoi(c.Query("subjectId"))
	if err != nil || subjectID <= 0 {
		return fiber.NewError(fiber.StatusBadRequest, "invalid subject ID")
	}

	labs, err := h.service.GetLabsBySubject(uint(subjectID))
	if err != nil {
		return fiber.NewError(fiber.StatusInternalServerError, err.Error())
	}

	return c.JSON(labs)
}

// GetUserLabs godoc
// @Summary Получить лабораторные работы пользователя
// @Tags Lab
// @Security ApiKeyAuth
// @Success 200 {array} LabResponse
// @Router /labs/my [get]
func (h *Handler) GetUserLabs(c *fiber.Ctx) error {
	claims := c.Locals("user").(*middleware.AuthClaims)

	if claims.Role != "student" {
		return c.JSON([]LabResponse{})
	}

	if claims.Group == "" {
		return fiber.NewError(fiber.StatusBadRequest, "user has no group")
	}

	labs, err := h.service.GetLabsByGroup(claims.Group)
	if err != nil {
		return fiber.NewError(fiber.StatusInternalServerError, err.Error())
	}

	return c.JSON(labs)
}

// CreateLab godoc
// @Summary Создать лабораторную работу
// @Tags Lab
// @Security ApiKeyAuth
// @Param input body CreateRequest true "Данные лабораторной работы"
// @Success 201 {object} LabResponse
// @Router /labs [post]
func (h *Handler) CreateLab(c *fiber.Ctx) error {
	claims := c.Locals("user").(*middleware.AuthClaims)
	if claims.Role != "tutor" {
		return fiber.NewError(fiber.StatusForbidden, "only tutors can create labs")
	}

	var req CreateRequest
	if err := c.BodyParser(&req); err != nil {
		return fiber.NewError(fiber.StatusBadRequest, "invalid request body")
	}

	lab, err := h.service.CreateLab(req)
	if err != nil {
		return fiber.NewError(fiber.StatusInternalServerError, err.Error())
	}

	return c.Status(fiber.StatusCreated).JSON(lab)
}

// DeleteLab godoc
// @Summary Удалить лабораторную работу
// @Tags Lab
// @Security ApiKeyAuth
// @Param id path int true "ID лабораторной работы"
// @Success 204
// @Router /labs/{id} [delete]
func (h *Handler) DeleteLab(c *fiber.Ctx) error {
	claims := c.Locals("user").(*middleware.AuthClaims)
	if claims.Role != "tutor" {
		return fiber.NewError(fiber.StatusForbidden, "only tutors can delete labs")
	}

	id, err := strconv.Atoi(c.Params("id"))
	if err != nil || id <= 0 {
		return fiber.NewError(fiber.StatusBadRequest, "invalid lab ID")
	}

	if err := h.service.DeleteLab(uint(id)); err != nil {
		return fiber.NewError(fiber.StatusInternalServerError, "failed to delete lab")
	}

	return c.SendStatus(fiber.StatusNoContent)
}

// GetLabNumbers godoc
// @Summary Получить уникальные номера лабораторных работ
// @Tags Lab
// @Success 200 {object} NumbersResponse
// @Router /labs/numbers [get]
func (h *Handler) GetLabNumbers(c *fiber.Ctx) error {
	numbers, err := h.service.GetUniqueNumbers()
	if err != nil {
		return fiber.NewError(fiber.StatusInternalServerError, err.Error())
	}

	return c.JSON(numbers)
}
