package report

import (
	"time"

	"gorm.io/datatypes"
)

type GenerateReportRequest struct {
	RecordIDs []uint `json:"recordIds" validate:"required,min=1"`
}

type ReportData struct {
	Date        time.Time
	ClassNumber int
	Records     []RecordData
}

type RecordData struct {
	LabName       string
	LabDate       datatypes.Date
	LabNumber     string
	ClassNumber   int
	TutorFullName string
	Entries       []EntryData
}

type EntryData struct {
	StudentFullName string
	GroupName       string
	LabName         string
	LabNumber       string
	TutorFullName   string
}
