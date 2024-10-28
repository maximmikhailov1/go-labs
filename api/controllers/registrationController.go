package controllers

import (
	"net/http"

	"github.com/gofiber/fiber/v2"
	"github.com/gofiber/fiber/v2/log"
	"github.com/maximmikhailov1/go-labs/api/initializers"
	"github.com/maximmikhailov1/go-labs/api/models"
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

func Register(c *fiber.Ctx) error {
	data := new(Form)
	if err := c.BodyParser(data); err != nil {
		log.Info(err)
		return err
	}
	// models.Lab
	// models.Record
	// models.Student
	// initializers.DB.Find()
	// // if result.Error != nil {
	// // return c.Status(400).JSON(result.Error)
	// }
	student := models.Student{}
	lab := models.Lab{}
	record := models.Record{}

	result := initializers.DB.Model(&models.Student{}).Preload("LabsAppointed").Where("second_name = ? AND first_name = ?", data.StudentSurname, data.StudentName).
		First(&student)
	if result.Error != nil {
		return c.Status(http.StatusBadRequest).JSON(fiber.Map{
			"message":    "error in finding student",
			"true_error": result.Error,
		})
	}
	result = initializers.DB.Where("number = ?", data.LabNumber).First(&lab)
	if result.Error != nil {
		return c.Status(http.StatusBadRequest).JSON(fiber.Map{
			"message":    "error in finding lab",
			"true_error": result.Error,
		})
	}
	student.LabsAppointed = append(student.LabsAppointed, lab)
	log.Info(student.LabsAppointed)
	result = initializers.DB.Save(&student)
	if result.Error != nil {
		return c.Status(http.StatusBadRequest).JSON(fiber.Map{
			"message":    "error saving student",
			"true_error": result.Error,
		})
	}
	result = initializers.DB.Where("lab_date = ? AND class_number = ?", data.LabDate, data.ClassNumber).First(&record)
	if result.Error != nil {
		return c.Status(http.StatusBadRequest).JSON(fiber.Map{
			"message":    "error in finding record",
			"true_error": result.Error,
		})
	}
	record.Students = append(record.Students, student)

	result = initializers.DB.Save(&record)
	if result.Error != nil {
		return c.Status(http.StatusBadRequest).JSON(fiber.Map{
			"message":    "error in saving record",
			"true_error": result.Error,
		})
	}
	return c.Status(http.StatusAccepted).JSON(fiber.Map{
		"data": data,
	})
}
