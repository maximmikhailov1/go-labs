package middleware

import (
	"fmt"
	"net/http"
	"os"
	"reflect"

	"github.com/gofiber/fiber/v2"
	"github.com/gofiber/fiber/v2/log"
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
			return c.Status(fiber.StatusUnauthorized).JSON(fiber.Map{"status": "fail", "message": fmt.Sprintf("invalid token: %v", err)})
		}

		claims := tokenByte.Claims.(jwt.MapClaims)

		var trID uint
		rtest := reflect.ValueOf(claims["id"])
		log.Info(rtest)
		switch rtest.Kind() {
		case reflect.Float64:
			trID = uint(claims["id"].(float64))
		case reflect.Int:
			trID = claims["id"].(uint)
		}
		//SOMETHING WRONG WITH TYPE OF ID inside claims something with uint float64 shenanigans
		log.Info(trID, reflect.TypeOf(trID), reflect.ValueOf(trID))
		log.Info(claims["firstname"], reflect.TypeOf(claims["firstname"]))
		log.Info(claims["secondname"], reflect.TypeOf(claims["secondname"]))
		log.Info(claims["group"], reflect.TypeOf(claims["group"]))
		studentData := fiber.Map{
			"Id":         trID,
			"FirstName":  claims["firstname"],
			"SecondName": claims["secondname"],
			"Group":      claims["group"],
			"Role":       claims["role"],
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
