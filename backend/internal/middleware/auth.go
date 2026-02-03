package middleware

import (
	"strconv"

	"github.com/gofiber/fiber/v2"
	"github.com/golang-jwt/jwt/v5"
)

type AuthClaims struct {
	UserID   uint   `json:"id"`
	FullName string `json:"fio"`
	Group    string `json:"group"`
	Role     string `json:"role"`
	jwt.RegisteredClaims
}

func AuthMiddleware(secret string) fiber.Handler {
	return func(c *fiber.Ctx) error {
		tokenString := c.Cookies("token")
		if tokenString == "" {
			return fiber.NewError(fiber.StatusUnauthorized, "authorization required")
		}

		claims := &AuthClaims{}
		token, err := jwt.ParseWithClaims(tokenString, claims, func(token *jwt.Token) (interface{}, error) {
			return []byte(secret), nil
		})

		if err != nil || !token.Valid {
			return fiber.NewError(fiber.StatusUnauthorized, "invalid token")
		}
		subIdStr, err := token.Claims.GetSubject()
		if err != nil {
			return fiber.NewError(fiber.StatusUnauthorized, "invalid token")
		}
		subId, err := strconv.Atoi(subIdStr)
		if err != nil {
			return fiber.NewError(fiber.StatusInternalServerError, "failed Atoi")
		}
		claims.UserID = uint(subId)
		aud, err := token.Claims.GetAudience() // [role, fullName, group]
		if err != nil {
			return fiber.NewError(fiber.StatusUnauthorized, "invalid token")
		}

		claims.Role = aud[0]
		claims.FullName = aud[1]
		claims.Group = aud[2]
		c.Locals("user", claims)
		return c.Next()
	}
}

func RoleMiddleware(requiredRole string) fiber.Handler {
	return func(c *fiber.Ctx) error {
		claims := c.Locals("user").(*AuthClaims)
		if claims.Role != requiredRole {
			return fiber.NewError(fiber.StatusForbidden, "insufficient permissions")
		}
		return c.Next()
	}
}
