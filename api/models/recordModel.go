package models

import (
	"gorm.io/datatypes"
	"gorm.io/gorm"
)

type Record struct {
	gorm.Model
	LabDate           datatypes.Date //Дата пары
	ClassNumber       int            //Номер пары
	AudienceNumber    int            // Номер аудитории
	Tutor             string         // ФИО преподавателя
	Students          []*User        `gorm:"many2many:student_records"`
	SwitchesRemaining int            `gorm:"default:6"`
	RoutersRemaining  int            `gorm:"default:6"`
}
