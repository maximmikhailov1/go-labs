package team

import (
	"time"
)

type CreateRequest struct {
	Name string `json:"name" validate:"required"`
}

type TeamResponse struct {
	ID        uint      `json:"id"`
	Code      string    `json:"code"`
	Name      string    `json:"name"`
	Premade   bool      `json:"premade"`
	CreatedAt time.Time `json:"createdAt"`
	Members   []Member  `json:"members,omitempty"`
}

type Member struct {
	ID       uint   `json:"id"`
	FullName string `json:"fullName"`
}

type UpdateNameRequest struct {
	NewName string `json:"newName" validate:"required"`
}

type JoinLeaveRequest struct {
	Code string `json:"code" validate:"required"`
}
type TeamWithMembers struct {
	ID      uint     `json:"id"`
	Code    string   `json:"code"`
	Name    string   `json:"name"`
	Premade bool     `json:"premade"`
	Members []Member `json:"members"`
}
