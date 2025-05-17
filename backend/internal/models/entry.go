package models

import (
	"log"

	"gorm.io/gorm"
)

type Entry struct {
	ID uint
	gorm.Model
	TeamID   uint
	Team     Team `gorm:"foreignKey:TeamID;references:ID"`
	LabID    uint
	Lab      Lab `gorm:"foreignKey:LabID;references:ID"`
	RecordID uint
	Record   Record
	Status   string `gorm:"default:'scheduled'"` // Добавлен статус записи
}

func (e *Entry) AfterUpdate(tx *gorm.DB) (err error) {
	// Загружаем связанную команду с участниками
	var team Team
	if err := tx.Preload("Members").First(&team, e.TeamID).Error; err != nil {
		log.Printf("Failed to load team for entry %d: %v", e.ID, err)
		return nil
	}

	// Если в команде не осталось участников
	if len(team.Members) == 0 {
		// Загружаем связанные Lab и Record
		var lab Lab
		var record Record

		if err := tx.First(&lab, e.LabID).Error; err != nil {
			log.Printf("Failed to load lab: %v", err)
			return err
		}

		if err := tx.First(&record, e.RecordID).Error; err != nil {
			log.Printf("Failed to load record: %v", err)
			return err
		}

		// Возвращаем оборудование
		updates := map[string]interface{}{
			"switches_remaining":         gorm.Expr("switches_remaining + ?", lab.SwitchesRequired),
			"routers_remaining":          gorm.Expr("routers_remaining + ?", lab.RoutersRequired),
			"wireless_routers_remaining": gorm.Expr("wireless_routers_remaining + ?", lab.WirelessRoutersRequired),
			"hp_routers_remaining":       gorm.Expr("hp_routers_remaining + ?", lab.HPRoutersRequired),
			"hp_switches_remaining":      gorm.Expr("hp_switches_remaining + ?", lab.HPSwitchesRequired),
		}

		if err := tx.Model(&record).Updates(updates).Error; err != nil {
			log.Printf("Failed to return equipment: %v", err)
			return err
		}

		// Удаляем запись
		if err := tx.Delete(e).Error; err != nil {
			log.Printf("Failed to delete empty entry %d: %v", e.ID, err)
			return err
		}

		log.Printf("Auto-deleted entry %d and returned equipment for lab %d", e.ID, lab.ID)
	}

	return nil
}
