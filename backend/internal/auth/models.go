package auth

import (
	"github.com/golang-jwt/jwt/v5"
)

type SignInRequest struct {
	Username string `json:"username" validate:"required"`
	Password string `json:"password" validate:"required"`
}

type SignUpRequest struct {
	Username   string `json:"username" validate:"required"`
	Password   string `json:"password" validate:"required"`
	FullName   string `json:"fullName" validate:"required"`
	SignUpCode string `json:"signUpCode" validate:"required"`
}

type AuthResponse struct {
	Message string `json:"message"`
	Role    string `json:"role,omitempty"`
}

type JWTClaims struct {
	ID    uint   `json:"id"`
	FIO   string `json:"fio"`
	Group string `json:"group,omitempty"`
	Role  string `json:"role"`
	jwt.RegisteredClaims
}
