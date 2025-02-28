package models

import (
	"gorm.io/datatypes"
	"gorm.io/gorm"
)

type Record struct {
	gorm.Model
	LabDate                  datatypes.Date `gorm:"index:idx_record_main,unique;not null"`
	ClassNumber              int            `gorm:"index:idx_record_main,check:class_number > 0 AND class_number < 9"`
	AudienceNumber           int            `gorm:"index:idx_record_main,unique;not null"`
	TutorID                  uint           `gorm:"not null"`
	SwitchesRemaining        int            `gorm:"default:6;check:switches_remaining >= 0"`
	RoutersRemaining         int            `gorm:"default:6;check:routers_remaining >= 0"`
	WirelessRoutersRemaining int            `gorm:"default:2;check:wireless_routers_remaining >= 0"`
	HPRoutersRemaining       int            `gorm:"default:2;check:hp_routers_remaining >= 0"`
	HPSwitchesRemaining      int            `gorm:"default:2;check:hp_switches_remaining >= 0"`
	Tutor                    User           `gorm:"constraint:OnUpdate:CASCADE,OnDelete:RESTRICT"`
	Entries                  []Entry        `gorm:"foreignKey:RecordID"`
}
