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
		Username   string
		Password   string
		FirstName  string
		SecondName string
		Patronymic string
		Group      string
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
	tokenByte := jwt.New(jwt.SigningMethodHS256)

	now := time.Now()
	claims := tokenByte.Claims.(jwt.MapClaims)

	claims["sub"] = student.ID
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
	// token := jwt.NewWithClaims(jwt.SigningMethodHS256, jwt.MapClaims{
	// 	"sub": strconv.Itoa(int(student.ID)),
	// 	"exp": time.Now().Add(time.Hour * 24 * 30).Unix(),
	// })
	// tokenString, err := token.SignedString([]byte(os.Getenv("SECRET")))
	// if err != nil {
	// 	return c.Status(http.StatusBadRequest).JSON(
	// 		fiber.Map{
	// 			"message": "failed to create a token",
	// 			"error":   err.Error(),
	// 		})
	// }
	// cookie := new(fiber.Cookie)
	// cookie.Name = "auth"
	// cookie.Value = tokenString
	// cookie.Expires = time.Now().Add(time.Hour * 24 * 30)
	// c.Cookie(cookie)

	return c.Status(http.StatusOK).JSON(fiber.Map{"message": "Logged in"})
}

func SignUp(c *fiber.Ctx) error {
	var body struct {
		Username   string
		Password   string
		FirstName  string
		SecondName string
		Patronymic string
		Group      string
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
	student := models.Student{
		Username:       body.Username,
		HashedPassword: string(hash),
		FirstName:      body.FirstName,
		SecondName:     body.SecondName,
		Patronymic:     body.Patronymic,
		Group:          body.Group,
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
	return c.Redirect("/")
}
