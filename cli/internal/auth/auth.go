package auth

import (
	"encoding/json"
	"fmt"
	"os"
	"path/filepath"
	"time"

	"github.com/dj-pearson/envault/internal/config"
	"github.com/dj-pearson/envault/internal/models"
)

// Session represents an authenticated session
type Session struct {
	UserID      string    `json:"user_id"`
	Email       string    `json:"email"`
	AccessToken string    `json:"access_token"`
	ExpiresAt   time.Time `json:"expires_at"`
}

// SaveSession saves the authentication session to disk
func SaveSession(session *Session) error {
	cfg, err := config.New()
	if err != nil {
		return fmt.Errorf("failed to create config: %w", err)
	}

	if err := cfg.EnsureDirectories(); err != nil {
		return fmt.Errorf("failed to ensure directories: %w", err)
	}

	sessionPath := filepath.Join(cfg.AuthDir, "session.json")

	data, err := json.MarshalIndent(session, "", "  ")
	if err != nil {
		return fmt.Errorf("failed to marshal session: %w", err)
	}

	if err := os.WriteFile(sessionPath, data, 0600); err != nil {
		return fmt.Errorf("failed to write session file: %w", err)
	}

	return nil
}

// LoadSession loads the authentication session from disk
func LoadSession() (*Session, error) {
	cfg, err := config.New()
	if err != nil {
		return nil, fmt.Errorf("failed to create config: %w", err)
	}

	sessionPath := filepath.Join(cfg.AuthDir, "session.json")

	// Check if session file exists
	if _, err := os.Stat(sessionPath); os.IsNotExist(err) {
		return nil, fmt.Errorf("not logged in (run 'envault login' first)")
	}

	data, err := os.ReadFile(sessionPath)
	if err != nil {
		return nil, fmt.Errorf("failed to read session file: %w", err)
	}

	var session Session
	if err := json.Unmarshal(data, &session); err != nil {
		return nil, fmt.Errorf("failed to parse session file: %w", err)
	}

	// Check if session is expired
	if time.Now().After(session.ExpiresAt) {
		return nil, fmt.Errorf("session expired (run 'envault login' again)")
	}

	return &session, nil
}

// ClearSession removes the authentication session
func ClearSession() error {
	cfg, err := config.New()
	if err != nil {
		return fmt.Errorf("failed to create config: %w", err)
	}

	sessionPath := filepath.Join(cfg.AuthDir, "session.json")

	if err := os.Remove(sessionPath); err != nil && !os.IsNotExist(err) {
		return fmt.Errorf("failed to remove session file: %w", err)
	}

	return nil
}

// IsLoggedIn checks if there is a valid session
func IsLoggedIn() bool {
	session, err := LoadSession()
	if err != nil {
		return false
	}

	return time.Now().Before(session.ExpiresAt)
}

// GetCurrentUser returns the current authenticated user
func GetCurrentUser() (*models.AuthSession, error) {
	session, err := LoadSession()
	if err != nil {
		return nil, err
	}

	return &models.AuthSession{
		UserID:      session.UserID,
		Email:       session.Email,
		AccessToken: session.AccessToken,
		ExpiresAt:   session.ExpiresAt,
	}, nil
}
