package storage

import (
	"database/sql"
	"fmt"
	"os"
	"path/filepath"
	"time"

	"github.com/dj-pearson/envvault/internal/models"
	"github.com/dj-pearson/envvault/internal/utils"
	"github.com/google/uuid"
	_ "modernc.org/sqlite"
)

// DB wraps the SQLite database
type DB struct {
	conn *sql.DB
	path string
}

// New creates a new database instance with secure permissions
func New(dbPath string) (*DB, error) {
	// Ensure parent directory exists with secure permissions
	parentDir := filepath.Dir(dbPath)
	if err := os.MkdirAll(parentDir, utils.SecureDirMode); err != nil {
		return nil, fmt.Errorf("failed to create database directory: %w", err)
	}

	// Check if database exists
	dbExists := true
	if _, err := os.Stat(dbPath); os.IsNotExist(err) {
		dbExists = false
	}

	// Open database connection
	conn, err := sql.Open("sqlite", dbPath)
	if err != nil {
		return nil, fmt.Errorf("failed to open database: %w", err)
	}

	// Set connection parameters for better performance and safety
	conn.SetMaxOpenConns(1) // SQLite doesn't support concurrent writes
	conn.SetMaxIdleConns(1)
	conn.SetConnMaxLifetime(0)

	db := &DB{
		conn: conn,
		path: dbPath,
	}

	// Initialize schema
	if err := db.initSchema(); err != nil {
		conn.Close()
		return nil, fmt.Errorf("failed to initialize schema: %w", err)
	}

	// Enforce secure file permissions on database file
	if err := utils.EnsureSecureFilePermissions(dbPath); err != nil {
		conn.Close()
		return nil, fmt.Errorf("failed to set secure permissions on database: %w", err)
	}

	// Warn if database already existed with insecure permissions
	if dbExists {
		if secure, err := utils.CheckFilePermissions(dbPath); err == nil && !secure {
			// Permissions were insecure but now fixed
			utils.Warn("Database file had insecure permissions (fixed automatically)")
		}
	}

	return db, nil
}

// Close closes the database connection
func (db *DB) Close() error {
	if db.conn != nil {
		return db.conn.Close()
	}
	return nil
}

// initSchema creates all tables and indices
func (db *DB) initSchema() error {
	_, err := db.conn.Exec(schema)
	return err
}

// CreateProject creates a new project
func (db *DB) CreateProject(name, description, ownerID string) (*models.Project, error) {
	project := &models.Project{
		ID:          uuid.New().String(),
		Name:        name,
		Description: description,
		OwnerID:     ownerID,
		SyncEnabled: false,
		CreatedAt:   time.Now(),
		UpdatedAt:   time.Now(),
	}

	query := `
		INSERT INTO projects (id, name, description, owner_id, sync_enabled, created_at, updated_at)
		VALUES (?, ?, ?, ?, ?, ?, ?)
	`

	_, err := db.conn.Exec(query,
		project.ID,
		project.Name,
		project.Description,
		project.OwnerID,
		boolToInt(project.SyncEnabled),
		project.CreatedAt,
		project.UpdatedAt,
	)

	if err != nil {
		return nil, fmt.Errorf("failed to create project: %w", err)
	}

	return project, nil
}

// GetProject retrieves a project by ID
func (db *DB) GetProject(id string) (*models.Project, error) {
	query := `
		SELECT id, name, description, team_id, owner_id, sync_enabled, created_at, updated_at
		FROM projects
		WHERE id = ?
	`

	var project models.Project
	var syncEnabled int
	var teamID sql.NullString

	err := db.conn.QueryRow(query, id).Scan(
		&project.ID,
		&project.Name,
		&project.Description,
		&teamID,
		&project.OwnerID,
		&syncEnabled,
		&project.CreatedAt,
		&project.UpdatedAt,
	)

	if err == sql.ErrNoRows {
		return nil, fmt.Errorf("project not found")
	}
	if err != nil {
		return nil, fmt.Errorf("failed to get project: %w", err)
	}

	project.SyncEnabled = syncEnabled == 1
	if teamID.Valid {
		project.TeamID = &teamID.String
	}

	return &project, nil
}

