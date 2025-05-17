package auth

import (
	"github.com/maximmikhailov1/go-labs/backend/internal/models"
	"gorm.io/gorm"
)

type AuthRepository struct {
	db *gorm.DB
}

func NewAuthRepository(db *gorm.DB) *AuthRepository {
	return &AuthRepository{db: db}
}

func (r *AuthRepository) FindUserByUsername(username string) (*models.User, error) {
	var user models.User
	if err := r.db.Where("username = ?", username).Preload("Group").First(&user).Error; err != nil {
		return nil, err
	}
	return &user, nil
}

func (r *AuthRepository) CreateUser(user *models.User) error {
	return r.db.Create(user).Error
}

func (r *AuthRepository) FindGroupByCode(code string) (*models.Group, error) {
	var group models.Group
	if err := r.db.Where("code = ?", code).First(&group).Error; err != nil {
		return nil, err
	}
	return &group, nil
}
