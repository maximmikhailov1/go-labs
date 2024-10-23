package controllers

import (
	"net/http"
	"time"

	"github.com/gofiber/fiber/v2"
	"github.com/gofiber/fiber/v2/log"
	"github.com/maximmikhailov1/go-labs/api/initializers"
	"github.com/maximmikhailov1/go-labs/api/models"
)

func RecordCreate(c *fiber.Ctx) error {
	record := new(models.Record)
	if err := c.BodyParser(record); err != nil {
		log.Info(err)
		return err
	}
	result := initializers.DB.Create(record)
	if result.Error != nil {
		return c.Status(400).JSON(result.Error)
	}

	return c.JSON(record)
}
func RecordsGet(c *fiber.Ctx) error {
	var records []models.Record
	//TODO: FIX ORDER
	result := initializers.DB.Order("lab_date ASC").Find(&records)
	if result.Error != nil {
		return c.Status(404).JSON(fiber.Map{"status": "error", "message": "No records present", "data": nil})
	}
	return c.Status(http.StatusAccepted).JSON(records)
}
func RecordDelete(c *fiber.Ctx) error {
	//TODO: TEST DELETE
	id := c.Params("id")
	result := initializers.DB.Delete(&models.Record{}, id)
	if result.Error != nil {
		return c.Status(http.StatusBadRequest).JSON(fiber.Map{"status": "error", "message": "No record with given id"})
	}
	return c.Status(http.StatusAccepted).JSON(fiber.Map{"status": "success", "message": "deleted successfully"})
}
func RecordsDatesGet(c *fiber.Ctx) error {
	var recordsDate []models.Record
	initializers.DB.Model(&recordsDate).Distinct().Pluck("lab_date", &recordsDate)
	dates := make([]string, len(recordsDate))

	for i, record := range recordsDate {
		date, err := record.LabDate.Value()
		dateA := date.(time.Time)
		if err != nil {
			return c.Status(http.StatusBadRequest).JSON(fiber.Map{"status": "error", "message": "Wrong date"})
		}
		dates[i] = dateA.Format("2006-01-02")

	}

	return c.JSON(dates)
}

func RecordsClassesGet(c *fiber.Ctx) error {
	dateStr := c.Params("date")

	// Запрос к базе данных для получения времен для выбранной даты
	var recordClasses []models.Record // или другая модель, хранящая времена
	initializers.DB.Model(&recordClasses).Where("lab_date = ?", dateStr).Pluck("class_number", &recordClasses)
	times := make([]int, len(recordClasses))
	for i, time := range recordClasses {
		times[i] = time.ClassNumber
	}

	return c.JSON(times)
}
