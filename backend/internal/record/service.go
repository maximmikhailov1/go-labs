package record

import (
	"context"
	"errors"
	"time"

	"github.com/maximmikhailov1/go-labs/backend/internal/models"
	"github.com/maximmikhailov1/go-labs/backend/internal/score"
)

type Service struct {
	repo *Repository
}

func NewService(repo *Repository) *Service {
	return &Service{repo: repo}
}

func (s *Service) GetUserRecords(userID uint, role string) (interface{}, error) {
	if role == models.RoleStudent {
		var records, err = s.repo.GetUserRecords(userID)
		if err != nil {
			return nil, err
		}
		if records == nil {
			return []UserRecordDTO{}, nil
		}
		return records, nil
	} else if role == models.RoleTutor {
		records, err := s.repo.GetTutorRecords()
		if err != nil {
			return nil, err
		}

		var response []TutorRecordResponse
		for _, r := range records {
			var entries []EntryInfo
			for _, e := range r.Entries {
				var members []Member
				for _, m := range e.Team.Members {
					groupName := ""
					if m.Group != nil {
						groupName = m.Group.Name
					}
					members = append(members, Member{
						ID:       m.ID,
						FullName: m.FullName,
						Group:    groupName,
					})
				}

				entries = append(entries, EntryInfo{
					ID: e.ID,
					Lab: LabInfo{
						ID:          e.Lab.ID,
						Number:      e.Lab.Number,
						Description: e.Lab.Description,
						MaxStudents: e.Lab.MaxStudents,
					},
					Team: TeamInfo{
						ID:      e.Team.ID,
						Name:    e.Team.Name,
						Members: members,
					},
					Status: e.Status,
				})
			}

			response = append(response, TutorRecordResponse{
				ID:             r.ID,
				LabDate:        r.LabDate,
				ClassNumber:    r.ClassNumber,
				AudienceNumber: r.AudienceNumber,
				Tutor: TutorInfo{
					ID:       r.Tutor.ID,
					FullName: r.Tutor.FullName,
				},

				Routers:         r.RoutersRemaining,
				Switches:        r.SwitchesRemaining,
				WirelessRouters: r.WirelessRoutersRemaining,
				HPRouters:       r.HPRoutersRemaining,
				HPSwitches:      r.HPSwitchesRemaining,
				Entries:         entries,
			})
		}
		if response == nil {
			response = []TutorRecordResponse{}
		}

		return response, nil
	}

	return nil, errors.New("invalid user role")
}

