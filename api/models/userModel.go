package models

import (
	"gorm.io/gorm"
)

type User struct {
	ID uint `gorm:"primaryKey"`
	gorm.Model
	Username       string `gorm:"unique;not null"`
	PasswordHashed string `gorm:"not null"`
	FullName       string `gorm:"not null"` // Объединенное ФИО
	Role           string `gorm:"index"`
	GroupID        *uint
	Group          Group
	Teams          *[]Team `gorm:"many2many:users_teams"`
}
