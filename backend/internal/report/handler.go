package report

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

// GenerateReport godoc
// @Summary Generate and download report
// @Tags Report
// @Security ApiKeyAuth
// @Accept json
// @Produce octet-stream
// @Param input body GenerateReportRequest true "Record IDs"
// @Success 200 {file} file "Report file"
// @Router /report/generate [post]
func (h *Handler) GenerateReport(c *fiber.Ctx) error {
	claims := c.Locals("user").(*middleware.AuthClaims)
	if claims.Role != "tutor" {
		return fiber.NewError(fiber.StatusForbidden, "только для преподавателей")
	}

	var req GenerateReportRequest
	if err := c.BodyParser(&req); err != nil {
		return fiber.NewError(fiber.StatusBadRequest, "неверный формат запроса")
	}

	buf, err := h.service.GenerateReport(req.RecordIDs)
	if err != nil {
		return fiber.NewError(fiber.StatusInternalServerError, err.Error())
	}

	c.Set("Content-Type", "application/vnd.openxmlformats-officedocument.wordprocessingml.document")
	c.Set("Content-Disposition", "attachment; filename=report.docx")

	return c.Send(buf.Bytes())
}
