package models

type Group struct {
	GroupID uint   `gorm:"primarykey"`
	Code    string `gorm:"unique"`
	Name    string `gorm:"unique"`
}
