package models

type User struct {
	ID             uint   `gorm:"primarykey"`
	Username       string `gorm:"unique;not null"`
	PasswordHashed string `gorm:"not null"`
	First_name     string `gorm:"not null"`
	Second_name    string `gorm:"not null"`
	Patronymic     string `gorm:"not null"`
	Role           string `gorm:"type:ENUM('student', 'tutor')"`
	Group          string
	LabsAppointed  []*Lab    `gorm:"many2many:student_labs"`
	Records        []*Record `gorm:"many2many:student_records"`
}
