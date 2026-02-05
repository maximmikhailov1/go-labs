package auth

import (
	"errors"
	"os"
	"strings"

	"github.com/maximmikhailov1/go-labs/backend/internal/models"
	"golang.org/x/crypto/bcrypt"
)

type AuthRepositoryInterface interface {
	FindUserByUsername(username string) (*models.User, error)
	CreateUser(user *models.User) error
	FindGroupByCode(code string) (*models.Group, error)
}

type AuthService struct {
	repo        AuthRepositoryInterface
	jwtSecret   string
	tutorSecret string
}

func NewAuthService(repo AuthRepositoryInterface) *AuthService {
	return &AuthService{
		repo:        repo,
		jwtSecret:   os.Getenv("SECRET"),
		tutorSecret: os.Getenv("TUTOR_SECRET"),
	}
}

func (s *AuthService) SignIn(req SignInRequest) (*models.User, string, error) {
	user, err := s.repo.FindUserByUsername(req.Username)
	if err != nil {
		return nil, "", errors.New("invalid credentials")
	}

	if err := bcrypt.CompareHashAndPassword([]byte(user.PasswordHashed), []byte(req.Password)); err != nil {
		return nil, "", errors.New("invalid credentials")
	}
	return user, user.Role, nil
}

func (s *AuthService) SignUp(req SignUpRequest) (*models.User, error) {
	var role string
	var groupID *uint

	if req.SignUpCode == s.tutorSecret {
		role = models.RoleTutor
	} else {
		group, err := s.repo.FindGroupByCode(req.SignUpCode)
		if err != nil {
			return nil, errors.New("invalid group code")
		}
		role = models.RoleStudent
		groupID = &group.ID
	}

	hash, err := bcrypt.GenerateFromPassword([]byte(req.Password), 5)
	if err != nil {
		return nil, errors.New("failed to hash password")
	}

	user := &models.User{
		Username:       req.Username,
		PasswordHashed: string(hash),
		FullName:       req.FullName,
		Role:           role,
		GroupID:        groupID,
	}

	if err := s.repo.CreateUser(user); err != nil {
		if strings.Contains(err.Error(), "duplicate") || strings.Contains(err.Error(), "unique") {
			return nil, errors.New("пользователь с таким логином уже существует")
		}
		return nil, errors.New("не удалось создать пользователя")
	}

	return user, nil
}
