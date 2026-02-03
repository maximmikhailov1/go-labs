package auth

import (
	"errors"
	"testing"

	"github.com/maximmikhailov1/go-labs/backend/internal/models"
	"golang.org/x/crypto/bcrypt"
)

type mockAuthRepo struct {
	userByUsername *models.User
	userByUsernameErr error
	createUserErr     error
	groupByCode       *models.Group
	groupByCodeErr    error
}

func (m *mockAuthRepo) FindUserByUsername(username string) (*models.User, error) {
	return m.userByUsername, m.userByUsernameErr
}

func (m *mockAuthRepo) CreateUser(user *models.User) error {
	return m.createUserErr
}

func (m *mockAuthRepo) FindGroupByCode(code string) (*models.Group, error) {
	return m.groupByCode, m.groupByCodeErr
}

func TestAuthService_SignIn(t *testing.T) {
	hash, _ := bcrypt.GenerateFromPassword([]byte("pass"), 5)

	tests := []struct {
		name     string
		repo     *mockAuthRepo
		req      SignInRequest
		wantErr  bool
		wantRole string
	}{
		{
			name: "user not found",
			repo: &mockAuthRepo{userByUsernameErr: errors.New("not found")},
			req:  SignInRequest{Username: "u", Password: "p"},
			wantErr: true,
		},
		{
			name: "wrong password",
			repo: &mockAuthRepo{userByUsername: &models.User{Username: "u", PasswordHashed: string(hash), Role: models.RoleStudent}},
			req:  SignInRequest{Username: "u", Password: "wrong"},
			wantErr: true,
		},
		{
			name: "success",
			repo: &mockAuthRepo{userByUsername: &models.User{Username: "u", PasswordHashed: string(hash), Role: models.RoleTutor}},
			req:  SignInRequest{Username: "u", Password: "pass"},
			wantErr:  false,
			wantRole: models.RoleTutor,
		},
	}
	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			s := NewAuthService(tt.repo)
			user, role, err := s.SignIn(tt.req)
			if (err != nil) != tt.wantErr {
				t.Errorf("SignIn() error = %v, wantErr %v", err, tt.wantErr)
				return
			}
			if !tt.wantErr && (role != tt.wantRole || user == nil) {
				t.Errorf("SignIn() role = %v want %v, user nil = %v", role, tt.wantRole, user == nil)
			}
		})
	}
}

func TestAuthService_SignUp(t *testing.T) {
	groupID := uint(1)
	tests := []struct {
		name    string
		repo    *mockAuthRepo
		req     SignUpRequest
		wantErr bool
	}{
		{
			name:    "tutor signup",
			repo:    &mockAuthRepo{},
			req:     SignUpRequest{Username: "t", Password: "p", FullName: "Tutor", SignUpCode: "tutor-secret"},
			wantErr: false,
		},
		{
			name:    "invalid group code",
			repo:    &mockAuthRepo{groupByCodeErr: errors.New("not found")},
			req:     SignUpRequest{Username: "s", Password: "p", FullName: "Student", SignUpCode: "bad"},
			wantErr: true,
		},
		{
			name:    "student signup",
			repo:    &mockAuthRepo{groupByCode: &models.Group{ID: groupID, Code: "G1", Name: "Group 1"}},
			req:     SignUpRequest{Username: "s", Password: "p", FullName: "Student", SignUpCode: "G1"},
			wantErr: false,
		},
		{
			name:    "create user fails",
			repo:    &mockAuthRepo{groupByCode: &models.Group{ID: groupID}, createUserErr: errors.New("db error")},
			req:     SignUpRequest{Username: "s", Password: "p", FullName: "S", SignUpCode: "G1"},
			wantErr: true,
		},
	}
	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			s := NewAuthService(tt.repo)
			s.tutorSecret = "tutor-secret"
			user, err := s.SignUp(tt.req)
			if (err != nil) != tt.wantErr {
				t.Errorf("SignUp() error = %v, wantErr %v", err, tt.wantErr)
				return
			}
			if !tt.wantErr && user == nil {
				t.Error("SignUp() expected user")
			}
		})
	}
}
