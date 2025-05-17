package user

import (
	"github.com/maximmikhailov1/go-labs/backend/internal/models"
	"gorm.io/gorm"
)

type UserRepository struct {
	db *gorm.DB
}

func NewUserRepository(db *gorm.DB) *UserRepository {
	return &UserRepository{db: db}
}

func (r *UserRepository) GetAll() ([]models.User, error) {
	var users []models.User
	if err := r.db.Find(&users).Error; err != nil {
		return nil, err
	}
	return users, nil
}

func (r *UserRepository) GetByID(id uint) (*models.User, error) {
	var user models.User
	if err := r.db.Preload("Group").First(&user, id).Error; err != nil {
		return nil, err
	}
	return &user, nil
}

func (r *UserRepository) GetTutors() ([]models.User, error) {
	var tutors []models.User
	err := r.db.Where("role = ?", "tutor").Find(&tutors).Error
	return tutors, err
}
