package models

import "gorm.io/gorm"

type Lab struct {
	gorm.Model
	Subject_name string
	Lab_number   string
}
