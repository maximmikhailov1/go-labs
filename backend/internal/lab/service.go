package lab

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

func (s *Service) CreateLab(req CreateRequest) (*LabResponse, error) {
	mandatory := true
	if req.IsMandatory != nil {
		mandatory = *req.IsMandatory
	}
	lab := models.Lab{
		Number:                  req.Number,
		Description:             req.Description,
		MaxStudents:             req.MaxStudents,
		IsMandatory:             mandatory,
		SwitchesRequired:        req.SwitchesRequired,
		RoutersRequired:         req.RoutersRequired,
		WirelessRoutersRequired: req.WirelessRoutersRequired,
		HPRoutersRequired:       req.HPRoutersRequired,
		HPSwitchesRequired:      req.HPSwitchesRequired,
		SubjectID:               req.SubjectID,
	}

	if err := s.repo.Create(&lab); err != nil {
		return nil, errors.New("failed to create lab")
	}

	return s.toLabResponse(&lab), nil
}

func (s *Service) GetLabsBySubject(subjectID uint) ([]LabResponse, error) {
	labs, err := s.repo.GetBySubject(subjectID)
	if err != nil {
		return nil, errors.New("failed to get labs by subject")
	}

	return s.toLabResponses(labs), nil
}

func (s *Service) GetLabsByGroup(groupName string) ([]LabResponse, error) {
	labs, err := s.repo.GetByGroup(groupName)
	if err != nil {
		return nil, errors.New("failed to get labs by group")
	}

	return s.toLabResponses(labs), nil
}

func (s *Service) DeleteLab(id uint) error {
	return s.repo.Delete(id)
}

func (s *Service) GetUniqueNumbers() (*NumbersResponse, error) {
	numbers, err := s.repo.GetUniqueNumbers()
	if err != nil {
		return nil, errors.New("failed to get unique lab numbers")
	}

	return &NumbersResponse{Numbers: numbers}, nil
}

func (s *Service) toLabResponse(lab *models.Lab) *LabResponse {
	return &LabResponse{
		ID:                      lab.ID,
		Number:                  lab.Number,
		Description:             lab.Description,
		MaxStudents:             lab.MaxStudents,
		IsMandatory:             lab.IsMandatory,
		SwitchesRequired:        lab.SwitchesRequired,
		RoutersRequired:         lab.RoutersRequired,
		WirelessRoutersRequired: lab.WirelessRoutersRequired,
		HPRoutersRequired:       lab.HPRoutersRequired,
		HPSwitchesRequired:      lab.HPSwitchesRequired,
		SubjectID:               lab.SubjectID,
	}
}

func (s *Service) toLabResponses(labs []models.Lab) []LabResponse {
	var responses []LabResponse
	for _, lab := range labs {
		responses = append(responses, *s.toLabResponse(&lab))
	}
	return responses
}
