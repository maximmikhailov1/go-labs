package models

type Group struct {
	ID        uint   `gorm:"primarykey"`
	Code      string `gorm:"unique"`
	Name      string
	SubjectID uint
	Students  []User `gorm:"foreignKey:GroupID;references:ID"`
}
