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
		FullName  string `json:"fullName"`
		GroupName string `json:"groupName"`
	}
	resp.FullName = fio
	resp.GroupName = groupName
	log.Info(resp)
	return c.Status(http.StatusOK).JSON(resp)
}

func SubjectCreate(c *fiber.Ctx) error {
	var subject models.Subject

	if err := c.BodyParser(&subject); err != nil {
		return c.Status(http.StatusBadRequest).JSON("failed to parse body to subject")
	}

	err := initializers.DB.Create(&subject).Error
	if err != nil {
		return c.Status(http.StatusBadRequest).JSON("failed to create a subject")
	}

	return c.Status(http.StatusOK).JSON(subject)
}

func SubjectIndex(c *fiber.Ctx) error {
	var subjects []models.Subject

	err := initializers.DB.Debug().Preload("Groups", func(db *gorm.DB) *gorm.DB {
		return db.Select("id, name, subject_id") // Загружаем только ID название группы
	}).Find(&subjects).Error

	if err != nil {
		return c.Status(http.StatusBadRequest).JSON("failed to retrieve subjects")
	}

	return c.Status(http.StatusOK).JSON(subjects)

}

func ScheduleCreate(c *fiber.Ctx) error {
	var record models.Record
	if err := c.BodyParser(&record); err != nil {
		log.Info(err)
		return c.Status(http.StatusBadRequest).JSON("failed to parse body to record")
	}

	err := initializers.DB.Create(&record).Error
	if err != nil {
		return c.Status(http.StatusBadRequest).JSON("failed to create record")
	}
	return c.Status(http.StatusOK).JSON(record)
}

func TutorsIndex(c *fiber.Ctx) error {
	var tutors []models.User

	err := initializers.DB.Where("role = ?", "tutor").Find(&tutors).Error
	if err != nil {
		return c.Status(http.StatusBadRequest).JSON("failed to retrieve tutors")
	}

	return c.Status(http.StatusOK).JSON(tutors)
}

func LabsFirstBySubject(c *fiber.Ctx) error {
	subjectID := c.QueryInt("subjectId", 0)
	if subjectID == 0 {
		c.Status(http.StatusBadRequest).JSON("provide subject id")
	}

	var labs []models.Lab
	err := initializers.DB.Where("subject_id = ?", uint(subjectID)).Find(&labs).Error
	if err != nil {
		return c.Status(http.StatusBadRequest).JSON("no labs under this subject")
	}
	return c.Status(http.StatusOK).JSON(labs)
}

