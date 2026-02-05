package group

import (
	"context"
	"errors"

	"github.com/maximmikhailov1/go-labs/backend/internal/score"
)

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

func (s *Service) GetGroupMembers(ctx context.Context, groupID uint) ([]GroupMemberResponse, error) {
	group, err := s.repo.GetGroupWithStudents(groupID)
	if err != nil {
		return nil, errors.New("group not found")
	}
	subjectID := uint(0)
	if group.SubjectID != nil {
		subjectID = *group.SubjectID
	}
	groupName := group.Name

	userIDs := make([]uint, 0)
	if group.Students != nil {
		for _, u := range *group.Students {
			userIDs = append(userIDs, u.ID)
		}
	}
	scores, err := score.GetScoresForUsers(ctx, userIDs, subjectID, groupID)
	if err != nil {
		return nil, err
	}

	out := make([]GroupMemberResponse, 0)
	if group.Students != nil {
		for _, u := range *group.Students {
			sc := scores[u.ID]
			out = append(out, GroupMemberResponse{
				FullName:       u.FullName,
				GroupName:      groupName,
				CompletedCount: sc.Completed,
				DefendedCount:  sc.Defended,
			})
		}
	}
	return out, nil
}
