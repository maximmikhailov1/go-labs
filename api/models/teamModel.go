package models

type Team struct {
	ID       uint   `gorm:"primarykey"`
	Code     string `gorm:"unique"`
	Name     string
	Students []Student
}
