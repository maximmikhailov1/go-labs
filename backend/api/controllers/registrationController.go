package controllers

import (
	"net/http"

	"github.com/gofiber/fiber/v2"
	"github.com/gofiber/fiber/v2/log"
	"github.com/maximmikhailov1/go-labs/backend/api/initializers"
	"github.com/maximmikhailov1/go-labs/backend/api/models"
	"gorm.io/datatypes"
)

type Form struct {
	Discipline     string
	LabNumber      string
	LabDate        datatypes.Date
	ClassNumber    int
	StudentSurname string
	StudentName    string
	StudentGroup   string
	Description    string
}

func RegisterAppointment(c *fiber.Ctx) error {
	data := new(Form)
	if err := c.BodyParser(data); err != nil {
		log.Info(err, '\n')
		return err
	}
	// models.Lab
	// models.Record
	// models.Student
	// initializers.DB.Find()
	// // if result.Error != nil {
	// // return c.Status(400).JSON(result.Error)
	// }
	student := models.User{}
	lab := models.Lab{}
	record := models.Record{}
	//searching id in cookies

	//searching student
	result := initializers.DB.Where("second_name = ? AND first_name = ?", data.StudentSurname, data.StudentName).
		First(&student)
	if result.Error != nil {
		return c.Status(http.StatusBadRequest).JSON(fiber.Map{
			"message":    "error in finding student",
			"true_error": result.Error,
		})
	}
	//searching lab
	result = initializers.DB.Where("number = ?", data.LabNumber).First(&lab)
	if result.Error != nil {
		return c.Status(http.StatusBadRequest).JSON(fiber.Map{
			"message":    "error in finding lab",
			"true_error": result.Error,
		})
	}
	//inserting lab into student
	err := initializers.DB.Model(&student).Association("LabsAppointed").Append(&lab)

	if err != nil {
		ferr := err.Error()
		return c.Status(http.StatusBadRequest).JSON(fiber.Map{
			"message":    "error saving student",
			"true_error": ferr,
		})
	}
	//finding record
	result = initializers.DB.Where("lab_date = ? AND class_number = ?", data.LabDate, data.ClassNumber).First(&record)
	if result.Error != nil {
		return c.Status(http.StatusBadRequest).JSON(fiber.Map{
			"message":    "error in finding record",
			"true_error": result.Error,
		})
	}

	err = initializers.DB.Model(&record).Association("Students").Append(&student)

	if err != nil {
		ferr := err.Error()
		return c.Status(http.StatusBadRequest).JSON(fiber.Map{
			"message":    "error in adding record to student lk",
			"true_error": ferr,
		})
	}
	//

	//
	var students []models.User
	err = initializers.DB.Model(&models.User{}).Preload("Records").Find(&students).Error
	if err != nil {
		ferr := err.Error()
		return c.Status(http.StatusBadRequest).JSON(fiber.Map{
			"message":    "error in adding record to student lk",
			"true_error": ferr,
		})
	}

	return c.Status(http.StatusAccepted).JSON(fiber.Map{
		"data":     record,
		"students": students,
		"id":       student.ID,
	})
}
