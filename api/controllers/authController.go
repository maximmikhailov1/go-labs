package controllers

import (
	"fmt"
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
	var user = models.User{}
	result := initializers.DB.First(&user, "username = ?", body.Username)

	if result.Error != nil {
		return c.Status(http.StatusBadRequest).JSON(
			fiber.Map{
				"message": "invalid username or password",
			})
	}

	err := bcrypt.CompareHashAndPassword([]byte(user.PasswordHashed), []byte(body.Password))
	if err != nil {
		return c.Status(http.StatusBadRequest).JSON(
			fiber.Map{
				"message": "invalid username or password",
			})
	}
	tokenByte := jwt.New(jwt.SigningMethodHS256)

	now := time.Now()
	claims := tokenByte.Claims.(jwt.MapClaims)

	claims["id"] = user.ID
	claims["firstname"] = user.FirstName
	claims["secondname"] = user.SecondName
	claims["group"] = user.Group
	claims["role"] = user.Role
	claims["exp"] = now.Add(time.Hour * 24 * 30).Unix()
	claims["iat"] = now.Unix()
	claims["nbf"] = now.Unix()

	tokenString, err := tokenByte.SignedString([]byte(os.Getenv("SECRET")))

	if err != nil {
		return c.Status(fiber.StatusBadGateway).JSON(fiber.Map{"status": "fail", "message": fmt.Sprintf("generating JWT Token failed: %v", err)})
	}

	c.Cookie(&fiber.Cookie{
		Name:    "token",
		Value:   tokenString,
		Path:    "/",
		Expires: now.Add(time.Hour * 24 * 30),
		Secure:  false,
	})

	return c.Status(http.StatusOK).JSON(fiber.Map{"message": "Logged in"})
}

func SignUp(c *fiber.Ctx) error {

	var body struct {
		Username   string `json:"username"`
		Password   string `json:"password"`
		FirstName  string `json:"firstName"`
		SecondName string `json:"secondName"`
		Patronymic string `json:"patronymic"`
		SingUpCode string `json:"signUpCode"`
	}
	if err := c.BodyParser(&body); err != nil {
		log.Info(err)
		return err
	}
	var role string
	var group models.Group
	log.Info(body)

	log.Info(group)
	log.Info(body.SingUpCode)
	secretSignUpCode := os.Getenv("TUTOR_SECRET")
	log.Info(secretSignUpCode)
	if body.SingUpCode == secretSignUpCode {
		role = "tutor"
	} else {
		role = "student"
		initializers.DB.Where("code = ?", body.SingUpCode).First(&group)
	}

	// cost is lower than usual to prevent 5sec loading time though lowering the security
	hash, err := bcrypt.GenerateFromPassword([]byte(body.Password), 5)
	if err != nil {
		return c.Status(http.StatusBadRequest).JSON(fiber.Map{
			"message": "failed to hash the password",
		})
	}
	student := models.User{
		Username:       body.Username,
		PasswordHashed: string(hash),
		FirstName:      body.FirstName,
		SecondName:     body.SecondName,
		Patronymic:     body.Patronymic,
		Role:           role,
	}
	if student.Role == "student" {
		student.Group = &group.Name
	}
	result := initializers.DB.Create(&student)
	if result.Error != nil {
		return c.Status(http.StatusBadRequest).JSON(fiber.Map{
			"message": "failed to create a user",
		})
	}
	return c.Status(http.StatusOK).JSON(fiber.Map{"message": "created user successfully"})
}

func Logout(c *fiber.Ctx) error {
	expired := time.Now().Add(-time.Hour * 24 * 30)
	c.Cookie(&fiber.Cookie{
		Name:    "token",
		Value:   "",
		Expires: expired,
	})
	return c.SendStatus(http.StatusOK)
}