func (s *Service) Enroll(userID uint, req EnrollRequest) (*EnrollResponse, error) {
	// Начинаем транзакцию
	tx := s.repo.db.Begin()
	defer func() {
		if r := recover(); r != nil {
			tx.Rollback()
		}
	}()

	// 1. Получаем запись
	record, err := s.repo.GetRecordWithDetails(req.RecordID)
	if err != nil {
		tx.Rollback()
		return nil, errors.New("record not found")
	}

	// 2. Проверка даты: запись только на занятия в пределах 3 недель и не в прошлом
	now := time.Now().UTC()
	today := time.Date(now.Year(), now.Month(), now.Day(), 0, 0, 0, 0, time.UTC)
	labDate := time.Time(record.LabDate).UTC()
	if labDate.Before(today) {
		tx.Rollback()
		return nil, errors.New("запись на прошедшее занятие недоступна")
	}
	limit := today.AddDate(0, 0, 21)
	if labDate.After(limit) {
		tx.Rollback()
		return nil, errors.New("запись на это занятие недоступна: занятие более чем через 3 недели")
	}

	// 3. Проверяем, не записан ли уже пользователь на эту запись
	alreadyEnrolled, err := s.repo.CheckExistingEntries(req.RecordID, userID)
	if err != nil {
		tx.Rollback()
		return nil, errors.New("failed to check existing entries")
	}
	if alreadyEnrolled {
		tx.Rollback()
		return nil, errors.New("user already enrolled for this record")
	}

	// 4. Находим лабораторную работу
	lab, err := s.repo.GetLab(req.LabID)
	if err != nil {
		tx.Rollback()
		return nil, errors.New("lab not found")
	}

	// 5. Проверяем, есть ли другие записи на эту же лабораторную в этом слоте
	var existingTeams []*models.Team
	var existingTeam *models.Team
	var team *models.Team
	entries, err := s.repo.GetEntriesForLabInRecord(req.RecordID, req.LabID)
	if err != nil {
		tx.Rollback()
		return nil, errors.New("failed to check existing lab entries")
	}

	// 6. Если есть записи на эту лабораторную
	if len(entries) > 0 {
		// Проверяем все команды, записанные на эту лабу
		for _, entry := range entries {
			team, err = s.repo.GetTeamWithMembers(entry.TeamID)
			if err != nil {
				continue
			}

			// Проверяем, есть ли место в команде
			if len(team.Members) < lab.MaxStudents {
				existingTeams = append(existingTeams, team)
			}
		}

		// Если нашли команду с местом
		if len(existingTeams) > 0 {
			// Если пользователь хочет записаться со своей командой
			if req.TeamID != nil {
				// Проверяем, что его команда влезет в существующую
				originalTeam, err := s.repo.GetTeamWithMembers(*req.TeamID)
				if err != nil {
					tx.Rollback()
					return nil, errors.New("team not found")
				}

				// Проверяем, что пользователь в команде
				var isMember bool
				for _, m := range originalTeam.Members {
					if m.ID == userID {
						isMember = true
						break
					}
				}
				if !isMember {
					tx.Rollback()
					return nil, errors.New("user is not a member of this team")
				}

				// Проверяем, что вся команда влезет
				for _, exTeam := range existingTeams {
					if len(exTeam.Members)+len(originalTeam.Members) <= lab.MaxStudents {
						//tx.Rollback()
						if err := s.repo.AddMembersToTeam(exTeam.ID, originalTeam.Members); err != nil {
							tx.Rollback()
							return nil, errors.New("failed to add team members")
						}
						existingTeam = exTeam
						break
						//return nil, errors.New("not enough space in existing team for your whole team")
					}
				}
				if existingTeam != nil {
					if err := tx.Commit().Error; err != nil {
						return nil, errors.New("transaction failed")
					}
					return &EnrollResponse{
						Success: true,
						TeamID:  existingTeam.ID,
					}, nil
				}
			} else {
				// Просто добавляем текущего пользователя в существующую команду
				var user models.User
				if err := tx.First(&user, userID).Error; err != nil {
					tx.Rollback()
					return nil, errors.New("user not found")
				}
				for _, exTeam := range existingTeams {
					if len(exTeam.Members)+1 <= lab.MaxStudents {
						//tx.Rollback()
						if err := s.repo.AddMembersToTeam(exTeam.ID, []models.User{user}); err != nil {
							tx.Rollback()
							return nil, errors.New("failed to add user to team")
						}
						existingTeam = exTeam
						break
						//return nil, errors.New("not enough space in existing team for your whole team")
					}
				}
				if existingTeam != nil {
					if err := tx.Commit().Error; err != nil {
						return nil, errors.New("transaction failed")
					}
					return &EnrollResponse{
						Success: true,
						TeamID:  existingTeam.ID,
					}, nil
				}
			}
		}
	}

	// 7. Если нет подходящей существующей команды
	if existingTeam == nil {
		// Если пользователь хочет записаться со своей командой
		if req.TeamID != nil {
			originalTeam, err := s.repo.GetTeamWithMembers(*req.TeamID)
			if err != nil {
				tx.Rollback()
				return nil, errors.New("team not found")
			}

			// Проверяем, что пользователь в команде
			var isMember bool
			for _, m := range originalTeam.Members {
				if m.ID == userID {
					isMember = true
					break
				}
			}
			if !isMember {
				tx.Rollback()
				return nil, errors.New("user is not a member of this team")
			}

			// Проверяем, что команда не слишком большая
			if len(originalTeam.Members) > lab.MaxStudents {
				tx.Rollback()
				return nil, errors.New("team is too big for this lab")
			}

			// Создаем новую команду с теми же участниками
			team, err = s.repo.CreateTeam(originalTeam.Name, originalTeam.Members)
			if err != nil {
				tx.Rollback()
				return nil, errors.New("failed to create new team")
			}
		} else {
			// Создаем новую команду только с текущим пользователем
			var user models.User
			if err := tx.First(&user, userID).Error; err != nil {
				tx.Rollback()
				return nil, errors.New("user not found")
			}

			team, err = s.repo.CreateTeam("Team "+user.FullName, []models.User{user})
			if err != nil {
				tx.Rollback()
				return nil, errors.New("failed to create team")
			}
		}
	}

	// Проверяем оборудование
	delta := map[string]int{
		"routers":    record.RoutersRemaining - lab.RoutersRequired,
		"switches":   record.SwitchesRemaining - lab.SwitchesRequired,
		"wireless":   record.WirelessRoutersRemaining - lab.WirelessRoutersRequired,
		"hpRouters":  record.HPRoutersRemaining - lab.HPRoutersRequired,
		"hpSwitches": record.HPSwitchesRemaining - lab.HPSwitchesRequired,
	}

	for _, v := range delta {
		if v < 0 {
			tx.Rollback()
			return nil, errors.New("not enough equipment")
		}
	}

	// Обновляем оборудование
	if err := s.repo.UpdateEquipment(record, delta); err != nil {
		tx.Rollback()
		return nil, errors.New("failed to update equipment")
	}

	// Создаем запись (если еще не существует)
	if existingTeam == nil {
		if _, err := s.repo.CreateEntry(req.RecordID, req.LabID, team.ID); err != nil {
			tx.Rollback()
			return nil, errors.New("failed to create entry")
		}
	}

	// Фиксируем транзакцию
	if err := tx.Commit().Error; err != nil {
		return nil, errors.New("transaction failed")
	}

	return &EnrollResponse{
		Success: true,
		TeamID:  team.ID,
	}, nil
}

func (s *Service) UpdateEntryStatus(ctx context.Context, entryID uint, newStatus string) error {
	if newStatus != "scheduled" && newStatus != "completed" && newStatus != "defended" {
		return errors.New("invalid status")
	}
	entry, err := s.repo.GetEntryWithTeamAndMembers(entryID)
	if err != nil {
		return errors.New("entry not found")
	}
	oldStatus := entry.Status
	if oldStatus == "" {
		oldStatus = "scheduled"
	}

	if err := s.repo.UpdateEntryStatus(entryID, newStatus); err != nil {
		return err
	}

	for _, m := range entry.Team.Members {
		if m.Group == nil || m.Group.ID == 0 {
			continue
		}
		groupID := m.Group.ID
		subjectID := uint(0)
		if m.Group.SubjectID != nil {
			subjectID = *m.Group.SubjectID
		}
		if oldStatus == "completed" && newStatus != "completed" {
			_ = score.DecrementCompleted(ctx, m.ID, subjectID, groupID)
		}
		if oldStatus == "defended" && newStatus != "defended" {
			_ = score.DecrementDefended(ctx, m.ID, subjectID, groupID)
		}
		if newStatus == "completed" {
			_ = score.IncrementCompleted(ctx, m.ID, subjectID, groupID)
		}
		if newStatus == "defended" {
			_ = score.IncrementDefended(ctx, m.ID, subjectID, groupID)
		}
	}
	return nil
}
