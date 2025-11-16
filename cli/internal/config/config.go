package config

import (
	"fmt"
	"os"
	"path/filepath"
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

// EnsureDirectories creates all necessary directories
func (c *Config) EnsureDirectories() error {
	dirs := []string{
		c.ConfigDir,
		c.DataDir,
		c.AuthDir,
		c.KeysDir,
		c.CacheDir,
	}

	for _, dir := range dirs {
		if err := os.MkdirAll(dir, 0700); err != nil {
			return fmt.Errorf("failed to create directory %s: %w", dir, err)
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
