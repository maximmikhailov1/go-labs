package models

import "gorm.io/gorm"

type Lab struct {
	gorm.Model
	Lab_number string
}
