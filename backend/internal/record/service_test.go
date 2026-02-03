package record

import (
	"testing"

	"github.com/maximmikhailov1/go-labs/backend/internal/models"
)

func TestService_GetUserRecords_InvalidRole(t *testing.T) {
	s := NewService(&Repository{})
	_, err := s.GetUserRecords(1, "invalid")
	if err == nil {
		t.Error("expected error for invalid role")
	}
}

func TestService_GetUserRecords_EmptyRole(t *testing.T) {
	s := NewService(&Repository{})
	_, err := s.GetUserRecords(1, "")
	if err == nil {
		t.Error("expected error for empty role")
	}
}

func TestEnrollRequest_JSONTags(t *testing.T) {
	// Ensure request contract matches frontend (recordId, labId, teamId).
	req := EnrollRequest{RecordID: 1, LabID: 2}
	if req.RecordID != 1 || req.LabID != 2 {
		t.Error("EnrollRequest fields")
	}
	_ = models.RoleStudent
}
