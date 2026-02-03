package middleware

import (
	"io"
	"net/http/httptest"
	"testing"

	"github.com/gofiber/fiber/v2"
	"github.com/golang-jwt/jwt/v5"
	"github.com/maximmikhailov1/go-labs/backend/internal/models"
)

func TestAuthClaims_RegisteredClaims(t *testing.T) {
	c := &AuthClaims{
		UserID:   1,
		FullName: "Test",
		Group:    "G1",
		Role:     models.RoleStudent,
		RegisteredClaims: jwt.RegisteredClaims{
			Subject:  "1",
			Audience: jwt.ClaimStrings{models.RoleStudent, "Test", "G1"},
		},
	}
	token := jwt.NewWithClaims(jwt.SigningMethodHS256, c)
	_, err := token.SignedString([]byte("secret"))
	if err != nil {
		t.Fatal(err)
	}
}

// TestAuthMiddleware_NoCookie returns 401 when no token cookie.
func TestAuthMiddleware_NoCookie(t *testing.T) {
	app := fiber.New()
	app.Get("/", AuthMiddleware("test-secret"), func(c *fiber.Ctx) error { return c.SendString("ok") })

	req := httptest.NewRequest("GET", "/", nil)
	resp, err := app.Test(req)
	if err != nil {
		t.Fatal(err)
	}
	defer resp.Body.Close()
	if resp.StatusCode != fiber.StatusUnauthorized {
		body, _ := io.ReadAll(resp.Body)
		t.Errorf("expected 401, got %d body %s", resp.StatusCode, string(body))
	}
}
