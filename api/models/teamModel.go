package models

import "gorm.io/gorm"

type Team struct {
	ID uint `gorm:"primaryKey"`
	gorm.Model
	Code        string `gorm:"unique;index"`
	Name        string
	Members     []User `gorm:"many2many:users_teams;"`
	ActiveLabID *uint
	ActiveLab   *Lab
}
