package middleware

import (
	"fmt"

	"github.com/gofiber/fiber/v2"
	"github.com/golang-jwt/jwt/v5"
	"github.com/maximmikhailov1/go-labs/api/initializers"
	"github.com/maximmikhailov1/go-labs/api/models"
)

func Authorized(c *fiber.Ctx) error {
	jwtTokenString := c.Cookies("token")
	var student models.Student
	fmt.Println("im middleware")
	if jwtTokenString != "" {
		tokenByte, err := jwt.Parse(jwtTokenString, func(jwtToken *jwt.Token) (interface{}, error) {
			if _, ok := jwtToken.Method.(*jwt.SigningMethodHMAC); !ok {
				return nil, fmt.Errorf("unexpected signing method: %s", jwtToken.Header["alg"])
			}
			return nil, nil
		})
		if err != nil {
			c.Status(fiber.StatusUnauthorized).JSON(fiber.Map{"status": "fail", "message": fmt.Sprintf("invalidate token: %v", err)})
		}

		claims := tokenByte.Claims.(jwt.MapClaims)

		initializers.DB.First(&student, "id = ?", fmt.Sprint(claims["sub"]))
		c.Locals("student", fiber.Map{
			"Id":         student.ID,
			"FirstName":  student.FirstName,
			"SecondName": student.SecondName,
			"Group":      student.Group,
		})
		fmt.Println("Me inside and very well")
	}
	if c.Locals("student") != nil {
		c.Bind(c.Locals("student").(fiber.Map))
	}

	return c.Next()
}
