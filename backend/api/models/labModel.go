package models

import "gorm.io/gorm"

type Lab struct {
	ID uint `gorm:"primarykey"`
	gorm.Model
	Subject                 Subject
	SubjectID               uint // Ссылка на предмет
	Number                  string
	Description             string
	MaxStudents             int
	RoutersRequired         int `gorm:"default:1"`
	SwitchesRequired        int `gorm:"default:0"`
	WirelessRoutersRequired int `gorm:"default:0"`
	HPRoutersRequired       int `gorm:"default:0"`
	HPSwitchesRequired      int `gorm:"default:0"`
}
