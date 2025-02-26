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

	var group models.Group
	result = initializers.DB.Model(&group).Where("id = ?", user.GroupID).Find(&group)
	if result.Error != nil {
		return c.Status(http.StatusBadRequest).JSON(
			fiber.Map{
				"message": "invalid no group",
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
		return c.Status(fiber.StatusBadGateway).JSON(fiber.Map{"status": "fail", "message": fmt.Sprintf("generating JWT Token failed: %v", err)})
	}

	c.Cookie(&fiber.Cookie{
		Name:    "token",
		Value:   tokenString,
		Path:    "/",
		Expires: now.Add(time.Hour * 24 * 30),
		Secure:  false,
	})

	return c.Status(http.StatusOK).JSON(fiber.Map{"message": "Logged in", "role": user.Role})
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
	var group models.Group
	log.Info(body)

	log.Info(body.SignUpCode)
	secretSignUpCode := os.Getenv("TUTOR_SECRET")
	log.Info(secretSignUpCode)
	if body.SignUpCode == secretSignUpCode {
		role = "tutor"
	} else {
		role = "student"
		result := initializers.DB.Where("code = ?", body.SignUpCode).First(&group)
		if result.Error != nil {
			return c.Status(http.StatusBadRequest).JSON("no groups under that code")
		}
	}

	// cost is lower than usual to prevent 5sec loading time though lowering the security
	hash, err := bcrypt.GenerateFromPassword([]byte(body.Password), 5)
	if err != nil {
		return c.Status(http.StatusBadRequest).JSON(fiber.Map{
			"message": "failed to hash the password",
		})
	}
	user := models.User{
		Username:       body.Username,
		PasswordHashed: string(hash),
		FullName:       body.FullName,
		Role:           role,
	}
	if user.Role == "student" {
		user.GroupID = &group.ID
	}

	result := initializers.DB.Debug().Create(&user)
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
