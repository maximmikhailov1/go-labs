package scoreboard

import (
	"context"
	"sort"

	"github.com/maximmikhailov1/go-labs/backend/internal/score"
	"gorm.io/gorm"
)

type Service struct {
	db *gorm.DB
}

func NewService(db *gorm.DB) *Service {
	return &Service{db: db}
}

func (s *Service) GetScoreboard(ctx context.Context, userID uint) ([]EntryResponse, error) {
	var user struct {
		ID       uint
		FullName string
		GroupID  *uint
	}
	if err := s.db.Table("users").Select("id, full_name, group_id").Where("id = ?", userID).First(&user).Error; err != nil {
		return nil, err
	}
	if user.GroupID == nil {
		return []EntryResponse{}, nil
	}
	groupID := *user.GroupID

	var group struct {
		ID        uint
		Name      string
		SubjectID *uint
	}
	if err := s.db.Table("groups").Select("id, name, subject_id").Where("id = ?", groupID).First(&group).Error; err != nil {
		return nil, err
	}
	subjectID := uint(0)
	if group.SubjectID != nil {
		subjectID = *group.SubjectID
	}

	var users []struct {
		ID       uint
		FullName string
	}
	if err := s.db.Table("users").Select("id, full_name").Where("group_id = ?", groupID).Find(&users).Error; err != nil {
		return nil, err
	}
	userIDs := make([]uint, 0, len(users))
	for _, u := range users {
		userIDs = append(userIDs, u.ID)
	}
	scores, err := score.GetScoresForUsers(ctx, userIDs, subjectID, groupID)
	if err != nil {
		return nil, err
	}

	type row struct {
		userID uint
		name   string
		c, d   int64
	}
	rows := make([]row, 0, len(users))
	for _, u := range users {
		sc := scores[u.ID]
		rows = append(rows, row{u.ID, u.FullName, sc.Completed, sc.Defended})
	}
	sort.Slice(rows, func(i, j int) bool {
		if rows[i].d != rows[j].d {
			return rows[i].d > rows[j].d
		}
		return rows[i].c > rows[j].c
	})

	out := make([]EntryResponse, 0, len(rows))
	for i, r := range rows {
		out = append(out, EntryResponse{
			Rank:           i + 1,
			UserID:         r.userID,
			FullName:       r.name,
			CompletedCount: r.c,
			DefendedCount:  r.d,
		})
	}
	return out, nil
}
