package config

import (
	"fmt"
	"os"
	"path/filepath"

	"github.com/dj-pearson/envvault/internal/utils"
)

const (
	AppName     = "envvault"
	ConfigFile  = "config.yml"
	DBFile      = "projects.db"
	AuthFile    = "auth/session.json"
	KeysDir     = "auth/keys"
	CacheDir    = "cache"
)

// Config holds the global configuration
type Config struct {
	HomeDir    string
	ConfigDir  string
	DataDir    string
	AuthDir    string
	KeysDir    string
	CacheDir   string
	ConfigFile string
	DBPath     string
}

// New creates a new configuration instance
func New() (*Config, error) {
	home, err := os.UserHomeDir()
	if err != nil {
		return nil, fmt.Errorf("failed to get home directory: %w", err)
	}

	baseDir := filepath.Join(home, fmt.Sprintf(".%s", AppName))

	cfg := &Config{
		HomeDir:    home,
		ConfigDir:  baseDir,
		DataDir:    filepath.Join(baseDir, "data"),
		AuthDir:    filepath.Join(baseDir, "auth"),
		KeysDir:    filepath.Join(baseDir, "auth", "keys"),
		CacheDir:   filepath.Join(baseDir, "cache"),
		ConfigFile: filepath.Join(baseDir, ConfigFile),
		DBPath:     filepath.Join(baseDir, "data", DBFile),
	}

	return cfg, nil
}

// EnsureDirectories creates all necessary directories with secure permissions
func (c *Config) EnsureDirectories() error {
	dirs := []string{
		c.ConfigDir,
		c.DataDir,
		c.AuthDir,
		c.KeysDir,
		c.CacheDir,
	}

	for _, dir := range dirs {
		// Create directory with secure permissions (owner only)
		if err := os.MkdirAll(dir, utils.SecureDirMode); err != nil {
			return fmt.Errorf("failed to create directory %s: %w", dir, err)
		}

		// Enforce secure permissions on existing directories
		if err := utils.EnsureSecureDirPermissions(dir); err != nil {
			return fmt.Errorf("failed to set secure permissions on %s: %w", dir, err)
		}
	}

	return nil
}

// VerifySecurityPermissions checks that all sensitive files have secure permissions
func (c *Config) VerifySecurityPermissions() error {
	// Check database file if it exists
	if _, err := os.Stat(c.DBPath); err == nil {
		if secure, err := utils.CheckFilePermissions(c.DBPath); err != nil {
			return fmt.Errorf("failed to check database permissions: %w", err)
		} else if !secure {
			return fmt.Errorf("database file has insecure permissions: %s", c.DBPath)
		}
	}

	// Check auth directory
	if err := utils.CheckParentDirPermissions(c.AuthDir); err != nil {
		return fmt.Errorf("auth directory has insecure permissions: %w", err)
	}

	return nil
}

// EnforceSecurityPermissions fixes permissions on all sensitive files
func (c *Config) EnforceSecurityPermissions() error {
	// Enforce directory permissions
	if err := c.EnsureDirectories(); err != nil {
		return err
	}

	// Enforce database file permissions if it exists
	if _, err := os.Stat(c.DBPath); err == nil {
		if err := utils.EnsureSecureFilePermissions(c.DBPath); err != nil {
			return fmt.Errorf("failed to secure database: %w", err)
		}
	}

	return nil
}

// GetProjectContext returns the current project context
type ProjectContext struct {
	ProjectID   string
	ProjectName string
	Environment string
}

// CurrentProject returns the current project context from working directory
func CurrentProject() (*ProjectContext, error) {
	// Try to read from .envvault file in current directory
	cwd, err := os.Getwd()
	if err != nil {
		return nil, fmt.Errorf("failed to get current directory: %w", err)
	}

	// Look for .envvault file
	envvaultFile := filepath.Join(cwd, ".envvault")
	if _, err := os.Stat(envvaultFile); os.IsNotExist(err) {
		return nil, fmt.Errorf("no envvault project found in current directory (run 'envvault init' first)")
	}

	// Read project context from file
	// TODO: Implement file parsing
	return &ProjectContext{
		ProjectID:   "",
		ProjectName: "",
		Environment: "development",
	}, nil
}
