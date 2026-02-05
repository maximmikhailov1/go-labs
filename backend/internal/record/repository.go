package record

import (
	"github.com/maximmikhailov1/go-labs/backend/internal/models"
	"github.com/maximmikhailov1/go-labs/backend/pkg/utils"
	"gorm.io/gorm"
)

type Repository struct {
	db *gorm.DB
}

func NewRepository(db *gorm.DB) *Repository {
	return &Repository{db: db}
}

func (r *Repository) GetUserRecords(userID uint) ([]UserRecordDTO, error) {
	var records []UserRecordDTO

	err := r.db.
		Table("entries").
		Select(`
			entries.id,
			labs.description as lab_name,
			records.lab_date as lab_date,
			labs.number as lab_number,
			records.class_number as class_number,
			records.audience_number as audience_number,
			entries.status as status,
			teams.name as team_name
		`).
		Joins("JOIN teams ON entries.team_id = teams.id").
		Joins("JOIN users_teams ON teams.id = users_teams.team_id").
		Joins("JOIN labs ON entries.lab_id = labs.id").
		Joins("JOIN records ON entries.record_id = records.id").
		Where("users_teams.user_id = ?", userID).
		Group("entries.id, labs.number, records.lab_date, records.class_number, labs.description, records.audience_number, entries.status, teams.name").
		Order("lab_date DESC").
		Find(&records).Error

	return records, err
}

func (r *Repository) GetTutorRecords() ([]models.Record, error) {
	var records []models.Record
	err := r.db.
		Preload("Entries.Team.Members.Group").
		Preload("Entries.Lab").
		Preload("Tutor").
		Order("lab_date DESC").
		Find(&records).Error
	return records, err
}

func (r *Repository) GetRecordWithDetails(id uint) (*models.Record, error) {
	var record models.Record
	err := r.db.
		Preload("Entries.Lab").
		Preload("Entries.Team.Members").
		First(&record, id).Error
	return &record, err
}

func (r *Repository) GetLab(id uint) (*models.Lab, error) {
	var lab models.Lab
	err := r.db.First(&lab, id).Error
	return &lab, err
}

func (r *Repository) GetEntriesForLabInRecord(recordID, labID uint) ([]models.Entry, error) {
	var entries []models.Entry
	err := r.db.Where("record_id = ? AND lab_id = ?", recordID, labID).Find(&entries).Error
	return entries, err
}

func (r *Repository) AddMembersToTeam(teamID uint, members []models.User) error {
	// Сначала проверяем, что добавление не превысит лимит (это должно проверяться в сервисе)
	for _, user := range members {
		if err := r.db.Model(&models.Team{ID: teamID}).Association("Members").Append(&user); err != nil {
			return err
		}
	}
	return nil
}

func (r *Repository) CreateTeam(name string, members []models.User) (*models.Team, error) {
	code, err := utils.GenerateRandomCode(16)
	if err != nil {
		return nil, err
	}

	team := models.Team{
		Code:    code,
		Name:    name,
		Premade: false,
		Members: members,
	}

	err = r.db.Create(&team).Error
	return &team, err
}

func (r *Repository) GetTeamWithMembers(id uint) (*models.Team, error) {
	var team models.Team
	err := r.db.Preload("Members").First(&team, id).Error
	return &team, err
}

func (r *Repository) CreateEntry(recordID, labID, teamID uint) (*models.Entry, error) {
	entry := models.Entry{
		RecordID: recordID,
		LabID:    labID,
		TeamID:   teamID,
	}
	err := r.db.Create(&entry).Error
	return &entry, err
}

func (r *Repository) UpdateEquipment(record *models.Record, delta map[string]int) error {
	return r.db.Model(record).Updates(map[string]interface{}{
		"routers_remaining":          delta["routers"],
		"switches_remaining":         delta["switches"],
		"wireless_routers_remaining": delta["wireless"],
		"hp_routers_remaining":       delta["hpRouters"],
		"hp_switches_remaining":      delta["hpSwitches"],
	}).Error
}

func (r *Repository) CheckExistingEntries(recordID, userID uint) (bool, error) {
	var count int64
	err := r.db.
		Model(&models.Entry{}).
		Joins("JOIN records ON entries.record_id = records.id").
		Joins("JOIN users_teams ON entries.team_id = users_teams.team_id").
		Where("entries.record_id = ? AND users_teams.user_id = ?",
			recordID, userID).
		Count(&count).Error

	return count > 0, err
}

func (r *Repository) GetEntryWithTeamAndMembers(entryID uint) (*models.Entry, error) {
	var entry models.Entry
	err := r.db.
		Preload("Team.Members.Group").
		Preload("Lab").
		First(&entry, entryID).Error
	return &entry, err
}

func (r *Repository) UpdateEntryStatus(entryID uint, status string) error {
	return r.db.Model(&models.Entry{}).Where("id = ?", entryID).Update("status", status).Error
}
