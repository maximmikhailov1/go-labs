package audience

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

func (r *Repository) Create(a *models.Audience) error {
	return r.db.Create(a).Error
}

func (r *Repository) GetAll() ([]models.Audience, error) {
	var list []models.Audience
	err := r.db.Order("number").Find(&list).Error
	return list, err
}

func (r *Repository) GetByID(id uint) (*models.Audience, error) {
	var a models.Audience
	err := r.db.First(&a, id).Error
	return &a, err
}

func (r *Repository) Update(a *models.Audience) error {
	return r.db.Save(a).Error
}

func (r *Repository) Delete(id uint) error {
	return r.db.Delete(&models.Audience{}, id).Error
}
