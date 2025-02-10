package models

type Group struct {
	ID   uint   `gorm:"primarykey"`
	Code string `gorm:"unique"`
	Name string `gorm:"unique"`
}
