package schedule

import (
	"errors"
	"github.com/maximmikhailov1/go-labs/backend/internal/models"
	"gorm.io/datatypes"
	"time"
)

type Service struct {
	repo *Repository
}

func NewService(repo *Repository) *Service {
	return &Service{repo: repo}
}

func (s *Service) CreateRecord(req CreateRequest, tutorID uint) (*RecordResponse, error) {
	record := models.Record{
		LabDate:                  datatypes.Date(req.LabDate),
		ClassNumber:              req.ClassNumber,
		AudienceNumber:           req.AudienceNumber,
		TutorID:                  tutorID,
		SwitchesRemaining:        6,
		RoutersRemaining:         6,
		WirelessRoutersRemaining: 2,
		HPRoutersRemaining:       2,
		HPSwitchesRemaining:      2,
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
			var members []uint
			for _, m := range e.Team.Members {
				members = append(members, m.ID)
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

		response = append(response, WeekScheduleResponse{
			ID:             r.ID,
			LabDate:        r.LabDate,
			ClassNumber:    r.ClassNumber,
			AudienceNumber: r.AudienceNumber,
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
