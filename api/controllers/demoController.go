package controllers

import (
	"net/http"
	"strconv"
	"time"

	"github.com/gofiber/fiber/v2"
	"github.com/gofiber/fiber/v2/log"
	"github.com/maximmikhailov1/go-labs/api/initializers"
	"github.com/maximmikhailov1/go-labs/api/models"
)

func UsersIndex(c *fiber.Ctx) error {
	var users []models.User

	result := initializers.DB.Find(&users)
	if result.Error != nil {
		return result.Error
	}
	return c.Status(http.StatusAccepted).JSON(users)
}

func EnrollLab(c *fiber.Ctx) error {
	var body struct {
		Date       string
		SlotNumber int
	}
	if err := c.BodyParser(&body); err != nil {
		log.Info(err)
		return err
	}
	log.Info(body)
	return c.Status(http.StatusOK).JSON(fiber.Map{})
}

func ScheduleWeek(c *fiber.Ctx) error {
	var records []models.Record
	weekNumberStr := c.Query("week")
	log.Info(weekNumberStr)
	weekNumber, err := strconv.Atoi(weekNumberStr)
	if err != nil {
		return err
	}
	currentTime := time.Now()
	week := int(time.Hour) * 24 * 7
	log.Info(currentTime)
	offsetTime := currentTime.Add(time.Duration(week * weekNumber))
	currentWeekdayNumber := int(offsetTime.Weekday())
	timeToWeekStart := -time.Duration(currentWeekdayNumber * int(time.Hour) * 24)
	weekStart := offsetTime.Add(timeToWeekStart)
	timeToWeekEnd := time.Duration(int(time.Hour) * 24 * (7 - currentWeekdayNumber))
	weekEnd := offsetTime.Add(timeToWeekEnd)

	result := initializers.DB.Where("lab_date BETWEEN ? AND ?", weekStart, weekEnd).Find(&records)
	initializers.DB.Debug().Where("lab_date BETWEEN ? AND ?", weekStart, weekEnd).Find(&records)
	if result.Error != nil {
		return result.Error
	}
	log.Info(records)
	return c.Status(http.StatusOK).JSON(records)
}
