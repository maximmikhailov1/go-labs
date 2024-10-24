package models

type Student struct {
	ID            uint `gorm:"primarykey"`
	First_name    string
	Second_name   string
	Patronymic    string
	Group         string
	LabsAppointed []Lab `gorm:"many2many:student_labs;foreignKey:Refer"`
	Refer         uint  `gorm:"index:,unique"`
}
