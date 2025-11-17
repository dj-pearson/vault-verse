package utils

import (
	"fmt"
	"os"
	"path/filepath"
	"regexp"
	"strings"

	"github.com/fatih/color"
)

// Secure file permission constants
const (
	// SecureFileMode is the recommended permission for sensitive files (owner read/write only)
	SecureFileMode os.FileMode = 0600

	// SecureDirMode is the recommended permission for sensitive directories
	SecureDirMode os.FileMode = 0700
)

// SensitiveKeyPatterns are patterns that indicate a key contains sensitive data
var SensitiveKeyPatterns = []string{
	"PASSWORD", "PASSWD", "PWD",
	"SECRET", "PRIVATE",
	"TOKEN", "AUTH",
	"API_KEY", "APIKEY",
	"CREDENTIAL", "CRED",
	"ENCRYPTION_KEY", "DECRYPT",
	"CERTIFICATE", "CERT",
	"SSH_KEY", "RSA_KEY",
	"DATABASE_URL", "DB_URL", "CONNECTION_STRING",
	"SLACK_", "GITHUB_", "AWS_", "AZURE_",
}

// EnsureSecureFilePermissions sets secure permissions on a file
func EnsureSecureFilePermissions(path string) error {
	info, err := os.Stat(path)
	if err != nil {
		return fmt.Errorf("failed to stat file: %w", err)
	}

	// Check if file permissions are too permissive
	currentPerms := info.Mode().Perm()
	if currentPerms != SecureFileMode {
		if err := os.Chmod(path, SecureFileMode); err != nil {
			return fmt.Errorf("failed to set secure permissions: %w", err)
		}
	}

	return nil
}

// EnsureSecureDirPermissions sets secure permissions on a directory
func EnsureSecureDirPermissions(path string) error {
	info, err := os.Stat(path)
	if err != nil {
		return fmt.Errorf("failed to stat directory: %w", err)
	}

	if !info.IsDir() {
		return fmt.Errorf("path is not a directory: %s", path)
	}

	// Check if directory permissions are too permissive
	currentPerms := info.Mode().Perm()
	if currentPerms != SecureDirMode {
		if err := os.Chmod(path, SecureDirMode); err != nil {
			return fmt.Errorf("failed to set secure permissions: %w", err)
		}
	}

	return nil
}

// CheckFilePermissions checks if a file has secure permissions and warns if not
func CheckFilePermissions(path string) (bool, error) {
	info, err := os.Stat(path)
	if err != nil {
		return false, fmt.Errorf("failed to stat file: %w", err)
	}

	currentPerms := info.Mode().Perm()

	// Check if file is readable by group or others
	if currentPerms&0077 != 0 {
		return false, nil
	}

	return true, nil
}

// CreateSecureFile creates a new file with secure permissions
func CreateSecureFile(path string) (*os.File, error) {
	// Ensure parent directory exists with secure permissions
	dir := filepath.Dir(path)
	if err := os.MkdirAll(dir, SecureDirMode); err != nil {
		return nil, fmt.Errorf("failed to create directory: %w", err)
	}

	// Create file with secure permissions
	file, err := os.OpenFile(path, os.O_CREATE|os.O_WRONLY|os.O_TRUNC, SecureFileMode)
	if err != nil {
		return nil, fmt.Errorf("failed to create file: %w", err)
	}

	return file, nil
}

// RedactSensitiveValue redacts sensitive information for display/logging
func RedactSensitiveValue(value string) string {
	if len(value) == 0 {
		return ""
	}

	// For very short values, completely redact
	if len(value) <= 4 {
		return "[REDACTED]"
	}

	// For longer values, show first 2 and last 2 characters
	if len(value) <= 8 {
		return value[:2] + "***"
	}

	// For long values, show first and last 2 characters with asterisks in between
	return value[:2] + strings.Repeat("*", len(value)-4) + value[len(value)-2:]
}

