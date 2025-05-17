package subject

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

// CreateSubject godoc
// @Summary Создать новый предмет
// @Tags Subjects
// @Security ApiKeyAuth
// @Param input body SubjectRequest true "Данные предмета"
// @Success 201 {object} SubjectResponse
// @Router /subjects [post]
func (h *Handler) CreateSubject(c *fiber.Ctx) error {
	claims := c.Locals("user").(*middleware.AuthClaims)
	if claims.Role != "tutor" {
		return fiber.NewError(fiber.StatusForbidden, "only tutors can create subjects")
	}

	var req SubjectRequest
	if err := c.BodyParser(&req); err != nil {
		return fiber.NewError(fiber.StatusBadRequest, "invalid request body")
	}

	subject, err := h.service.CreateSubject(req)
	if err != nil {
		return fiber.NewError(fiber.StatusInternalServerError, "failed to create subject")
	}

	return c.Status(fiber.StatusCreated).JSON(subject)
}

// GetAllSubjects godoc
// @Summary Получить все предметы
// @Tags Subjects
// @Security ApiKeyAuth
// @Success 200 {array} SubjectResponse
// @Router /subjects [get]
func (h *Handler) GetAllSubjects(c *fiber.Ctx) error {
	claims := c.Locals("user").(*middleware.AuthClaims)
	if claims.Role != "tutor" {
		return fiber.NewError(fiber.StatusForbidden, "only tutors can view subjects")
	}

	subjects, err := h.service.GetAllSubjects()
	if err != nil {
		return fiber.NewError(fiber.StatusInternalServerError, "failed to get subjects")
	}

	return c.JSON(subjects)
}
