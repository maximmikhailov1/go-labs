package models

import "gorm.io/gorm"

type Lab struct {
	gorm.Model
	SubjectID        uint // Ссылка на предмет
	Number           string
	Description      string
	MaxStudents      int
	RoutersRequired  int `gorm:"default:1"`
	SwitchesRequired int `gorm:"default:1"`
}
