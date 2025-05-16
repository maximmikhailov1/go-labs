package models

import "gorm.io/gorm"

type Team struct {
	ID uint `gorm:"primaryKey"`
	gorm.Model
	Code    string `gorm:"unique;index"`
	Name    string
	Members []User `gorm:"many2many:users_teams;"`
	Entries []Entry
	Premade bool
}

func (t *Team) AfterUpdate(tx *gorm.DB) (err error) {
	membersCount := tx.Model(t).Association("Members").Count()

	if membersCount == 0 {
		tx.Where("team_id = ?", t.ID).Delete(&Entry{})
	}
	return
}
