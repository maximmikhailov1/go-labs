package record

import (
	"gorm.io/datatypes"
)

type UserRecordDTO struct {
	ID             uint           `json:"id"`
	LabName        string         `json:"labName"`
	LabDate        datatypes.Date `json:"labDate"`
	LabNumber      string         `json:"labNumber"`
	ClassNumber    int            `json:"classNumber"`
	AudienceNumber int            `json:"audienceNumber"`
	Status         string         `json:"status"`
	TeamName       string         `json:"teamName"`
}

type TutorRecordResponse struct {
	ID              uint           `json:"id"`
	LabDate         datatypes.Date `json:"labDate"`
	ClassNumber     int            `json:"classNumber"`
	AudienceNumber  int            `json:"audienceNumber"`
	Tutor           TutorInfo      `json:"tutor"`
	Routers         int            `json:"routers"`
	Switches        int            `json:"switches"`
	WirelessRouters int            `json:"wirelessRouters"`
	HPRouters       int            `json:"hpRouters"`
	HPSwitches      int            `json:"hpSwitches"`
	Entries         []EntryInfo    `json:"entries"`
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
	ID      uint     `json:"id"`
	Name    string   `json:"name"`
	Members []Member `json:"members"`
}

type Member struct {
	ID       uint   `json:"id"`
	FullName string `json:"fullName"`
	Group    string `json:"group"`
}

type EnrollRequest struct {
	RecordID uint  `json:"recordId" validate:"required"`
	LabID    uint  `json:"labId" validate:"required"`
	TeamID   *uint `json:"teamId"`
}

type EnrollResponse struct {
	Success bool   `json:"success"`
	TeamID  uint   `json:"teamId,omitempty"`
	Message string `json:"message,omitempty"`
}

type PatchEntryStatusRequest struct {
	Status string `json:"status" validate:"required,oneof=scheduled completed defended"`
}
