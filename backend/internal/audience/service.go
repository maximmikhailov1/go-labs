package audience

import (
	"github.com/maximmikhailov1/go-labs/backend/internal/models"
)

type Service struct {
	repo *Repository
}

func NewService(repo *Repository) *Service {
	return &Service{repo: repo}
}

func (s *Service) Create(req CreateRequest) (*AudienceResponse, error) {
	a := models.Audience{
		Number:          req.Number,
		Routers:         req.Routers,
		Switches:        req.Switches,
		WirelessRouters: req.WirelessRouters,
		HPRouters:       req.HPRouters,
		HPSwitches:      req.HPSwitches,
	}
	if err := s.repo.Create(&a); err != nil {
		return nil, err
	}
	return toResponse(&a), nil
}

func (s *Service) GetAll() ([]AudienceResponse, error) {
	list, err := s.repo.GetAll()
	if err != nil {
		return nil, err
	}
	out := make([]AudienceResponse, 0, len(list))
	for i := range list {
		out = append(out, *toResponse(&list[i]))
	}
	return out, nil
}

func (s *Service) GetByID(id uint) (*AudienceResponse, error) {
	a, err := s.repo.GetByID(id)
	if err != nil {
		return nil, err
	}
	return toResponse(a), nil
}

func (s *Service) Update(id uint, req UpdateRequest) (*AudienceResponse, error) {
	a, err := s.repo.GetByID(id)
	if err != nil {
		return nil, err
	}
	if req.Number != "" {
		a.Number = req.Number
	}
	if req.Routers != nil {
		a.Routers = *req.Routers
	}
	if req.Switches != nil {
		a.Switches = *req.Switches
	}
	if req.WirelessRouters != nil {
		a.WirelessRouters = *req.WirelessRouters
	}
	if req.HPRouters != nil {
		a.HPRouters = *req.HPRouters
	}
	if req.HPSwitches != nil {
		a.HPSwitches = *req.HPSwitches
	}
	if err := s.repo.Update(a); err != nil {
		return nil, err
	}
	return toResponse(a), nil
}

func (s *Service) Delete(id uint) error {
	return s.repo.Delete(id)
}

func toResponse(a *models.Audience) *AudienceResponse {
	return &AudienceResponse{
		ID:              a.ID,
		Number:          a.Number,
		Routers:         a.Routers,
		Switches:        a.Switches,
		WirelessRouters: a.WirelessRouters,
		HPRouters:       a.HPRouters,
		HPSwitches:      a.HPSwitches,
		CreatedAt:       a.CreatedAt,
	}
}
