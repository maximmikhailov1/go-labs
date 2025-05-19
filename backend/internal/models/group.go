package models

import "gorm.io/gorm"

type Group struct {
	ID uint `gorm:"primarykey"`
	gorm.Model
	Code      string `gorm:"unique"`
	Name      string `gorm:"not null"`
	SubjectID *uint
	Subject   *Subject
	Students  *[]User `gorm:"foreignKey:GroupID;references:ID"`
}
