package models

import (
	"gorm.io/gorm"
)

type User struct {
	ID uint `gorm:"primaryKey"`
	gorm.Model
	Username       string `gorm:"unique;not null" json:"username"`
	PasswordHashed string `gorm:"not null" json:"password"`
	FullName       string `gorm:"not null" json:"fullName"` // Объединенное ФИО
	Role           string `gorm:"index" json:"role"`
	GroupID        *uint
	Group          *Group
	Teams          *[]Team `gorm:"many2many:users_teams"`
}
