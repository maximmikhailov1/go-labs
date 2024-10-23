package models

type Tutor struct {
	TutorID        uint
	Username       string
	First_name     string
	Second_name    string
	Patronymic     string
	PasswordHashed string
	SessionToken   string
	CSRFToken      string
}
