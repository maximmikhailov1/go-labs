package report

import (
	"github.com/maximmikhailov1/go-labs/backend/internal/models"
	"gorm.io/gorm"
)

type Repository struct {
	db *gorm.DB
}

func NewRepository(db *gorm.DB) *Repository {
	return &Repository{db: db}
}

func (r *Repository) GetRecordsForReport(recordIDs []uint) ([]models.Record, error) {
	var records []models.Record
	err := r.db.
		Preload("Entries.Lab").
		Preload("Entries.Team.Members.Group.Subject").
		Preload("Tutor").
		Where("id IN ?", recordIDs).
		Find(&records).Error
	return records, err
}
