package subject

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

func (r *Repository) Create(subject *models.Subject) error {
	return r.db.Create(subject).Error
}

func (r *Repository) GetAllWithGroups() ([]models.Subject, error) {
	var subjects []models.Subject
	err := r.db.Preload("Groups", func(db *gorm.DB) *gorm.DB {
		return db.Select("id, name, subject_id")
	}).Find(&subjects).Error
	return subjects, err
}
