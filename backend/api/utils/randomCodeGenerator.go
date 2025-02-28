package utils

import (
	"crypto/rand"
	"math/big"
)

// returns n crypto random symbols
func GenerateRandomCode(n int) (string, error) {
	const letters = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789"
	res := make([]byte, n)
	for i := 0; i < n; i++ {
		num, err := rand.Int(rand.Reader, big.NewInt(int64(len(letters))))
		if err != nil {
			return "", err
		}
		res[i] = letters[num.Int64()]
	}

	return string(res), nil
}
