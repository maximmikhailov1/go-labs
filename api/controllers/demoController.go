package controllers

import (
	"fmt"
	"net/http"
	"strconv"
	"time"

	"github.com/gofiber/fiber/v2"
	"github.com/gofiber/fiber/v2/log"
	"github.com/maximmikhailov1/go-labs/api/initializers"
	"github.com/maximmikhailov1/go-labs/api/models"
	"github.com/maximmikhailov1/go-labs/api/utils"
)

func UsersIndex(c *fiber.Ctx) error {
	var users []models.User

	result := initializers.DB.Find(&users)
	if result.Error != nil {
		return result.Error
	}
	return c.Status(http.StatusAccepted).JSON(users)
}

// TODO: переделать этот метод чтобы тут можно было реально создать команду,
// а то что тут перенести в хук на создание нового пользователя
func CreateTeam(c *fiber.Ctx) error {
	utils.GenerateRandomCode(6)
	if c.Locals("student") == nil {
		return c.Status(http.StatusUnauthorized).JSON(fiber.Map{"message": "unauthorized"})
	}
	studentCred := c.Locals("student").(fiber.Map)
	studentID := int((studentCred["Id"]).(uint))
	studentSecondName := studentCred["SecondName"].(string)
	studentInitTeamCode, err := utils.GenerateRandomCode(6)
	if err != nil {
		return err
	}
	var team = models.Team{
		Code: studentInitTeamCode,
		Name: fmt.Sprintf("Команда %s", studentSecondName),
	}
	var student models.User
	result := initializers.DB.Where("id = ?", studentID).First(&student)
	if result.Error != nil {
		return result.Error
	}
	result = initializers.DB.Create(&team)
	if result.Error != nil {
		return result.Error
	}
	appRes := initializers.DB.Model(&team).Association("Students").Append(&student)
	if appRes != nil {
		return appRes
	}
	return c.Status(http.StatusOK).JSON(fiber.Map{
		"team":    team,
		"student": student,
	})
}

func EnterTeam(c *fiber.Ctx) error {
	if c.Locals("student") == nil {
		return c.Status(http.StatusUnauthorized).JSON(fiber.Map{"message": "unauthorized"})
	}
	teamCode := c.Query("code")
	if teamCode == "" {
		return c.Status(http.StatusBadRequest).JSON("provide a group code")
	}
	studentCred := c.Locals("student").(fiber.Map)
	studentID := int((studentCred["Id"]).(uint))
	var student models.User
	result := initializers.DB.Where("id = ?", studentID).First(&student)
	if result.Error != nil {
		return result.Error
	}
	var teamWanted models.Team
	result = initializers.DB.Where("code = ?", teamCode).First(&teamWanted)
	if result.Error != nil {
		return result.Error
	}
	err := initializers.DB.Model(&teamWanted).Association("Students").Append(&student)
	if err != nil {
		return err
	}
	return c.Status(http.StatusOK).JSON("successful")
}

func ChangeTeamName(c *fiber.Ctx) error {
	if c.Locals("student") == nil {
		return c.Status(http.StatusUnauthorized).JSON(fiber.Map{"message": "unauthorized"})
	}
	teamCode := c.Query("code")
	teamNewName := c.Query("new_name")
	if teamCode == "" {
		return c.Status(http.StatusBadRequest).JSON("provide a group code")
	}
	if teamNewName == "" {
		return c.Status(http.StatusBadRequest).JSON("provide a new name")
	}
	studentCred := c.Locals("student").(fiber.Map)
	studentID := ((studentCred["Id"]).(uint))
	var student models.User
	student.ID = (studentID)
	var team models.Team // team.code - UNIQUE поэтому не боимся не использовать слайс
	initializers.DB.Model(&student).Where("code = ?", teamCode).Association("Teams").Find(&team)
	if team.Code == "" {
		return c.Status(http.StatusBadRequest).JSON("команда не существует или вы в ней не состоите")
	}
	// initializers.DB.Model(&teams).Association("Teams").Find(&student)
	initializers.DB.Model(&team).Update("name", teamNewName)
	return c.Status(http.StatusOK).JSON("successful")
}

func ViewTeams(c *fiber.Ctx) error {
	// var teams []models.Team
	// var students []models.User
	if c.Locals("student") == nil {
		return c.Status(http.StatusUnauthorized).JSON(fiber.Map{"message": "unauthorized"})
	}
	var student models.User
	studentCred := c.Locals("student").(fiber.Map)
	studentID, ok := ((studentCred["Id"]).(uint))
	if !ok {
		return c.Status(http.StatusBadRequest).JSON("bad credentials")
	}

	result := initializers.DB.First(&student, studentID)

	if result.Error != nil {
		return c.Status(http.StatusUnauthorized).JSON("not authorized")
	}

	result = initializers.DB.Preload("Teams.Students").Find(&student)
	// initializers.DB.Debug().Preload("Students").Find(&teams)
	// initializers.DB.Debug().Preload("Teams.Students").Find(&student)
	if result.Error != nil {
		return c.Status(http.StatusBadRequest).JSON(result.Error)
	}
	return c.Status(http.StatusOK).JSON(student.Teams) //TODO: Сделать чтобы лишней информации не слать
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
	//initializers.DB.Debug().Where("lab_date BETWEEN ? AND ?", weekStart, weekEnd).Find(&records)
	if result.Error != nil {
		return result.Error
	}
	log.Info(records)
	return c.Status(http.StatusOK).JSON(records)
}
