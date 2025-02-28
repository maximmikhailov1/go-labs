package models

import "gorm.io/gorm"

type Entry struct {
	gorm.Model
	TeamID   uint
	Team     Team `gorm:"foreignKey:TeamID;references:ID"`
	LabID    uint
	Lab      Lab `gorm:"foreignKey:LabID;references:ID"`
	RecordID uint
	Status   string `gorm:"default:'scheduled'"` // Добавлен статус записи
}
