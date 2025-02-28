package models

import "gorm.io/gorm"

type Subject struct {
	ID uint `gorm:"primaryKey"`
	gorm.Model
	Name        string `gorm:"unique"`
	Description string
	Groups      []Group `gorm:"foreignKey:SubjectID;references:ID"`
	Labs        []Lab   `gorm:"foreignKey:SubjectID;references:ID"`
}
