package controllers

import (
	"net/http"
	"os"
	"time"

	"github.com/gofiber/fiber/v2"
	"github.com/gofiber/fiber/v2/log"
	"github.com/golang-jwt/jwt/v5"
	"github.com/maximmikhailov1/go-labs/api/initializers"
	"github.com/maximmikhailov1/go-labs/api/models"
	"golang.org/x/crypto/bcrypt"
)

func SingIn(c *fiber.Ctx) error {
	var body struct {
		Username string
		Password string
	}
	if err := c.BodyParser(&body); err != nil {
		log.Info(err)
		return err
	}
	var student = models.Student{}
	result := initializers.DB.First(&student, "username = ?", body.Username)

	if result.Error != nil {
		return c.Status(http.StatusBadRequest).JSON(
			fiber.Map{
				"message": "invalid username or password",
			})
	}

	err := bcrypt.CompareHashAndPassword([]byte(student.HashedPassword), []byte(body.Password))
	if err != nil {
		return c.Status(http.StatusBadRequest).JSON(
			fiber.Map{
				"message": "invalid username or password",
			})
	}

	token := jwt.NewWithClaims(jwt.SigningMethodHS256, jwt.MapClaims{
		"subcriber":  student.ID,
		"expiration": time.Now().Add(time.Hour * 24 * 30).Unix(),
	})
	tokenString, err := token.SignedString([]byte(os.Getenv("SECRET")))
	if err != nil {
		return c.Status(http.StatusBadRequest).JSON(
			fiber.Map{
				"message": "failed to create a token",
				"error":   err.Error(),
			})
	}

	cookie := new(fiber.Cookie)
	cookie.Name = "auth"
	cookie.Value = tokenString
	cookie.Expires = time.Now().Add(time.Hour * 24 * 30)
	c.Cookie(cookie)

	return c.Status(http.StatusOK).JSON(fiber.Map{"message": "Logged in"})
}

func SignUp(c *fiber.Ctx) error {
	var body struct {
		Username string
		Password string
	}
	if err := c.BodyParser(&body); err != nil {
		log.Info(err)
		return err
	}
	hash, err := bcrypt.GenerateFromPassword([]byte(body.Password), 16)
	if err != nil {
		return c.Status(http.StatusBadRequest).JSON(fiber.Map{
			"message": "failed to hash the password",
		})
	}
	student := models.Student{Username: body.Username, HashedPassword: string(hash)}
	result := initializers.DB.Create(&student)
	if result.Error != nil {
		return c.Status(http.StatusBadRequest).JSON(fiber.Map{
			"message": "failed to create a user",
		})
	}
	return c.Status(http.StatusOK).JSON(fiber.Map{"message": "created user successfully"})
}

func Validate(c *fiber.Ctx) error {
	return c.Status(http.StatusOK).JSON(fiber.Map{
		"message": "logged in",
	})
}
