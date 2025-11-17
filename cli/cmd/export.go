package cmd

import (
	"encoding/json"
	"fmt"
	"os"
	"strings"

	"github.com/dj-pearson/envault/internal/config"
	"github.com/dj-pearson/envault/internal/crypto"
	"github.com/dj-pearson/envault/internal/storage"
	"github.com/dj-pearson/envault/internal/utils"
	"github.com/fatih/color"
	"github.com/spf13/cobra"
)

var (
	exportEnv    string
	exportOutput string
	exportFormat string
)

var exportCmd = &cobra.Command{
	Use:   "export",
	Short: "Export environment variables to a file",
	Long: `Export environment variables to .env, JSON, or YAML format.

By default, exports to stdout. Use --output to write to a file.

WARNING: Exported files contain secrets in plaintext!
Add exported files to .gitignore to prevent accidental commits.

Examples:
  envault export
  envault export --output .env
  envault export --env production --output .env.production
  envault export --format json > config.json
  envault export --format yaml --output config.yml`,
	RunE: runExport,
}

func init() {
	rootCmd.AddCommand(exportCmd)

	exportCmd.Flags().StringVarP(&exportEnv, "env", "e", "development", "Environment to export")
	exportCmd.Flags().StringVarP(&exportOutput, "output", "o", "", "Output file (default: stdout)")
	exportCmd.Flags().StringVarP(&exportFormat, "format", "f", "dotenv", "Format: dotenv, json, yaml")
}

func runExport(cmd *cobra.Command, args []string) error {
	red := color.New(color.FgRed)
	green := color.New(color.FgGreen)
	yellow := color.New(color.FgYellow)

	// Load project context
	ctx, err := utils.LoadProjectContext()
	if err != nil {
		return fmt.Errorf("Error: %v", err)
	}

	// Initialize services
	cfg, err := config.New()
	if err != nil {
		return fmt.Errorf("failed to create config: %w", err)
	}

	db, err := storage.New(cfg.DBPath)
	if err != nil {
		return fmt.Errorf("failed to initialize database: %w", err)
	}
	defer db.Close()

	cryptoSvc, err := crypto.New()
	if err != nil {
		return fmt.Errorf("failed to initialize crypto: %w", err)
	}

	// Get environment
	environment, err := db.GetEnvironment(ctx.ProjectID, exportEnv)
	if err != nil {
		return fmt.Errorf("environment '%s' not found: %w", exportEnv, err)
	}

	// Load and decrypt secrets
	secrets, err := db.ListSecrets(environment.ID)
	if err != nil {
		return fmt.Errorf("failed to load secrets: %w", err)
	}

	if len(secrets) == 0 {
		return fmt.Errorf("no variables found in %s environment", exportEnv)
	}

	// Decrypt all secrets
	decrypted := make(map[string]string)
	for _, secret := range secrets {
		value, err := cryptoSvc.Decrypt(secret.EncryptedValue)
		if err != nil {
			return fmt.Errorf("failed to decrypt %s: %w", secret.Key, err)
		}
		decrypted[secret.Key] = value
	}

	// SECURITY SAFEGUARD: Warn about plaintext export
	if exportOutput != "" && !quiet {
		yellow.Printf("⚠ WARNING: Exporting %d secrets to plaintext file: %s\n", len(decrypted), exportOutput)
		yellow.Println("⚠ Make sure this file is in .gitignore!")
		fmt.Println()
	}

	// Generate output based on format
	var output string
	switch exportFormat {
	case "json":
		data, err := json.MarshalIndent(decrypted, "", "  ")
		if err != nil {
			return fmt.Errorf("failed to encode JSON: %w", err)
		}
		output = string(data)

	case "yaml", "yml":
		// Simple YAML output (no external dependency)
		for key, value := range decrypted {
			output += fmt.Sprintf("%s: %s\n", key, value)
		}

	default: // dotenv format
		for key, value := range decrypted {
			// Quote values that contain spaces or special chars
			if needsQuoting(value) {
				output += fmt.Sprintf("%s=\"%s\"\n", key, escapeValue(value))
			} else {
				output += fmt.Sprintf("%s=%s\n", key, value)
			}
		}
	}

	// Write to file or stdout
	if exportOutput != "" {
		if err := os.WriteFile(exportOutput, []byte(output), 0600); err != nil {
			return fmt.Errorf("failed to write file: %w", err)
		}

		if !quiet {
			green.Printf("✓ Exported %d variables to %s\n", len(decrypted), exportOutput)
		}

		// Try to add to .gitignore
		if err := utils.AddToGitignore(exportOutput); err != nil {
			yellow.Printf("⚠ Could not add %s to .gitignore\n", exportOutput)
		}
	} else {
		// Output to stdout
		fmt.Print(output)
	}

	return nil
}

func needsQuoting(value string) bool {
	// Quote if contains spaces, quotes, or special chars
	specialChars := []string{" ", "\"", "'", "#", "$", "&", "|", ";", "<", ">", "(", ")", "{", "}"}
	for _, char := range specialChars {
		if contains(value, char) {
			return true
		}
	}
	return false
}

func contains(s, substr string) bool {
	return len(s) > 0 && len(substr) > 0 && (s == substr || (len(s) >= len(substr) && containsHelper(s, substr)))
}

func containsHelper(s, substr string) bool {
	for i := 0; i <= len(s)-len(substr); i++ {
		if s[i:i+len(substr)] == substr {
			return true
		}
	}
	return false
}

func escapeValue(value string) string {
	// Escape quotes and backslashes
	value = strings.ReplaceAll(value, "\\", "\\\\")
	value = strings.ReplaceAll(value, "\"", "\\\"")
	return value
}
