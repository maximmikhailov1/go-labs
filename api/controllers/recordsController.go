package controllers

import (
	"net/http"
	"time"

	"github.com/gofiber/fiber/v2"
	"github.com/maximmikhailov1/go-labs/api/initializers"
	"github.com/maximmikhailov1/go-labs/api/models"
)

func RecordCreate(c *fiber.Ctx) error {
	record := new(models.Record)
	if err := c.BodyParser(record); err != nil {
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
	result := initializers.DB.Order("lab_time_start ASC").Find(&records)
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
	// Запрос к базе данных
	var recordsDate []models.Record // или другая модель, хранящая даты
	initializers.DB.Model(&recordsDate).Distinct().Pluck("LabTimeStart", &recordsDate)
	// Преобразование дат в строки (формат YYYY-MM-DD)
	dates := make([]string, len(recordsDate))
	for i, record := range recordsDate {
		dates[i] = record.LabTimeStart.Format("2006-01-02")
	}

	return c.JSON(dates)
}

func RecordsTimesGet(c *fiber.Ctx) error {
	dateStr := c.Params("date")
	date, err := time.Parse("2006-01-02", dateStr)
	dateNextDay := date.Add(time.Hour * 24)
	if err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{"message": "Неверный формат даты"})
	}

	// Запрос к базе данных для получения времен для выбранной даты
	var recordTimes []models.Record // или другая модель, хранящая времена
	initializers.DB.Model(&recordTimes).Where("lab_time_start BETWEEN ? AND ?", date, dateNextDay).Pluck("LabTimeStart", &recordTimes)
	times := make([]string, len(recordTimes))
	// Преобразование времен в строки (формат HH:MM)
	for i, time := range recordTimes {
		times[i] = time.LabTimeStart.Format("15:04") // 15:04 - формат HH:MM
	}

	return c.JSON(times)
}
