package models

import "gorm.io/gorm"

type Audience struct {
	ID uint
	gorm.Model
	Number          string `gorm:"not null"`
	Routers         int    `gorm:"default:0;check:routers >= 0"`
	Switches        int    `gorm:"default:0;check:switches >= 0"`
	WirelessRouters int    `gorm:"default:0;check:wireless_routers >= 0"`
	HPRouters       int    `gorm:"default:0;check:hp_routers >= 0"`
	HPSwitches      int    `gorm:"default:0;check:hp_switches >= 0"`
}
