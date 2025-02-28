package models

type Group struct {
	ID        uint   `gorm:"primarykey"`
	Code      string `gorm:"unique"`
	Name      string `gorm:"not null"`
	SubjectID *uint
	Subject   *Subject
	Students  *[]User `gorm:"foreignKey:GroupID;references:ID"`
}
