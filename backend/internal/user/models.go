package user

import "time"

type UserResponse struct {
	ID        uint      `json:"id"`
	Username  string    `json:"username"`
	FullName  string    `json:"fullName"`
	Role      string    `json:"role"`
	GroupName string    `json:"groupName,omitempty"`
	CreatedAt time.Time `json:"createdAt"`
}

type ProfileResponse struct {
	ID        uint   `json:"id"`
	FullName  string `json:"fullName"`
	GroupName string `json:"groupName"`
}

type TutorResponse struct {
	ID       uint   `json:"id"`
	Username string `json:"username"`
	FullName string `json:"fullName"`
}
