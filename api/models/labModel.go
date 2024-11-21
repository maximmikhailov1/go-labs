package models

import "gorm.io/gorm"

type Lab struct {
	gorm.Model
	SubjectName      string
	Number           string
	Description      string
	RoutersRequired  int
	SwitchesRequired int
	Students         *[]Student `gorm:"many2many:student_labs"`
}
