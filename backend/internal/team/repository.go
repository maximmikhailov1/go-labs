package team

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
func (r *Repository) GetUserTeams(userID uint) (*[]models.Team, error) {
	var user models.User
	err := r.db.
		Preload("Teams", "premade = ?", true).
		Preload("Teams.Members", func(db *gorm.DB) *gorm.DB {
			return db.Select("id, full_name")
		}).
		First(&user, userID).Error

	if err != nil {
		return nil, err
	}
	return user.Teams, nil
}

func (r *Repository) Create(team *models.Team) error {
	code, err := utils.GenerateRandomCode(6)
	if err != nil {
		return err
	}
	team.Code = code
	return r.db.Create(team).Error
}

func (r *Repository) FindByCode(code string) (*models.Team, error) {
	var team models.Team
	if err := r.db.Where("code = ?", code).First(&team).Error; err != nil {
		return nil, err
	}
	return &team, nil
}

func (r *Repository) AddMember(team *models.Team, user *models.User) error {
	return r.db.Model(team).Association("Members").Append(user)
}

func (r *Repository) RemoveMember(team *models.Team, user *models.User) error {
	return r.db.Model(user).Association("Teams").Delete(team)
}

func (r *Repository) UpdateName(team *models.Team, newName string) error {
	return r.db.Model(team).Update("name", newName).Error
}

func (r *Repository) GetMembersCount(team *models.Team) (int64, error) {
	return r.db.Model(team).Association("Members").Count(), nil
}
