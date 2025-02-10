package models

type Student struct {
	ID             uint `gorm:"primarykey"`
	Username       string
	HashedPassword string
	Role           string
	FirstName      string
	SecondName     string
	Patronymic     string
	Group          *string
	LabsAppointed  []*Lab    `gorm:"many2many:student_labs"`
	Records        []*Record `gorm:"many2many:student_records"`
}
