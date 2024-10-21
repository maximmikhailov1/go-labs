package models

import (
	"time"

	"gorm.io/gorm"
)

type Record struct {
	gorm.Model
	LabTimeStart   time.Time
	AudienceNumber int
	Tutor          string
	Students       []Student `gorm:"foreignKey:StudentID"`
}
