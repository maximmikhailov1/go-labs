package lab

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

func (r *Repository) Create(lab *models.Lab) error {
	return r.db.Create(lab).Error
}

func (r *Repository) GetBySubject(subjectID uint) ([]models.Lab, error) {
	var labs []models.Lab
	err := r.db.Where("subject_id = ?", subjectID).Find(&labs).Error
	return labs, err
}

func (r *Repository) GetByGroup(groupName string) ([]models.Lab, error) {
	var group models.Group
	if err := r.db.Preload("Subject.Labs").First(&group, "name = ?", groupName).Error; err != nil {
		return nil, err
	}

	if group.SubjectID == nil {
		return []models.Lab{}, nil
	}

	var labs []models.Lab
	err := r.db.Where("subject_id = ?", group.SubjectID).Find(&labs).Error
	return labs, err
}

func (r *Repository) Delete(id uint) error {
	return r.db.Delete(&models.Lab{}, id).Error
}

func (r *Repository) GetUniqueNumbers() ([]string, error) {
	var numbers []string
	err := r.db.Model(&models.Lab{}).Distinct().Pluck("number", &numbers).Error
	return numbers, err
}
