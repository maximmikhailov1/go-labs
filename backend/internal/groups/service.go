package group

import "errors"

type Service struct {
	repo *Repository
}

func NewService(repo *Repository) *Service {
	return &Service{repo: repo}
}

func (s *Service) CreateGroup(req CreateRequest) (*GroupResponse, error) {
	group, err := s.repo.CreateGroup(req.Name)
	if err != nil {
		return nil, err
	}

	return &GroupResponse{
		ID:        group.ID,
		Code:      group.Code,
		Name:      group.Name,
		SubjectID: group.SubjectID,
	}, nil
}

func (s *Service) GetAllGroups() ([]GroupWithSubjectResponse, error) {
	groups, err := s.repo.GetAllGroups()
	if err != nil {
		return nil, err
	}

	var response []GroupWithSubjectResponse
	for _, g := range groups {
		item := GroupWithSubjectResponse{
			ID:   g.ID,
			Code: g.Code,
			Name: g.Name,
		}

		if g.Subject != nil {
			item.Subject = SubjectInfo{
				ID:   g.Subject.ID,
				Name: g.Subject.Name,
			}
		}

		response = append(response, item)
	}

	return response, nil
}

func (s *Service) UpdateGroupSubject(req UpdateSubjectRequest) error {
	return s.repo.UpdateGroupSubject(req.GroupID, req.SubjectID)
}

func (s *Service) DeleteGroup(groupID uint) error {
	if err := s.repo.DeleteGroup(groupID); err != nil {
		return errors.New("failed to delete group")
	}
	return nil
}