// IsShellHistorySafe checks if a command is safe to appear in shell history
// Returns false if the command contains sensitive data
func IsShellHistorySafe(command string) bool {
	// Check for inline secrets (--token, --password, etc.)
	sensitiveFlags := []string{
		"--token", "--password", "--secret", "--key",
		"--apikey", "--api-key", "--credential",
		"-t ", "-p ", "-k ",
	}

	lowerCommand := strings.ToLower(command)
	for _, flag := range sensitiveFlags {
		if strings.Contains(lowerCommand, flag) {
			return false
		}
	}

	return true
}

// GetShellHistoryWarning returns a warning message about shell history
func GetShellHistoryWarning() string {
	return `⚠️  WARNING: This value may appear in your shell history!

For better security, consider using one of these methods instead:
  1. Use stdin: echo "value" | envault set KEY
  2. Use a file: envault import .env
  3. Use interactive mode: envault set KEY (then enter value when prompted)

To prevent this warning, add to your shell configuration:
  # Bash/Zsh
  export HISTIGNORE="*envault set*:*envault login*"

  # Fish
  set -U fish_history_ignore "envault set*" "envault login*"`
}

// SanitizeForLog sanitizes a string for safe logging
func SanitizeForLog(s string) string {
	// Redact anything that looks like a secret
	patterns := []struct {
		regex       *regexp.Regexp
		replacement string
	}{
		{regexp.MustCompile(`(?i)(password|passwd|pwd|token|secret|key|apikey|api[_-]key)[=:]\s*[^\s]+`), "$1=[REDACTED]"},
		{regexp.MustCompile(`(?i)(bearer|authorization)[:\s]+[^\s]+`), "$1: [REDACTED]"},
		{regexp.MustCompile(`[a-zA-Z0-9]{32,}`), "[REDACTED_HASH]"}, // Long hex strings
	}

	result := s
	for _, p := range patterns {
		result = p.regex.ReplaceAllString(result, p.replacement)
	}

	return result
}

// CheckParentDirPermissions verifies that parent directories are secure
func CheckParentDirPermissions(path string) error {
	dir := filepath.Dir(path)
	info, err := os.Stat(dir)
	if err != nil {
		return fmt.Errorf("failed to stat parent directory: %w", err)
	}

	// Check if parent directory is world-writable (security risk)
	if info.Mode().Perm()&0002 != 0 {
		return fmt.Errorf("parent directory is world-writable (insecure): %s", dir)
	}

	return nil
}

// SecureDelete attempts to securely delete a file by overwriting before removal
func SecureDelete(path string) error {
	// Open file
	file, err := os.OpenFile(path, os.O_WRONLY, 0)
	if err != nil {
		return fmt.Errorf("failed to open file for secure delete: %w", err)
	}
	defer file.Close()

	// Get file size
	info, err := file.Stat()
	if err != nil {
		return fmt.Errorf("failed to stat file: %w", err)
	}
	size := info.Size()

	// Overwrite with zeros
	zeros := make([]byte, 4096)
	for written := int64(0); written < size; {
		toWrite := min(int64(len(zeros)), size-written)
		_, err := file.Write(zeros[:toWrite])
		if err != nil {
			return fmt.Errorf("failed to overwrite file: %w", err)
		}
		written += toWrite
	}

	// Sync to disk
	if err := file.Sync(); err != nil {
		return fmt.Errorf("failed to sync file: %w", err)
	}

	file.Close()

	// Finally, delete the file
	if err := os.Remove(path); err != nil {
		return fmt.Errorf("failed to remove file: %w", err)
	}

	return nil
}

func min(a, b int64) int64 {
	if a < b {
		return a
	}
	return b
}

// Success prints a success message in green
func Success(message string) {
	green := color.New(color.FgGreen)
	green.Printf("✓ %s\n", message)
}

// ErrorMsg prints an error message in red
func ErrorMsg(message string) {
	red := color.New(color.FgRed)
	red.Printf("✗ %s\n", message)
}
