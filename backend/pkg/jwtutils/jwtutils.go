package jwtutils

import (
	"fmt"
	"github.com/golang-jwt/jwt/v5"
	"github.com/google/uuid"
	"time"
)

func GenerateToken(secret string, claims jwt.Claims) (string, error) {
	token := jwt.NewWithClaims(jwt.SigningMethodHS256, claims)
	return token.SignedString([]byte(secret))
}

func CreateAuthClaims(userID uint, fullName, groupName, role string) jwt.Claims {
	now := time.Now()
	return &jwt.RegisteredClaims{
		Subject:   fmt.Sprintf("%d", userID),
		IssuedAt:  jwt.NewNumericDate(now),
		ExpiresAt: jwt.NewNumericDate(now.Add(time.Hour * 24 * 30)),
		NotBefore: jwt.NewNumericDate(now),
		ID:        uuid.NewString(),
		Audience:  []string{role, fullName, groupName},
		Issuer:    "auth-service",
	}
}
