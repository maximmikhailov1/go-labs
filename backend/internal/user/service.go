package user

import (
	"errors"

	"github.com/maximmikhailov1/go-labs/backend/internal/models"
)

type UserService struct {
	repo *UserRepository
}

func NewUserService(repo *UserRepository) *UserService {
	return &UserService{repo: repo}
}

func (s *UserService) GetAllUsers() ([]UserResponse, error) {
	users, err := s.repo.GetAll()
	if err != nil {
		return nil, err
	}

	var response []UserResponse
	for _, u := range users {
		response = append(response, UserResponse{
			ID:        u.ID,
			Username:  u.Username,
			FullName:  u.FullName,
			Role:      u.Role,
			GroupName: u.Group.Name,
			CreatedAt: u.CreatedAt,
		})
	}

	return response, nil
}

func (s *UserService) GetUserProfile(userID uint) (*ProfileResponse, error) {
	user, err := s.repo.GetByID(userID)
	if err != nil {
		return nil, errors.New("user not found")
	}
	group := user.Group
	subjectID := uint(0)
	subjectName := ""
	if group != nil {
		if group.Subject != nil {
			subjectID = group.Subject.ID
			subjectName = group.Subject.Name
		}
	} else {
		group = &models.Group{
			ID:        0,
			Code:      "none",
			Name:      "none",
			SubjectID: nil,
			Subject:   nil,
			Students:  nil,
		}
	}
	return &ProfileResponse{
		ID:          user.ID,
		FullName:    user.FullName,
		GroupName:   group.Name,
		SubjectID:   subjectID,
		SubjectName: subjectName,
	}, nil
}

func (s *UserService) GetTutors() ([]TutorResponse, error) {
	tutors, err := s.repo.GetTutors()
	if err != nil {
		return nil, err
	}

	var response []TutorResponse
	for _, t := range tutors {
		response = append(response, TutorResponse{
			ID:       t.ID,
			Username: t.Username,
			FullName: t.FullName,
		})
	}

	return response, nil
}
