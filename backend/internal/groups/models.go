package group

import (
	"time"
)

type CreateRequest struct {
	Name string `json:"name" validate:"required,min=2,max=50"`
}

type GroupResponse struct {
	ID        uint      `json:"id"`
	Code      string    `json:"code"`
	Name      string    `json:"name"`
	SubjectID *uint     `json:"subjectId,omitempty"`
	CreatedAt time.Time `json:"createdAt"`
	UpdatedAt time.Time `json:"updatedAt"`
}

type UpdateSubjectRequest struct {
	GroupID   uint `json:"groupId" validate:"required"`
	SubjectID uint `json:"subjectId" validate:"required"`
}

type GroupWithSubjectResponse struct {
	ID      uint        `json:"id"`
	Code    string      `json:"code"`
	Name    string      `json:"name"`
	Subject SubjectInfo `json:"subject,omitempty"`
}

type SubjectInfo struct {
	ID   uint   `json:"id"`
	Name string `json:"name"`
}