// ListProjects lists all projects
func (db *DB) ListProjects() ([]*models.Project, error) {
	query := `
		SELECT id, name, description, team_id, owner_id, sync_enabled, created_at, updated_at
		FROM projects
		ORDER BY updated_at DESC
	`

	rows, err := db.conn.Query(query)
	if err != nil {
		return nil, fmt.Errorf("failed to list projects: %w", err)
	}
	defer rows.Close()

	var projects []*models.Project
	for rows.Next() {
		var project models.Project
		var syncEnabled int
		var teamID sql.NullString

		err := rows.Scan(
			&project.ID,
			&project.Name,
			&project.Description,
			&teamID,
			&project.OwnerID,
			&syncEnabled,
			&project.CreatedAt,
			&project.UpdatedAt,
		)
		if err != nil {
			return nil, fmt.Errorf("failed to scan project: %w", err)
		}

		project.SyncEnabled = syncEnabled == 1
		if teamID.Valid {
			project.TeamID = &teamID.String
		}

		projects = append(projects, &project)
	}

	return projects, rows.Err()
}

// DeleteProject deletes a project and all its data
func (db *DB) DeleteProject(id string) error {
	query := `DELETE FROM projects WHERE id = ?`
	result, err := db.conn.Exec(query, id)
	if err != nil {
		return fmt.Errorf("failed to delete project: %w", err)
	}

	rows, err := result.RowsAffected()
	if err != nil {
		return fmt.Errorf("failed to check rows affected: %w", err)
	}

	if rows == 0 {
		return fmt.Errorf("project not found")
	}

	return nil
}

// CreateEnvironment creates a new environment
func (db *DB) CreateEnvironment(projectID, name string) (*models.Environment, error) {
	env := &models.Environment{
		ID:        uuid.New().String(),
		ProjectID: projectID,
		Name:      name,
		CreatedAt: time.Now(),
		UpdatedAt: time.Now(),
	}

	query := `
		INSERT INTO environments (id, project_id, name, created_at, updated_at)
		VALUES (?, ?, ?, ?, ?)
	`

	_, err := db.conn.Exec(query, env.ID, env.ProjectID, env.Name, env.CreatedAt, env.UpdatedAt)
	if err != nil {
		return nil, fmt.Errorf("failed to create environment: %w", err)
	}

	return env, nil
}

// GetEnvironment retrieves an environment by project and name
func (db *DB) GetEnvironment(projectID, name string) (*models.Environment, error) {
	query := `
		SELECT id, project_id, name, created_at, updated_at
		FROM environments
		WHERE project_id = ? AND name = ?
	`

	var env models.Environment
	err := db.conn.QueryRow(query, projectID, name).Scan(
		&env.ID,
		&env.ProjectID,
		&env.Name,
		&env.CreatedAt,
		&env.UpdatedAt,
	)

	if err == sql.ErrNoRows {
		return nil, fmt.Errorf("environment not found")
	}
	if err != nil {
		return nil, fmt.Errorf("failed to get environment: %w", err)
	}

	return &env, nil
}

// ListEnvironments lists all environments for a project
func (db *DB) ListEnvironments(projectID string) ([]*models.Environment, error) {
	query := `
		SELECT id, project_id, name, created_at, updated_at
		FROM environments
		WHERE project_id = ?
		ORDER BY name
	`

	rows, err := db.conn.Query(query, projectID)
	if err != nil {
		return nil, fmt.Errorf("failed to list environments: %w", err)
	}
	defer rows.Close()

	var envs []*models.Environment
	for rows.Next() {
		var env models.Environment
		err := rows.Scan(&env.ID, &env.ProjectID, &env.Name, &env.CreatedAt, &env.UpdatedAt)
		if err != nil {
			return nil, fmt.Errorf("failed to scan environment: %w", err)
		}
		envs = append(envs, &env)
	}

	return envs, rows.Err()
}

