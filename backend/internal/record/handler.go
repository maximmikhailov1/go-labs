package record

import (
	"strconv"
	"time"

	"github.com/gofiber/fiber/v2"
	"github.com/maximmikhailov1/go-labs/backend/internal/middleware"
	"github.com/maximmikhailov1/go-labs/backend/internal/models"
	"gorm.io/datatypes"
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
// @Param page query int false "Page (1-based)"
// @Param limit query int false "Page size"
// @Param groupId query int false "Filter by group"
// @Param tutorId query int false "Filter by tutor"
// @Param status query string false "Filter by status"
// @Param needsGrade query bool false "Only rows needing grade"
// @Param labDateFrom query string false "Lab date from (YYYY-MM-DD)"
// @Param labDateTo query string false "Lab date to (YYYY-MM-DD)"
// @Success 200 {object} object "Студент: []UserRecordDTO. Преподаватель: { data: TutorRecordRow[], totalCount }"
// @Router /records [get]
func (h *Handler) GetUserRecords(c *fiber.Ctx) error {
	claims := c.Locals("user").(*middleware.AuthClaims)

	if claims.Role == models.RoleTutor {
		f := parseTutorRecordsFilters(c)
		rows, totalCount, err := h.service.GetTutorRecordsPaginated(c.Context(), f)
		if err != nil {
			return fiber.NewError(fiber.StatusInternalServerError, err.Error())
		}
		return c.JSON(TutorRecordsPaginatedResponse{Data: rows, TotalCount: totalCount})
	}

	records, err := h.service.GetUserRecords(claims.UserID, claims.Role)
	if err != nil {
		return fiber.NewError(fiber.StatusInternalServerError, err.Error())
	}
	return c.JSON(records)
}

func parseTutorRecordsFilters(c *fiber.Ctx) TutorRecordsFilters {
	f := TutorRecordsFilters{
		Page:  1,
		Limit: 50,
	}
	if v := c.Query("page"); v != "" {
		if p, err := strconv.Atoi(v); err == nil && p > 0 {
			f.Page = p
		}
	}
	if v := c.Query("limit"); v != "" {
		if l, err := strconv.Atoi(v); err == nil && l > 0 && l <= 100 {
			f.Limit = l
		}
	}
	if v := c.Query("groupId"); v != "" {
		if id, err := strconv.ParseUint(v, 10, 32); err == nil {
			u := uint(id)
			f.GroupID = &u
		}
	}
	if v := c.Query("tutorId"); v != "" {
		if id, err := strconv.ParseUint(v, 10, 32); err == nil {
			u := uint(id)
			f.TutorID = &u
		}
	}
	if v := c.Query("status"); v != "" {
		f.Status = v
	}
	f.NeedsGrade = c.Query("needsGrade") == "true" || c.Query("needsGrade") == "1"
	if v := c.Query("labDateFrom"); v != "" {
		if t, err := time.Parse("2006-01-02", v); err == nil {
			d := datatypes.Date(t)
			f.LabDateFrom = &d
		}
	}
	if v := c.Query("labDateTo"); v != "" {
		if t, err := time.Parse("2006-01-02", v); err == nil {
			d := datatypes.Date(t)
			f.LabDateTo = &d
		}
	}
	return f
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
	if claims.Role != models.RoleStudent {
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

func (h *Handler) PatchEntryStatus(c *fiber.Ctx) error {
	claims := c.Locals("user").(*middleware.AuthClaims)
	if claims.Role != models.RoleTutor {
		return fiber.NewError(fiber.StatusForbidden, "only tutors can update entry status")
	}

	entryID, err := c.ParamsInt("id")
	if err != nil {
		return fiber.NewError(fiber.StatusBadRequest, "invalid entry id")
	}

	var req PatchEntryStatusRequest
	if err := c.BodyParser(&req); err != nil {
		return fiber.NewError(fiber.StatusBadRequest, "invalid request body")
	}
	allowed := map[string]bool{"scheduled": true, "completed": true, "defended": true, "no_show": true, "cancelled": true}
	if !allowed[req.Status] {
		return fiber.NewError(fiber.StatusBadRequest, "invalid status")
	}

	if err := h.service.UpdateEntryStatus(c.Context(), uint(entryID), req.Status, req.UserID); err != nil {
		if err.Error() == "entry not found" {
			return fiber.NewError(fiber.StatusNotFound, err.Error())
		}
		return fiber.NewError(fiber.StatusInternalServerError, err.Error())
	}
	return c.SendStatus(fiber.StatusNoContent)
}
