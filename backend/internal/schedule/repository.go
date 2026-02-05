package schedule

import (
	"time"

	"github.com/maximmikhailov1/go-labs/backend/internal/models"
	"gorm.io/gorm"
)

type Repository struct {
	db *gorm.DB
}

func NewRepository(db *gorm.DB) *Repository {
	return &Repository{db: db}
}

func (r *Repository) Create(record *models.Record) error {
	return r.db.Create(record).Error
}

func (r *Repository) GetRecordByID(id uint) (*models.Record, error) {
	var record models.Record
	err := r.db.First(&record, id).Error
	return &record, err
}

func (r *Repository) UpdateRecordStatus(id uint, status string) error {
	return r.db.Model(&models.Record{}).Where("id = ?", id).Update("status", status).Error
}

func (r *Repository) SetEntriesStatusByRecordID(recordID uint, status string) error {
	return r.db.Model(&models.Entry{}).Where("record_id = ?", recordID).Update("status", status).Error
}

func (r *Repository) GetEntryWithDetails(id uint) (*models.Entry, error) {
	var entry models.Entry
	err := r.db.
		Preload("Team.Members").
		Preload("Lab").
		Preload("Record").
		First(&entry, id).Error
	return &entry, err
}

func (r *Repository) RemoveTeamMember(teamID, userID uint) error {
	return r.db.
		Model(&models.Team{ID: teamID}).
		Association("Members").
		Delete(&models.User{ID: userID})
}

func (r *Repository) GetTeamMembersCount(teamID uint) (int64, error) {
	var count int64
	err := r.db.
		Model(&models.User{}).
		Joins("JOIN users_teams ON users_teams.user_id = users.id").
		Where("users_teams.team_id = ?", teamID).
		Count(&count).Error
	return count, err
}

func (r *Repository) ReturnEquipment(record *models.Record, lab *models.Lab) error {
	return r.db.Model(record).Updates(map[string]interface{}{
		"switches_remaining":         gorm.Expr("switches_remaining + ?", lab.SwitchesRequired),
		"routers_remaining":          gorm.Expr("routers_remaining + ?", lab.RoutersRequired),
		"wireless_routers_remaining": gorm.Expr("wireless_routers_remaining + ?", lab.WirelessRoutersRequired),
		"hp_routers_remaining":       gorm.Expr("hp_routers_remaining + ?", lab.HPRoutersRequired),
		"hp_switches_remaining":      gorm.Expr("hp_switches_remaining + ?", lab.HPSwitchesRequired),
	}).Error
}

func (r *Repository) DeleteEntry(id uint) error {
	return r.db.Delete(&models.Entry{}, id).Error
}

func (r *Repository) GetWeekSchedule(start, end time.Time) ([]models.Record, error) {
	var records []models.Record
	err := r.db.
		Preload("Tutor", func(db *gorm.DB) *gorm.DB {
			return db.Select("id, full_name")
		}).
		Preload("Audience").
		Preload("Entries.Lab").
		Preload("Entries.Team.Members.Group").
		Where("lab_date BETWEEN ? AND ?", start, end).
		Find(&records).Error
	return records, err
}
