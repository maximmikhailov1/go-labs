package models

import "gorm.io/gorm"

type Entry struct {
	gorm.Model
	TeamID   uint
	Team     Team `gorm:"foreignKey:TeamID"`
	LabID    uint
	Lab      Lab `gorm:"foreignKey:LabID"`
	RecordID uint
	Status   string `gorm:"default:'active'"` // Добавлен статус записи
}
