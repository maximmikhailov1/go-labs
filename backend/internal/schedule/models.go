package schedule

import (
	"time"

	"gorm.io/datatypes"
)

type CreateRequest struct {
	LabDate        time.Time `json:"labDate" validate:"required"`
	ClassNumber    int       `json:"classNumber" validate:"required,min=1,max=8"`
	AudienceNumber int       `json:"audienceNumber"`
	AudienceID     *uint     `json:"audienceId"`
}

type PatchRecordStatusRequest struct {
	Status string `json:"status" validate:"required,oneof=planned cancelled passed"`
}

type RecordResponse struct {
	ID              uint           `json:"id"`
	LabDate         datatypes.Date `json:"labDate"`
	ClassNumber     int            `json:"classNumber"`
	AudienceNumber  int            `json:"audienceNumber"`
	TutorID         uint           `json:"tutorId"`
	Status          string         `json:"status"`
	CreatedAt       time.Time      `json:"createdAt"`
	Switches        int            `json:"switches"`
	Routers         int            `json:"routers"`
	WirelessRouters int            `json:"wirelessRouters"`
	HPRouters       int            `json:"hpRouters"`
	HPSwitches      int            `json:"hpSwitches"`
}

type UnsubscribeRequest struct {
	EntryID   uint `json:"entryId" validate:"required"`
	StudentID uint `json:"studentId"`
}

type UnsubscribeResponse struct {
	Message string `json:"message"`
	EntryID uint   `json:"entryId,omitempty"`
	TeamID  uint   `json:"teamId,omitempty"`
}

type WeekScheduleRequest struct {
	WeekNumber int `json:"weekNumber" validate:"required"`
}

type WeekScheduleResponse struct {
	ID             uint           `json:"id"`
	LabDate        datatypes.Date `json:"labDate"`
	ClassNumber    int            `json:"classNumber"`
	AudienceNumber int            `json:"audienceNumber"`
	Status         string         `json:"status"`
	Tutor          TutorInfo      `json:"tutor"`
	Entries        []EntryInfo    `json:"entries"`

	Switches        int `json:"switches"`
	Routers         int `json:"routers"`
	WirelessRouters int `json:"wirelessRouters"`
	HPRouters       int `json:"hpRouters"`
	HPSwitches      int `json:"hpSwitches"`
}

type TutorInfo struct {
	ID       uint   `json:"id"`
	FullName string `json:"fullName"`
}

type EntryInfo struct {
	ID     uint     `json:"id"`
	Lab    LabInfo  `json:"lab"`
	Team   TeamInfo `json:"team"`
	Status string   `json:"status"`
}

type LabInfo struct {
	ID          uint   `json:"id"`
	Number      string `json:"number"`
	Description string `json:"description"`
	MaxStudents int    `json:"maxStudents"`
}

type TeamInfo struct {
	ID      uint   `json:"id"`
	Name    string `json:"name"`
	Members []uint `json:"members"`
}
