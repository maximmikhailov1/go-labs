package team

import (
	"errors"
	"github.com/maximmikhailov1/go-labs/backend/internal/models"
)

type Service struct {
	repo *Repository
}

func NewService(repo *Repository) *Service {
	return &Service{repo: repo}
}

func (s *Service) CreateTeam(req CreateRequest, creatorID uint) (*TeamResponse, error) {
	team := models.Team{
		Name:    req.Name,
		Premade: true,
	}

	if err := s.repo.Create(&team); err != nil {
		return nil, errors.New("failed to create team")
	}

	creator := models.User{ID: creatorID}
	if err := s.repo.AddMember(&team, &creator); err != nil {
		return nil, errors.New("failed to add creator to team")
	}

	return s.getTeamResponse(&team)
}

func (s *Service) JoinTeam(code string, userID uint) (*TeamResponse, error) {
	team, err := s.repo.FindByCode(code)
	if err != nil {
		return nil, errors.New("team not found")
	}

	count, _ := s.repo.GetMembersCount(team)
	if count >= 4 {
		return nil, errors.New("team is full")
	}

	user := models.User{ID: userID}
	if err := s.repo.AddMember(team, &user); err != nil {
		return nil, errors.New("failed to join team")
	}

	return s.getTeamResponse(team)
}

func (s *Service) LeaveTeam(code string, userID uint) error {
	team, err := s.repo.FindByCode(code)
	if err != nil {
		return errors.New("team not found")
	}

	user := models.User{ID: userID}
	return s.repo.RemoveMember(team, &user)
}

func (s *Service) UpdateTeamName(code string, userID uint, newName string) (*TeamResponse, error) {
	team, err := s.repo.FindByCode(code)
	if err != nil {
		return nil, errors.New("team not found")
	}

	// Проверка что пользователь состоит в команде
	var user models.User
	if err := s.repo.db.Model(team).Where("id = ?", userID).Association("Members").Find(&user); err != nil {
		return nil, errors.New("user is not a member of this team")
	}

	if err := s.repo.UpdateName(team, newName); err != nil {
		return nil, errors.New("failed to update team name")
	}

	return s.getTeamResponse(team)
}

func (s *Service) getTeamResponse(team *models.Team) (*TeamResponse, error) {
	var members []Member
	if err := s.repo.db.Model(team).Association("Members").Find(&members); err != nil {
		return nil, err
	}

	return &TeamResponse{
		ID:        team.ID,
		Code:      team.Code,
		Name:      team.Name,
		Premade:   team.Premade,
		CreatedAt: team.CreatedAt,
		Members:   members,
	}, nil
}

func (s *Service) GetUserTeams(userID uint) ([]TeamWithMembers, error) {
	teams, err := s.repo.GetUserTeams(userID)
	if err != nil {
		return nil, errors.New("failed to get user team")
	}

	var response []TeamWithMembers
	for _, team := range *teams {
		var members []Member
		for _, user := range team.Members {
			members = append(members, Member{
				ID:       user.ID,
				FullName: user.FullName,
			})
		}

		response = append(response, TeamWithMembers{
			ID:      team.ID,
			Code:    team.Code,
			Name:    team.Name,
			Premade: team.Premade,
			Members: members,
		})
	}

	return response, nil
}
