package models

import "gorm.io/gorm"

type Subject struct {
	gorm.Model
	Name        string `gorm:"unique"`
	Description string
	Groups      []Group `gorm:"foreignKey:SubjectID"`
	Labs        []Lab   `gorm:"foreignKey:SubjectID"`
}
