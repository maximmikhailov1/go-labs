package middleware

import (
	"fmt"
	"net/http"
	"os"

	"github.com/gofiber/fiber/v2"
	"github.com/golang-jwt/jwt/v5"
)

func Authorized(c *fiber.Ctx) error {
	jwtTokenString := c.Cookies("token")
	if jwtTokenString != "" {
		tokenByte, err := jwt.Parse(jwtTokenString, func(jwtToken *jwt.Token) (interface{}, error) {
			if _, ok := jwtToken.Method.(*jwt.SigningMethodHMAC); !ok {
				return nil, fmt.Errorf("unexpected signing method: %s", jwtToken.Header["alg"])
			}
			return []byte(os.Getenv("SECRET")), nil
		})
		if err != nil {
			return c.Status(fiber.StatusUnauthorized).JSON(fiber.Map{"status": "fail", "message": fmt.Sprintf("invalidate token: %v", err)})
		}

		claims := tokenByte.Claims.(jwt.MapClaims)
		studentData := fiber.Map{
			"Id":         claims["id"],
			"FirstName":  claims["firstname"],
			"SecondName": claims["secondname"],
			"Group":      claims["group"],
		}
		c.Locals("student", studentData)
	}
	if c.Locals("student") != nil {
		err := c.Bind(c.Locals("student").(fiber.Map))
		if err != nil {
			return c.Status(http.StatusBadRequest).JSON(fiber.Map{
				"message": "failed to bind",
			})
		}
	}

	return c.Next()
}
