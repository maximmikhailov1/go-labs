package models

import "gorm.io/gorm"

type EntryMemberStatus struct {
	ID uint `gorm:"primaryKey"`
	gorm.Model
	EntryID uint   `gorm:"uniqueIndex:idx_entry_user;not null"`
	UserID  uint   `gorm:"uniqueIndex:idx_entry_user;not null"`
	Status  string `gorm:"not null"`
	Entry   Entry  `gorm:"foreignKey:EntryID"`
	User    User   `gorm:"foreignKey:UserID"`
}
