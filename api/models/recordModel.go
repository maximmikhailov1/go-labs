package models

import (
	"gorm.io/gorm"
)

type Record struct {
	gorm.Model
	LabTimeStart   string
	AudienceNumber int
	Tutor          string
	Students       []Student `gorm:"foreignKey:StudentID"`
}
