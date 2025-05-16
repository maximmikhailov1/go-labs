package schedule

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

// CreateSchedule godoc
// @Summary Создать запись расписания
// @Tags Schedule
// @Security ApiKeyAuth
// @Param input body CreateRequest true "Данные расписания"
// @Success 201 {object} RecordResponse
// @Router /schedule [post]
func (h *Handler) CreateSchedule(c *fiber.Ctx) error {
	claims := c.Locals("user").(*middleware.AuthClaims)
	if claims.Role != "tutor" {
		return fiber.NewError(fiber.StatusForbidden, "only tutors can create schedule records")
	}

	var req CreateRequest
	if err := c.BodyParser(&req); err != nil {
		return fiber.NewError(fiber.StatusBadRequest, "invalid request body")
	}

	response, err := h.service.CreateRecord(req, claims.UserID)
	if err != nil {
		return fiber.NewError(fiber.StatusInternalServerError, "failed to create schedule record")
	}

	return c.Status(fiber.StatusCreated).JSON(response)
}

func (h *Handler) Unsubscribe(c *fiber.Ctx) error {
	claims := c.Locals("user").(*middleware.AuthClaims)

	var req UnsubscribeRequest
	if err := c.BodyParser(&req); err != nil {
		return fiber.NewError(fiber.StatusBadRequest, "invalid request body")
	}

	response, err := h.service.Unsubscribe(claims.UserID, claims.Role, req)
	if err != nil {
		return fiber.NewError(fiber.StatusBadRequest, err.Error())
	}

	return c.JSON(response)
}

// GetWeekSchedule godoc
// @Summary Получить расписание на неделю
// @Tags Schedule
// @Param week query int true "Номер недели (0 - текущая, 1 - следующая и т.д.)"
// @Success 200 {array} WeekScheduleResponse
// @Router /schedule/week [get]
func (h *Handler) GetWeekSchedule(c *fiber.Ctx) error {
	weekNumberStr := c.Query("week")
	weekNumber, err := strconv.Atoi(weekNumberStr)
	if err != nil {
		return fiber.NewError(fiber.StatusBadRequest, "invalid week number")
	}

	schedule, err := h.service.GetWeekSchedule(weekNumber)
	if err != nil {
		return fiber.NewError(fiber.StatusInternalServerError, err.Error())
	}

	return c.JSON(schedule)
}