// CreateSecret creates or updates a secret
func (db *DB) CreateSecret(environmentID, key string, encryptedValue []byte, description string) (*models.Secret, error) {
	secret := &models.Secret{
		ID:             uuid.New().String(),
		EnvironmentID:  environmentID,
		Key:            key,
		EncryptedValue: encryptedValue,
		Description:    description,
		CreatedAt:      time.Now(),
		UpdatedAt:      time.Now(),
	}

	query := `
		INSERT INTO secrets (id, environment_id, key, encrypted_value, description, created_at, updated_at)
		VALUES (?, ?, ?, ?, ?, ?, ?)
		ON CONFLICT(environment_id, key) DO UPDATE SET
			encrypted_value = excluded.encrypted_value,
			description = excluded.description,
			updated_at = excluded.updated_at
	`

	_, err := db.conn.Exec(query,
		secret.ID,
		secret.EnvironmentID,
		secret.Key,
		secret.EncryptedValue,
		secret.Description,
		secret.CreatedAt,
		secret.UpdatedAt,
	)

	if err != nil {
		return nil, fmt.Errorf("failed to create secret: %w", err)
	}

	return secret, nil
}

// GetSecret retrieves a secret by environment and key
func (db *DB) GetSecret(environmentID, key string) (*models.Secret, error) {
	query := `
		SELECT id, environment_id, key, encrypted_value, description, created_at, updated_at
		FROM secrets
		WHERE environment_id = ? AND key = ?
	`

	var secret models.Secret
	err := db.conn.QueryRow(query, environmentID, key).Scan(
		&secret.ID,
		&secret.EnvironmentID,
		&secret.Key,
		&secret.EncryptedValue,
		&secret.Description,
		&secret.CreatedAt,
		&secret.UpdatedAt,
	)

	if err == sql.ErrNoRows {
		return nil, fmt.Errorf("secret not found")
	}
	if err != nil {
		return nil, fmt.Errorf("failed to get secret: %w", err)
	}

	return &secret, nil
}

// ListSecrets lists all secrets for an environment
func (db *DB) ListSecrets(environmentID string) ([]*models.Secret, error) {
	query := `
		SELECT id, environment_id, key, encrypted_value, description, created_at, updated_at
		FROM secrets
		WHERE environment_id = ?
		ORDER BY key
	`

	rows, err := db.conn.Query(query, environmentID)
	if err != nil {
		return nil, fmt.Errorf("failed to list secrets: %w", err)
	}
	defer rows.Close()

	var secrets []*models.Secret
	for rows.Next() {
		var secret models.Secret
		err := rows.Scan(
			&secret.ID,
			&secret.EnvironmentID,
			&secret.Key,
			&secret.EncryptedValue,
			&secret.Description,
			&secret.CreatedAt,
			&secret.UpdatedAt,
		)
		if err != nil {
			return nil, fmt.Errorf("failed to scan secret: %w", err)
		}
		secrets = append(secrets, &secret)
	}

	return secrets, rows.Err()
}

// DeleteSecret deletes a secret
func (db *DB) DeleteSecret(environmentID, key string) error {
	query := `DELETE FROM secrets WHERE environment_id = ? AND key = ?`
	result, err := db.conn.Exec(query, environmentID, key)
	if err != nil {
		return fmt.Errorf("failed to delete secret: %w", err)
	}

	rows, err := result.RowsAffected()
	if err != nil {
		return fmt.Errorf("failed to check rows affected: %w", err)
	}

	if rows == 0 {
		return fmt.Errorf("secret not found")
	}

	return nil
}

// Helper function to convert bool to int for SQLite
func boolToInt(b bool) int {
	if b {
		return 1
	}
	return 0
}
