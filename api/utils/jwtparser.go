package utils

import (
	"fmt"
	"os"
	"strconv"

	"github.com/golang-jwt/jwt/v5"
)

func ParseJWT(jwtToken string) (int, error) {
	claims := jwt.MapClaims{}
	token, err := jwt.ParseWithClaims(jwtToken, claims, func(t *jwt.Token) (interface{}, error) {
		return []byte(os.Getenv("SECRET")), nil
	})
	if err != nil {
		return 0, err
	}
	idStr, err := token.Claims.GetSubject()
	if err != nil {
		return 0, err
	}
	fmt.Println(idStr)
	id, err := strconv.Atoi(idStr)
	if err != nil {
		return 0, err
	}
	return id, nil
}
