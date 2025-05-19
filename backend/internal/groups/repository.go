package group

import (
	"errors"
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

func (r *Repository) CreateGroup(name string) (*models.Group, error) {
	code, err := utils.GenerateRandomCode(6)
	if err != nil {
		return nil, errors.New("failed to generate group code")
	}

	group := &models.Group{
		Code: code,
		Name: name,
	}

	if err := r.db.Create(group).Error; err != nil {
		return nil, errors.New("failed to create group")
	}

	return group, nil
}

func (r *Repository) GetAllGroups() ([]models.Group, error) {
	var groups []models.Group
	err := r.db.
		Preload("Subject", func(db *gorm.DB) *gorm.DB {
			return db.Select("id, name")
		}).
		Order("name DESC").
		Find(&groups).Error

	if err != nil {
		return nil, errors.New("failed to fetch groups")
	}

	return groups, nil
}

func (r *Repository) UpdateGroupSubject(groupID, subjectID uint) error {
	return r.db.Transaction(func(tx *gorm.DB) error {
		// Проверяем существование предмета
		var subject models.Subject
		if err := tx.First(&subject, subjectID).Error; err != nil {
			return errors.New("subject not found")
		}

		// Проверяем существование группы
		var group models.Group
		if err := tx.First(&group, groupID).Error; err != nil {
			return errors.New("group not found")
		}

		// Обновляем связь
		if err := tx.Model(&subject).Association("Groups").Append(&group); err != nil {
			return errors.New("failed to update group subject")
		}

		return nil
	})
}
func (r *Repository) DeleteGroup(groupID uint) error {
	// Удаляем связи многие-ко-многим сначала

	// Затем удаляем саму группу
	return r.db.Delete(&models.Group{}, groupID).Error
}
