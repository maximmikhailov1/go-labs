package auth

import (
	"fmt"
	"github.com/gofiber/fiber/v2"
	"github.com/gofiber/fiber/v2/log"
	"github.com/golang-jwt/jwt/v5"
	"github.com/maximmikhailov1/go-labs/backend/internal/models"
	"github.com/maximmikhailov1/go-labs/backend/pkg/jwtutils"
	"time"
)

type AuthHandler struct {
	service *AuthService
}

func NewAuthHandler(service *AuthService) *AuthHandler {
	return &AuthHandler{service: service}
}

func (h *AuthHandler) SignIn(c *fiber.Ctx) error {
	var req SignInRequest
	if err := c.BodyParser(&req); err != nil {
		return fiber.NewError(fiber.StatusBadRequest, "invalid request")
	}

	user, role, err := h.service.SignIn(req)
	if err != nil {
		return fiber.NewError(fiber.StatusUnauthorized, "invalid credentials")
	}
	log.Debugf("%+v", user)
	group := user.Group
	if group == nil {
		group = &models.Group{
			ID:        0,
			Code:      "none",
			Name:      "none",
			SubjectID: nil,
			Subject:   nil,
			Students:  nil,
		}
	}
	token, err := jwtutils.GenerateToken(
		h.service.jwtSecret,
		jwtutils.CreateAuthClaims(user.ID, user.FullName, group.Name, user.Role),
	)
	if err != nil {
		return fiber.NewError(fiber.StatusInternalServerError, "failed to generate token")
	}

	c.Cookie(&fiber.Cookie{
		Name:     "token",
		Value:    token,
		Expires:  time.Now().Add(time.Hour * 24 * 30),
		HTTPOnly: true,
	})

	return c.JSON(AuthResponse{
		Message: "Успешный вход",
		Role:    role,
	})
}

func (h *AuthHandler) SignUp(c *fiber.Ctx) error {
	var req SignUpRequest
	if err := c.BodyParser(&req); err != nil {
		return fiber.NewError(fiber.StatusBadRequest, "invalid request")
	}

	if _, err := h.service.SignUp(req); err != nil {
		return fiber.NewError(fiber.StatusBadRequest, err.Error())
	}

	return c.JSON(AuthResponse{
		Message: "Пользователь успешно создан",
	})
}

func (h *AuthHandler) Logout(c *fiber.Ctx) error {
	c.ClearCookie("token")
	return c.SendStatus(fiber.StatusOK)
}

func (h *AuthHandler) CheckAuth(c *fiber.Ctx) error {
	tokenString := c.Cookies("token")
	if tokenString == "" {
		return fiber.NewError(fiber.StatusUnauthorized, "authentication required")
	}

	token, err := jwt.ParseWithClaims(tokenString, &JWTClaims{}, func(token *jwt.Token) (interface{}, error) {
		if _, ok := token.Method.(*jwt.SigningMethodHMAC); !ok {
			return nil, fmt.Errorf("unexpected signing method: %v", token.Header["alg"])
		}
		return []byte(h.service.jwtSecret), nil
	})

	if err != nil || !token.Valid {
		return fiber.NewError(fiber.StatusUnauthorized, "invalid token")
	}

	claims, ok := token.Claims.(*JWTClaims)
	if !ok {
		return fiber.NewError(fiber.StatusUnauthorized, "invalid token claims")
	}

	return c.JSON(fiber.Map{
		"role":  claims.Role,
		"id":    claims.ID,
		"fio":   claims.FIO,
		"group": claims.Group,
	})
}
