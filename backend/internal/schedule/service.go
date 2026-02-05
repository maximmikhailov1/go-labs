package schedule

import (
	"errors"
	"strconv"

	"time"

	"github.com/maximmikhailov1/go-labs/backend/internal/audience"
	"github.com/maximmikhailov1/go-labs/backend/internal/models"
	"gorm.io/datatypes"
)

type Service struct {
	repo         *Repository
	audienceRepo *audience.Repository
}

func NewService(repo *Repository, audienceRepo *audience.Repository) *Service {
	return &Service{repo: repo, audienceRepo: audienceRepo}
}

func (s *Service) CreateRecord(req CreateRequest, claimsUserID uint, claimsRole string) (*RecordResponse, error) {
	tutorID := claimsUserID
	if req.TutorID != nil && claimsRole == "tutor" {
		tutorID = *req.TutorID
	}

	audienceNumber := req.AudienceNumber
	switches, routers, wireless, hpRouters, hpSwitches := 6, 6, 2, 2, 2
	var audienceID *uint

	if req.AudienceID != nil {
		aud, err := s.audienceRepo.GetByID(*req.AudienceID)
		if err != nil {
			return nil, errors.New("audience not found")
		}
		if n, err := strconv.Atoi(aud.Number); err == nil {
			audienceNumber = n
		}
		switches = aud.Switches
		routers = aud.Routers
		wireless = aud.WirelessRouters
		hpRouters = aud.HPRouters
		hpSwitches = aud.HPSwitches
		audienceID = req.AudienceID
	}

	record := models.Record{
		LabDate:                  datatypes.Date(req.LabDate),
		ClassNumber:              req.ClassNumber,
		AudienceNumber:           audienceNumber,
		TutorID:                  tutorID,
		AudienceID:               audienceID,
		Status:                   "planned",
		SwitchesRemaining:        switches,
		RoutersRemaining:         routers,
		WirelessRoutersRemaining: wireless,
		HPRoutersRemaining:       hpRouters,
		HPSwitchesRemaining:      hpSwitches,
	}

	if err := s.repo.Create(&record); err != nil {
		return nil, err
	}

	return &RecordResponse{
		ID:              record.ID,
		LabDate:         record.LabDate,
		ClassNumber:     record.ClassNumber,
		AudienceNumber:  record.AudienceNumber,
		TutorID:         record.TutorID,
		Status:          record.Status,
		CreatedAt:       record.CreatedAt,
		Switches:        record.SwitchesRemaining,
		Routers:         record.RoutersRemaining,
		WirelessRouters: record.WirelessRoutersRemaining,
		HPRouters:       record.HPRoutersRemaining,
		HPSwitches:      record.HPSwitchesRemaining,
	}, nil
}

func (s *Service) Unsubscribe(userID uint, role string, req UnsubscribeRequest) (*UnsubscribeResponse, error) {
	// Начинаем транзакцию
	tx := s.repo.db.Begin()
	defer func() {
		if r := recover(); r != nil {
			tx.Rollback()
		}
	}()

	// Проверяем права
	studentID := userID
	if role == "tutor" {
		if req.StudentID == 0 {
			return nil, errors.New("student ID is required for tutors")
		}
		studentID = req.StudentID
	} else if req.StudentID != 0 && req.StudentID != userID {
		return nil, errors.New("unauthorized to unsubscribe other students")
	}

	// Получаем запись
	entry, err := s.repo.GetEntryWithDetails(req.EntryID)
	if err != nil {
		tx.Rollback()
		return nil, errors.New("entry not found")
	}

	// Удаляем студента из команды
	if err := s.repo.RemoveTeamMember(entry.TeamID, studentID); err != nil {
		tx.Rollback()
		return nil, errors.New("failed to remove team member")
	}

	// Проверяем количество участников
	count, err := s.repo.GetTeamMembersCount(entry.TeamID)
	if err != nil {
		tx.Rollback()
		return nil, errors.New("failed to check team members")
	}

	// Если участников не осталось
	if count == 0 {
		// Возвращаем оборудование
		if err := s.repo.ReturnEquipment(&entry.Record, &entry.Lab); err != nil {
			tx.Rollback()
			return nil, errors.New("failed to return equipment")
		}

		// Удаляем запись
		if err := s.repo.DeleteEntry(entry.ID); err != nil {
			tx.Rollback()
			return nil, errors.New("failed to delete entry")
		}

		// Фиксируем транзакцию
		if err := tx.Commit().Error; err != nil {
			return nil, errors.New("transaction failed")
		}

		return &UnsubscribeResponse{
			Message: "unsubscribed and entry deleted",
		}, nil
	}

	// Фиксируем транзакцию
	if err := tx.Commit().Error; err != nil {
		return nil, errors.New("transaction failed")
	}

	return &UnsubscribeResponse{
		Message: "unsubscribed successfully",
		EntryID: entry.ID,
		TeamID:  entry.TeamID,
	}, nil
}

func (s *Service) GetWeekSchedule(weekNumber int) ([]WeekScheduleResponse, error) {
	// Вычисляем даты начала и конца недели

	currentTime := time.Now()
	year, month, day := currentTime.Date()
	currentDate := time.Date(year, month, day, 0, 0, 0, 0, time.UTC)
	weekDuration := time.Hour * 24 * 7
	offsetTime := currentDate.Add(time.Duration(weekNumber) * weekDuration)
	currentWeekdayNumber := (int(offsetTime.Weekday()) + 6) % 7
	weekStart := offsetTime.Add(-time.Duration(currentWeekdayNumber * int(time.Hour) * 24))
	weekEnd := weekStart.Add(time.Hour * 24 * 7)
	// Получаем записи
	records, err := s.repo.GetWeekSchedule(weekStart, weekEnd)
	if err != nil {
		return nil, errors.New("failed to get week schedule")
	}

	// Формируем ответ
	var response []WeekScheduleResponse
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

		status := r.Status
		if status == "" {
			status = "planned"
		}
		var aud *AudienceInfo
		if r.Audience != nil {
			aud = &AudienceInfo{ID: r.Audience.ID, Number: r.Audience.Number}
		}
		response = append(response, WeekScheduleResponse{
			ID:             r.ID,
			LabDate:        r.LabDate,
			ClassNumber:    r.ClassNumber,
			AudienceNumber: r.AudienceNumber,
			Audience:       aud,
			Status:         status,
			Tutor: TutorInfo{
				ID:       r.Tutor.ID,
				FullName: r.Tutor.FullName,
			},
			Entries: entries,

			Switches:        r.SwitchesRemaining,
			Routers:         r.RoutersRemaining,
			WirelessRouters: r.WirelessRoutersRemaining,
			HPRouters:       r.HPRoutersRemaining,
			HPSwitches:      r.HPSwitchesRemaining,
		})
	}

	return response, nil
}

func (s *Service) UpdateRecordStatus(recordID uint, status string) error {
	if status != "planned" && status != "cancelled" && status != "passed" {
		return errors.New("invalid status")
	}
	if err := s.repo.UpdateRecordStatus(recordID, status); err != nil {
		return err
	}
	if status == "cancelled" {
		_ = s.repo.SetEntriesStatusByRecordID(recordID, "cancelled")
	}
	return nil
}