func TeamCreate(c *fiber.Ctx) error {
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
		Code:    studentTeamCode,
		Name:    body.Name,
		Premade: true,
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
func TeamLeave(c *fiber.Ctx) error {
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

func TeamEnter(c *fiber.Ctx) error {
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

func TeamChangeName(c *fiber.Ctx) error {
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

func UserTeamsIndex(c *fiber.Ctx) error {
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
	result := initializers.DB.
		Preload("Teams", "premade = ?", true). // Фильтруем команды по premade
		Preload("Teams.Members", func(db *gorm.DB) *gorm.DB {
			return db.Select("id, full_name") // Выбираем поля для участников
		}).
		First(&student, studentID)
	if result.Error != nil {
		return c.Status(http.StatusUnauthorized).JSON("failed to get teams")
	}

	return c.Status(http.StatusOK).JSON(&student.Teams)
}

func UserLabsIndex(c *fiber.Ctx) error {
	if c.Locals("user") == nil {
		return c.Status(http.StatusUnauthorized).JSON(fiber.Map{"error": "unauthorized"})
	}

	studentCred := c.Locals("user").(fiber.Map)
	studentRole, ok := studentCred["Role"].(string)
	if !ok {
		return c.Status(http.StatusBadRequest).JSON("bad credentials")
	}
	studentGroup, ok := studentCred["Group"].(string)
	if !ok {
		return c.Status(http.StatusBadRequest).JSON("bad credentials")
	}
	if studentRole != "student" {
		return c.Status(http.StatusUnauthorized).JSON([]models.Lab{})
	}
	if studentGroup == "" {
		return c.Status(http.StatusBadRequest).JSON("user has no group")
	}

	var group models.Group
	if err := initializers.DB.Preload("Subject.Labs").First(&group, "name = ?", studentGroup).Error; err != nil {
		if err == gorm.ErrRecordNotFound {
			return c.Status(http.StatusNotFound).JSON(fiber.Map{
				"error": "group not found",
			})
		}
		return c.Status(http.StatusInternalServerError).JSON(fiber.Map{
			"error": "server error",
		})
	}

	if group.SubjectID == 0 {
		return c.JSON(fiber.Map{
			"labs": []models.Lab{},
		})
	}

	// Получаем лабораторные работы по предмету группы
	var labs []models.Lab
	if err := initializers.DB.Where("subject_id = ?", group.SubjectID).Find(&labs).Error; err != nil {
		return c.Status(http.StatusInternalServerError).JSON(fiber.Map{
			"error": "Ошибка при получении лабораторных работ",
		})
	}

	return c.Status(http.StatusOK).JSON(labs)
}

/*
Логика вот в чем. Берём находим эту запись с такими данными
Потом смотрим команду которую нам пихает юзер, создаём новую с тэгом premade = false, людей там может быть
только столько сколько максимум в лабе. т.е первая проверка это то что размер команды + размер команды,
которая уже есть на эту лабу в этот промежуток времени, если не лезем в эту команду, то проверяем можем ли
создать ещё одну комадну которая будет выполнять эту лабу, если и тут не лезем , то можно наверное её просто
не рисовать, но обозначить что есть места на эту лабу, просто меньше мест чем надо чтобы записаться такой командой
также было бы неплохо показывать сколько чего осталось изначально, так будет прозначнее смешарикам понять на какую лабу
они могут записаться, но мы же ему и так рисуем, куда он может исходя из доступного оборудования
Так же получается мы должны иметь представление о том из какой пользователь группы, чтобы отрисовать ему его лабы
пиздец тяжко
Так ещё раз чел зашёл на лабу
Может добавить сразу проверку при отрисовке смотреть минимальное оборудование на лабу
какие есть, но я опять таки прихуею и говорить ему, что сюда не записаться
Заново
Что я хочу от юзера:
его группу, пара куда он может подумать записаться,
далее я смотрю сразу, если хоть куда-то есть места, то есть хотя бы одна команда не укомплектованна,
то я должен дать ему выбор туда записаться
НАДО СДЕЛАТЬ ФИЛЬТР какой-нибудь
типа у него есть поля
ЛАБА
КОМАНДА
АУДИТОРИЯ
если ввёл аудиторию то я ему показываю лабы на которые он может записаться в эту аудиторию, которые есть такие,
но не те на которые ему просто оборудования не хватает
Потом условно он выбрал лабу, тогда я должен посмотреть может ли он туда записаться своей premade командой и
отрисовать ему соответствующие опции
Если он выбрал команду, то отрисовать только те лабы на которые он сможет записаться командой, но оставить ему выбор убрать команду
Если он изначально выбрал команду, то нужно показать, только те лабы или аудиторию
на которые он может записаться командой
потом соответсвенно лабу или аудиторию а которую он влезет с этой лабой
Если он изначально выбрал лабу, то я ему показываю все лабы во всех аудиториях где есть место
если потом выбрал команду, то оставляю только ту аудиторию, куда он может записаться
TODO: создать ручку по которой будут отображаться только лабы на которые может записаться user
*/
/*
выбираешь пару---выбираешь аудиторию -- выбираешь команду --- выбираешь лабу --которую можно сделать командой- -
*/

func Enroll(c *fiber.Ctx) error {
	type RequestBody struct {
		RecordID uint  `json:"recordId"`
		LabID    uint  `json:"labId"`
		TeamID   *uint `json:"teamId"`
	}

	var req RequestBody
	if err := c.BodyParser(&req); err != nil {
		return c.Status(400).JSON(fiber.Map{"error": "Неверный запрос"})
	}

	// Получаем запись и лабораторную работу
	var record models.Record
	if err := initializers.DB.Preload("Entries.Team").Preload("Entries.Lab").First(&record, req.RecordID).Error; err != nil {
		return c.Status(404).JSON(fiber.Map{"error": "Запись не найдена"})
	}

	var lab models.Lab
	if err := initializers.DB.First(&lab, req.LabID).Error; err != nil {
		return c.Status(404).JSON(fiber.Map{"error": "Лабораторная работа не найдена"})
	}
	deltaRouters := record.RoutersRemaining - lab.RoutersRequired // 0+ = good
	deltaSwitches := record.SwitchesRemaining - lab.SwitchesRequired
	deltaWireless := record.WirelessRoutersRemaining - lab.WirelessRoutersRequired
	deltaHPRouters := record.HPRoutersRemaining - lab.HPRoutersRequired
	deltaHPSwitches := record.HPSwitchesRemaining - lab.HPSwitchesRequired
	// Проверка оборудования
	if deltaRouters < 0 ||
		deltaSwitches < 0 ||
		deltaWireless < 0 ||
		deltaHPRouters < 0 ||
		deltaHPSwitches < 0 {
		return c.Status(400).JSON(fiber.Map{"error": "Недостаточно оборудования"})
	}

	tx := initializers.DB.Begin()

	// Обновляем оборудование
	if err := tx.Model(&record).Updates(map[string]interface{}{
		"routers_remaining":          deltaRouters,
		"switches_remaining":         deltaSwitches,
		"wireless_routers_remaining": deltaWireless,
		"hp_routers_remaining":       deltaHPRouters,
		"hp_switches_remaining":      deltaHPSwitches,
	}).Error; err != nil {
		tx.Rollback()
		return c.Status(500).JSON(fiber.Map{"error": "Ошибка обновления оборудования"})
	}

	// Создаем или обновляем запись
	if req.TeamID != nil {
		var team models.Team
		if err := tx.Preload("Members").First(&team, *req.TeamID).Error; err != nil {
			tx.Rollback()
			return c.Status(404).JSON(fiber.Map{"error": "Команда не найдена"})
		}

		if (len(team.Members)) >= lab.MaxStudents {
			tx.Rollback()
			return c.Status(400).JSON(fiber.Map{"error": "Команда заполнена"})
		}
	} else {
		userCredentials, ok := c.Locals("user").(fiber.Map)
		if !ok {
			tx.Rollback()
			return c.Status(400).JSON(fiber.Map{"error": "Не удалось получить данные пользователя"})
		}
		studentID, ok := userCredentials["Id"].(uint)
		if !ok {
			tx.Rollback()

			return c.Status(400).JSON(fiber.Map{"error": "Не удалось получить данные пользователя"})
		}
		var student models.User
		err := initializers.DB.First(&student, studentID).Error
		if err != nil {
			tx.Rollback()
			return c.Status(400).JSON(fiber.Map{"error": "Не удалось найти пользователя"})
		}
		codeForEnrollment, err := utils.GenerateRandomCode(16)
		if err != nil {
			tx.Rollback()
			return c.Status(500).JSON(fiber.Map{"error": "Не удалось сгенерировать код для команды, попробуйте ещё раз"})
		}
		newTeam := models.Team{
			Code:    codeForEnrollment,
			Name:    "Ходим на лабы",
			Premade: false,
			Members: []models.User{student},
		}
		if err := tx.Create(&newTeam).Error; err != nil {
			tx.Rollback()
			return c.Status(500).JSON(fiber.Map{"error": "Ошибка создания команды"})
		}
		req.TeamID = &newTeam.ID
	}

	entry := models.Entry{
		RecordID: record.ID,
		LabID:    lab.ID,
		TeamID:   *req.TeamID,
	}

	if err := tx.Create(&entry).Error; err != nil {
		tx.Rollback()
		return c.Status(500).JSON(fiber.Map{"error": "Ошибка создания записи"})
	}

	tx.Commit()
	return c.JSON(fiber.Map{"success": true})
}

func RecordEnroll(c *fiber.Ctx) error {
	var body struct {
		Date           string
		SlotNumber     int
		AudienceNumber int
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

	result := initializers.DB.Preload("Tutor", func(db *gorm.DB) *gorm.DB {
		return db.Select("id, full_name") // Загружаем только ID название группы
	}).Preload("Entries.Lab").Preload("Entries.Team.Members", func(db *gorm.DB) *gorm.DB {
		return db.Select("id") // Загружаем только ID название группы
	}).Where("lab_date BETWEEN ? AND ?", weekStart, weekEnd).Find(&records)
	//initializers.DB.Debug().Where("lab_date BETWEEN ? AND ?", weekStart, weekEnd).Find(&records)
	if result.Error != nil {
		return result.Error
	} //TODO: preload tutuor
	log.Info(records)
	return c.Status(http.StatusOK).JSON(records)
}

func GroupCreate(c *fiber.Ctx) error {
	var requestBody struct {
		Name string
	}

	if err := c.BodyParser(&requestBody); err != nil {
		c.Status(http.StatusBadRequest).JSON("failed to parse body")
	}
	log.Info(requestBody)
	generatedCode, err := utils.GenerateRandomCode(6)
	if err != nil {
		return c.Status(http.StatusInternalServerError).JSON("failed to generate new code")
	}

	group := models.Group{
		Code: generatedCode,
		Name: requestBody.Name,
	}
	err = initializers.DB.Create(&group).Error
	if err != nil {
		return c.Status(http.StatusBadRequest).JSON("failed to create group")
	}

	return c.Status(http.StatusOK).JSON(group)
}

func GroupsIndex(c *fiber.Ctx) error {
	var groups []models.Group
	err := initializers.DB.Debug().Preload("Subject", func(db *gorm.DB) *gorm.DB {
		return db.Select("id, name") // Загружаем только ID название группы
	}).Order("name DESC").Find(&groups).Error

	if err != nil {
		return c.Status(http.StatusBadRequest).JSON(err)
	}

	return c.Status(http.StatusOK).JSON(groups)
}

func GroupUpdateSubject(c *fiber.Ctx) error {
	var requestBody struct {
		GroupID   string `json:"groupId"`
		SubjectID string `json:"subjectId"`
	}
	log.Info(string(c.Body()))

	if err := c.BodyParser(&requestBody); err != nil {
		c.Status(http.StatusBadRequest).JSON("failed to parse body")
	}
	log.Info(requestBody)
	groupID, err := (strconv.ParseUint(requestBody.GroupID, 10, 0))
	if err != nil {
		c.Status(http.StatusBadRequest).JSON("failed to parse a number from string")
	}
	subjectID, err := (strconv.ParseUint(requestBody.SubjectID, 10, 0))
	if err != nil {
		c.Status(http.StatusBadRequest).JSON("failed to parse a number from string")
	}
	log.Info(subjectID)
	log.Info(groupID)
	var subject models.Subject
	var group models.Group
	if err := initializers.DB.Debug().First(&subject, uint(subjectID)).Error; err != nil {
		return c.Status(http.StatusBadRequest).JSON("failed to find subject with id provided")
	}
	if err := initializers.DB.Debug().First(&group, uint(groupID)).Error; err != nil {
		return c.Status(http.StatusBadRequest).JSON("failed to find a group with id provided")
	}
	log.Info(subject)
	log.Info(group)
	if err := initializers.DB.Debug().Model(&subject).Association("Groups").Append(&group); err != nil {
		return c.Status(http.StatusBadRequest).JSON("failed to provide a group with new subject")
	}
	return c.SendStatus(http.StatusOK)
}
