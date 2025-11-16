package utils

import (
	"bufio"
	"fmt"
	"os"
	"path/filepath"
	"regexp"
	"strings"
)

// ProjectContext holds the current project information
type ProjectContext struct {
	ProjectID   string
	ProjectName string
}

// LoadProjectContext loads project context from .envvault file
func LoadProjectContext() (*ProjectContext, error) {
	cwd, err := os.Getwd()
	if err != nil {
		return nil, fmt.Errorf("failed to get current directory: %w", err)
	}

	envvaultFile := filepath.Join(cwd, ".envvault")
	if _, err := os.Stat(envvaultFile); os.IsNotExist(err) {
		return nil, fmt.Errorf("no envvault project found (run 'envvault init' first)")
	}

	// Parse .envvault file
	ctx := &ProjectContext{}
	file, err := os.Open(envvaultFile)
	if err != nil {
		return nil, fmt.Errorf("failed to open .envvault: %w", err)
	}
	defer file.Close()

	scanner := bufio.NewScanner(file)
	for scanner.Scan() {
		line := strings.TrimSpace(scanner.Text())
		if line == "" || strings.HasPrefix(line, "#") {
			continue
		}

		parts := strings.SplitN(line, "=", 2)
		if len(parts) != 2 {
			continue
		}

		key := strings.TrimSpace(parts[0])
		value := strings.TrimSpace(parts[1])

		switch key {
		case "project_id":
			ctx.ProjectID = value
		case "project_name":
			ctx.ProjectName = value
		}
	}

	if ctx.ProjectID == "" {
		return nil, fmt.Errorf("invalid .envvault file: missing project_id")
	}

	return ctx, nil
}

// ValidateEnvKey validates an environment variable key
func ValidateEnvKey(key string) error {
	if key == "" {
		return fmt.Errorf("key cannot be empty")
	}

	// Must start with letter or underscore
	if !regexp.MustCompile(`^[a-zA-Z_]`).MatchString(key) {
		return fmt.Errorf("key must start with a letter or underscore")
	}

	// Can only contain letters, numbers, and underscores
	if !regexp.MustCompile(`^[a-zA-Z0-9_]+$`).MatchString(key) {
		return fmt.Errorf("key can only contain letters, numbers, and underscores")
	}

	return nil
}

// IsSensitiveKey checks if a key looks like it contains sensitive data
func IsSensitiveKey(key string) bool {
	sensitivePatterns := []string{
		"PASSWORD", "SECRET", "KEY", "TOKEN", "API",
		"PRIVATE", "CREDENTIAL", "AUTH", "PASS",
	}

	upperKey := strings.ToUpper(key)
	for _, pattern := range sensitivePatterns {
		if strings.Contains(upperKey, pattern) {
			return true
		}
	}

	return false
}

// LooksLikeFilePath checks if a string looks like a file path
func LooksLikeFilePath(value string) bool {
	// Check for common file path patterns
	if strings.HasPrefix(value, "/") || strings.HasPrefix(value, "./") || strings.HasPrefix(value, "../") {
		return true
	}
	if strings.HasPrefix(value, "~") {
		return true
	}
	if strings.Contains(value, "\\") { // Windows paths
		return true
	}
	// Check for common file extensions
	extensions := []string{".env", ".json", ".yaml", ".yml", ".txt", ".pem", ".key"}
	for _, ext := range extensions {
		if strings.HasSuffix(value, ext) {
			return true
		}
	}
	return false
}

// MaskSecret masks a secret value for display
func MaskSecret(value string) string {
	if len(value) <= 4 {
		return "***"
	}
	// Show first 4 chars and mask the rest
	return value[:4] + strings.Repeat("*", len(value)-4)
}

// FormatEnvVar formats an environment variable for export
func FormatEnvVar(key, value string, format string) string {
	switch format {
	case "export":
		return fmt.Sprintf("export %s=\"%s\"", key, value)
	case "json":
		return fmt.Sprintf(`"%s": "%s"`, key, escapeJSON(value))
	case "yaml":
		return fmt.Sprintf("%s: %s", key, value)
	default:
		return fmt.Sprintf("%s=%s", key, value)
	}
}

func escapeJSON(s string) string {
	s = strings.ReplaceAll(s, "\\", "\\\\")
	s = strings.ReplaceAll(s, "\"", "\\\"")
	s = strings.ReplaceAll(s, "\n", "\\n")
	s = strings.ReplaceAll(s, "\r", "\\r")
	s = strings.ReplaceAll(s, "\t", "\\t")
	return s
}

// ConfirmDangerousAction prompts user to confirm a dangerous action
func ConfirmDangerousAction(message string) bool {
	fmt.Printf("⚠ Warning: %s\n", message)
	fmt.Print("Type 'yes' to confirm: ")

	var response string
	fmt.Scanln(&response)

	return strings.ToLower(strings.TrimSpace(response)) == "yes"
}

// AddToGitignore adds an entry to .gitignore
func AddToGitignore(entry string) error {
	gitignorePath := ".gitignore"

	// Read existing .gitignore if it exists
	content, err := os.ReadFile(gitignorePath)
	if err != nil && !os.IsNotExist(err) {
		return err
	}

	// Check if entry already exists
	lines := strings.Split(string(content), "\n")
	for _, line := range lines {
		if strings.TrimSpace(line) == entry {
			return nil // Already exists
		}
	}

	// Append entry
	f, err := os.OpenFile(gitignorePath, os.O_APPEND|os.O_CREATE|os.O_WRONLY, 0644)
	if err != nil {
		return err
	}
	defer f.Close()

	if len(content) > 0 && !strings.HasSuffix(string(content), "\n") {
		f.WriteString("\n")
	}
	f.WriteString(fmt.Sprintf("\n# EnvVault exports\n%s\n", entry))

	return nil
}
