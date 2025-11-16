package models

import "time"

// Project represents a project that contains multiple environments
type Project struct {
	ID          string    `json:"id"`
	Name        string    `json:"name"`
	Description string    `json:"description,omitempty"`
	TeamID      *string   `json:"team_id,omitempty"`
	OwnerID     string    `json:"owner_id"`
	SyncEnabled bool      `json:"sync_enabled"`
	CreatedAt   time.Time `json:"created_at"`
	UpdatedAt   time.Time `json:"updated_at"`
}

// Environment represents an environment (dev, staging, production, etc.)
type Environment struct {
	ID        string    `json:"id"`
	ProjectID string    `json:"project_id"`
	Name      string    `json:"name"`
	CreatedAt time.Time `json:"created_at"`
	UpdatedAt time.Time `json:"updated_at"`
}

// Secret represents an encrypted environment variable
type Secret struct {
	ID             string    `json:"id"`
	EnvironmentID  string    `json:"environment_id"`
	Key            string    `json:"key"`
	EncryptedValue []byte    `json:"encrypted_value"`
	Description    string    `json:"description,omitempty"`
	CreatedAt      time.Time `json:"created_at"`
	UpdatedAt      time.Time `json:"updated_at"`
}

// DecryptedSecret represents a secret with its decrypted value
type DecryptedSecret struct {
	Key         string `json:"key"`
	Value       string `json:"value"`
	Description string `json:"description,omitempty"`
}

// AuditLog represents an audit log entry
type AuditLog struct {
	ID        string    `json:"id"`
	ProjectID string    `json:"project_id"`
	UserID    string    `json:"user_id"`
	Action    string    `json:"action"`
	Metadata  string    `json:"metadata,omitempty"`
	CreatedAt time.Time `json:"created_at"`
}

// AuthSession represents an authenticated session
type AuthSession struct {
	UserID      string    `json:"user_id"`
	Email       string    `json:"email"`
	AccessToken string    `json:"access_token"`
	ExpiresAt   time.Time `json:"expires_at"`
}
