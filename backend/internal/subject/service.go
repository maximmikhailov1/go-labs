package subject

import "github.com/maximmikhailov1/go-labs/backend/internal/models"

type Service struct {
	repo *Repository
}

func NewService(repo *Repository) *Service {
	return &Service{repo: repo}
}

func (s *Service) CreateSubject(req SubjectRequest) (*SubjectResponse, error) {
	subject := models.Subject{
		Name:        req.Name,
		Description: req.Description,
	}

	if err := s.repo.Create(&subject); err != nil {
		return nil, err
	}

	return &SubjectResponse{
		ID:          subject.ID,
		Name:        subject.Name,
		Description: subject.Description,
		CreatedAt:   subject.CreatedAt,
	}, nil
}

func (s *Service) GetAllSubjects() ([]SubjectResponse, error) {
	subjects, err := s.repo.GetAllWithGroups()
	if err != nil {
		return nil, err
	}

	var response []SubjectResponse = []SubjectResponse{}
	for _, s := range subjects {
		var groups []GroupResponse
		for _, g := range s.Groups {
			groups = append(groups, GroupResponse{
				ID:   g.ID,
				Name: g.Name,
			})
		}

		response = append(response, SubjectResponse{
			ID:          s.ID,
			Name:        s.Name,
			Description: s.Description,
			CreatedAt:   s.CreatedAt,
			Groups:      groups,
		})
	}

	return response, nil
}
