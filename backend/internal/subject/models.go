package subject

import (
	"time"
)

// SubjectRequest - DTO для создания предмета
type SubjectRequest struct {
	Name        string `json:"name" validate:"required"`
	Description string `json:"description"`
}

// SubjectResponse - DTO для ответа
type SubjectResponse struct {
	ID          uint            `json:"id"`
	Name        string          `json:"name"`
	Description string          `json:"description"`
	CreatedAt   time.Time       `json:"createdAt"`
	Groups      []GroupResponse `json:"groups,omitempty"`
}

// GroupResponse - упрощенная DTO группы
type GroupResponse struct {
	ID   uint   `json:"id"`
	Name string `json:"name"`
}
