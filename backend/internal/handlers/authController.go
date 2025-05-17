package handlers

import (
	"fmt"
	models2 "github.com/maximmikhailov1/go-labs/backend/internal/models"
	"github.com/maximmikhailov1/go-labs/backend/pkg/database"
	"net/http"
	"os"
	"time"

	"github.com/gofiber/fiber/v2"
	"github.com/gofiber/fiber/v2/log"
	"github.com/golang-jwt/jwt/v5"
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
	var user = models2.User{}
	result := database.DB.First(&user, "username = ?", body.Username)

	if result.Error != nil {
		return c.Status(http.StatusBadRequest).JSON(
			fiber.Map{
				"message": "Неверный логин или пароль",
			})
	}

	err := bcrypt.CompareHashAndPassword([]byte(user.PasswordHashed), []byte(body.Password))
	if err != nil {
		return c.Status(http.StatusBadRequest).JSON(
			fiber.Map{
				"message": "Неверный логин или пароль",
			})
	}

	var group models2.Group
	result = database.DB.Model(&group).Where("id = ?", user.GroupID).Find(&group)
	if result.Error != nil {
		return c.Status(http.StatusBadRequest).JSON(
			fiber.Map{
				"message": "Нет группы",
			})
	}
	tokenByte := jwt.New(jwt.SigningMethodHS256)

	now := time.Now()
	claims := tokenByte.Claims.(jwt.MapClaims)

	claims["id"] = user.ID
	claims["fio"] = user.FullName
	claims["group"] = group.Name
	claims["role"] = user.Role
	claims["exp"] = now.Add(time.Hour * 24 * 30).Unix()
	claims["iat"] = now.Unix()
	claims["nbf"] = now.Unix()

	tokenString, err := tokenByte.SignedString([]byte(os.Getenv("SECRET")))

	if err != nil {
		return c.Status(fiber.StatusBadGateway).JSON(fiber.Map{"status": "fail", "error": fmt.Sprintf("generating JWT Token failed: %v", err)})
	}

	c.Cookie(&fiber.Cookie{
		Name:    "token",
		Value:   tokenString,
		Path:    "/",
		Expires: now.Add(time.Hour * 24 * 30),
		Secure:  false,
	})

	return c.Status(http.StatusOK).JSON(fiber.Map{"message": "Успешный вход", "role": user.Role})
}

func SignUp(c *fiber.Ctx) error {

	var body struct {
		Username   string `json:"username"`
		Password   string `json:"password"`
		FullName   string `json:"fullName"`
		SignUpCode string `json:"signUpCode"`
	}
	if err := c.BodyParser(&body); err != nil {
		log.Info(err)
		return err
	}
	var role string
	var group models2.Group
	log.Info(body)

	log.Info(body.SignUpCode)
	secretSignUpCode := os.Getenv("TUTOR_SECRET")
	log.Info(secretSignUpCode)
	if body.SignUpCode == secretSignUpCode {
		role = "tutor"
	} else {
		role = "student"
		result := database.DB.Where("code = ?", body.SignUpCode).First(&group)
		if result.Error != nil {
			return c.Status(http.StatusBadRequest).JSON(fiber.Map{"message": "Нет групп с таким кодом"})
		}
	}

	// cost is lower than usual to prevent 5sec loading time though lowering the security
	hash, err := bcrypt.GenerateFromPassword([]byte(body.Password), 5)
	if err != nil {
		return c.Status(http.StatusBadRequest).JSON(fiber.Map{
			"message": "failed to hash the password",
		})
	}
	user := models2.User{
		Username:       body.Username,
		PasswordHashed: string(hash),
		FullName:       body.FullName,
		Role:           role,
	}
	if user.Role == "student" {
		user.GroupID = &group.ID
	}

	result := database.DB.Debug().Create(&user)
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
