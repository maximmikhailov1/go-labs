package controllers

import (
	"fmt"
	"net/http"
	"os"
	"strconv"
	"time"

	"github.com/gofiber/fiber/v2"
	"github.com/gofiber/fiber/v2/log"
	"github.com/golang-jwt/jwt/v5"
	"github.com/maximmikhailov1/go-labs/api/initializers"
	"github.com/maximmikhailov1/go-labs/api/models"
	"github.com/maximmikhailov1/go-labs/api/utils"
	"gorm.io/gorm"
)

func UsersIndex(c *fiber.Ctx) error {
	var users []models.User

	result := initializers.DB.Find(&users)
	if result.Error != nil {
		return result.Error
	}
	return c.Status(http.StatusAccepted).JSON(users)
}

func UserFirst(c *fiber.Ctx) error {

	if c.Locals("user") == nil {
		return c.Status(http.StatusUnauthorized).JSON(fiber.Map{"message": "unauthorized"})
	}
	userCredentials := c.Locals("user").(fiber.Map)
	fio := userCredentials["FullName"].(string)
	groupName := userCredentials["Group"].(string)
	var resp struct {
		FullName  string
		GroupName string
	}
	resp.FullName = fio
	resp.GroupName = groupName
	log.Info(resp)
	return c.Status(http.StatusOK).JSON(resp)
}

func CreateTeam(c *fiber.Ctx) error {
	utils.GenerateRandomCode(6)
	if c.Locals("user") == nil {
		return c.Status(http.StatusUnauthorized).JSON(fiber.Map{"message": "unauthorized"})
	}
	var body struct {
		Name string
	}
	if err := c.BodyParser(&body); err != nil {
		return err
	}
	studentCred := c.Locals("user").(fiber.Map)
	studentID := int((studentCred["Id"]).(uint))
	studentTeamCode, err := utils.GenerateRandomCode(6)
	if err != nil {
		return c.Status(http.StatusBadRequest).JSON(err)
	}
	var team = models.Team{
		Code: studentTeamCode,
		Name: body.Name,
	}
	var student models.User
	result := initializers.DB.First(&student, studentID)
	if result.Error != nil {
		return result.Error
	}
	result = initializers.DB.Create(&team)
	if result.Error != nil {
		return result.Error
	}
	appRes := initializers.DB.Model(&team).Association("Members").Append(&student)
	if appRes != nil {
		return appRes
	}
	return c.Status(http.StatusOK).JSON(fiber.Map{
		"team":    team,
		"student": student,
	})
}

// Покинуть команду, достаём из контекста айди пользователя
// Получаем код команды через query, которую хотим покинуть и отвязываем ассоциацию
func LeaveTeam(c *fiber.Ctx) error {
	studentCred := c.Locals("user").(fiber.Map)
	studentID := (studentCred["Id"]).(uint)
	teamCode := c.Query("code")
	if teamCode == "" {
		return c.Status(http.StatusBadRequest).JSON("provide a group code")
	}
	var user = models.User{
		ID: studentID,
	}
	var team models.Team
	err := initializers.DB.Find(&team, "code = ?", teamCode).Error
	if err != nil {
		return c.Status(http.StatusBadRequest).JSON("team not found")
	}
	err = initializers.DB.Model(&user).Association("Teams").Delete(&team)
	if err != nil {
		return c.Status(http.StatusBadRequest).JSON("error while leaving team")
	}
	return c.SendStatus(http.StatusOK)
}

func EnterTeam(c *fiber.Ctx) error {
	if c.Locals("user") == nil {
		return c.Status(http.StatusUnauthorized).JSON(fiber.Map{"message": "unauthorized"})
	}
	teamCode := c.Query("code")
	if teamCode == "" {
		return c.Status(http.StatusBadRequest).JSON("provide a group code")
	}
	studentCred := c.Locals("user").(fiber.Map)
	studentID := int((studentCred["Id"]).(uint))
	var student models.User
	result := initializers.DB.First(&student, studentID)
	if result.Error != nil {
		return c.SendStatus(http.StatusBadRequest)
	}
	var teamWanted models.Team
	result = initializers.DB.Where("code = ?", teamCode).First(&teamWanted)
	if result.Error != nil {
		return c.Status(http.StatusBadRequest).JSON("no teams under this code")
	}
	err := initializers.DB.Model(&teamWanted).Association("Members").Append(&student)
	if err != nil {
		return err
	}
	return c.Status(http.StatusOK).JSON("successful")
}

func ChangeTeamName(c *fiber.Ctx) error {
	if c.Locals("user") == nil {
		return c.Status(http.StatusUnauthorized).JSON(fiber.Map{"message": "unauthorized"})
	}
	teamCode := c.Query("code")

	var body struct {
		NewName string `json:"name"`
	}
	if err := c.BodyParser(&body); err != nil {
		return err
	}
	teamNewName := body.NewName
	if teamCode == "" {
		return c.Status(http.StatusBadRequest).JSON("provide a group code")
	}
	if teamNewName == "" {
		return c.Status(http.StatusBadRequest).JSON("provide a new name")
	}
	studentCred := c.Locals("user").(fiber.Map)
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

func CheckAuth(c *fiber.Ctx) error {
	jwtTokenString := c.Cookies("token")
	if jwtTokenString != "" {
		_, err := jwt.Parse(jwtTokenString, func(jwtToken *jwt.Token) (interface{}, error) {
			if _, ok := jwtToken.Method.(*jwt.SigningMethodHMAC); !ok {
				return nil, fmt.Errorf("unexpected signing method: %s", jwtToken.Header["alg"])
			}
			return []byte(os.Getenv("SECRET")), nil
		})
		if err != nil {
			return c.Status(fiber.StatusUnauthorized).JSON(fiber.Map{"status": "fail", "message": fmt.Sprintf("invalid token: %v", err)})
		}
		return c.SendStatus(http.StatusOK)
	}
	return c.SendStatus(http.StatusUnauthorized)
}

func ViewTeams(c *fiber.Ctx) error {
	// var teams []models.Team
	// var students []models.User
	if c.Locals("user") == nil {
		return c.Status(http.StatusUnauthorized).JSON(fiber.Map{"message": "unauthorized"})
	}
	var student models.User
	studentCred := c.Locals("user").(fiber.Map)
	studentID, ok := ((studentCred["Id"]).(uint))
	if !ok {
		return c.Status(http.StatusBadRequest).JSON("bad credentials")
	}

	result := initializers.DB.Preload("Teams.Members", func(db *gorm.DB) *gorm.DB {
		return db.Select("id, full_name") // Загружаем только ID и имя участников
	}).First(&student, studentID)

	if result.Error != nil {
		return c.Status(http.StatusUnauthorized).JSON("not authorized")
	}

	return c.Status(http.StatusOK).JSON(&student.Teams)
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
