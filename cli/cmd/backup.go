package cmd

import (
	"encoding/base64"
	"encoding/json"
	"fmt"
	"os"
	"path/filepath"
	"time"

	"github.com/dj-pearson/envault/internal/config"
	"github.com/dj-pearson/envault/internal/crypto"
	"github.com/dj-pearson/envault/internal/storage"
	"github.com/dj-pearson/envault/internal/utils"
	"github.com/fatih/color"
	"github.com/spf13/cobra"
)

var (
	backupOutput string
	backupAll    bool
)

var backupCmd = &cobra.Command{
	Use:   "backup",
	Short: "Create encrypted backup of project secrets",
	Long: `Create an encrypted backup of your project's environment variables.

The backup is encrypted using your master key and can be restored using
the 'envault restore' command. Backups include:
  • All environments
  • All secrets (encrypted)
  • Project metadata

Examples:
  envault backup                          # Interactive backup
  envault backup --output backup.enc      # Specify output file
  envault backup --all                    # Backup all projects`,
	RunE: runBackup,
}

func init() {
	rootCmd.AddCommand(backupCmd)

	backupCmd.Flags().StringVarP(&backupOutput, "output", "o", "", "output file path")
	backupCmd.Flags().BoolVar(&backupAll, "all", false, "backup all projects")
}

func runBackup(cmd *cobra.Command, args []string) error {
	green := color.New(color.FgGreen)
	cyan := color.New(color.FgCyan)
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

	if !quiet {
		cyan.Printf("Creating backup for project: %s\n\n", ctx.ProjectName)
	}

	// Get all environments
	environments, err := db.ListEnvironments(ctx.ProjectID)
	if err != nil {
		return fmt.Errorf("failed to list environments: %w", err)
	}

	if len(environments) == 0 {
		yellow.Println("No environments found to backup")
		return nil
	}

	// Build backup data structure
	backupData := map[string]interface{}{
		"version":      "1.0",
		"created_at":   time.Now().UTC().Format(time.RFC3339),
		"project_id":   ctx.ProjectID,
		"project_name": ctx.ProjectName,
		"environments": make(map[string]map[string]string),
	}

	envData := backupData["environments"].(map[string]map[string]string)
	totalSecrets := 0

	for _, env := range environments {
		secrets, err := db.ListSecrets(env.ID)
		if err != nil {
			return fmt.Errorf("failed to list secrets for %s: %w", env.Name, err)
		}

		envSecrets := make(map[string]string)
		for _, secret := range secrets {
			// Decrypt secret
			value, err := cryptoSvc.Decrypt(secret.EncryptedValue)
			if err != nil {
				return fmt.Errorf("failed to decrypt %s: %w", secret.Key, err)
			}
			envSecrets[secret.Key] = value
			totalSecrets++
		}

		envData[env.Name] = envSecrets

		if !quiet {
			cyan.Printf("  ✓ %s: %d secrets\n", env.Name, len(secrets))
		}
	}

	// Convert to JSON
	jsonBytes, err := json.MarshalIndent(backupData, "", "  ")
	if err != nil {
		return fmt.Errorf("failed to serialize backup: %w", err)
	}

	// Encrypt the backup
	encryptedBackup, err := cryptoSvc.Encrypt(string(jsonBytes))
	if err != nil {
		return fmt.Errorf("failed to encrypt backup: %w", err)
	}

	// Encode as base64 for storage
	encodedBackup := base64.StdEncoding.EncodeToString(encryptedBackup)

	// Determine output file
	outputFile := backupOutput
	if outputFile == "" {
		timestamp := time.Now().Format("20060102-150405")
		outputFile = fmt.Sprintf("envault-backup-%s-%s.enc", ctx.ProjectName, timestamp)
	}

	// Make sure output directory exists
	outputDir := filepath.Dir(outputFile)
	if outputDir != "." && outputDir != "" {
		if err := os.MkdirAll(outputDir, 0755); err != nil {
			return fmt.Errorf("failed to create output directory: %w", err)
		}
	}

	// Write to file
	if err := os.WriteFile(outputFile, []byte(encodedBackup), 0600); err != nil {
		return fmt.Errorf("failed to write backup file: %w", err)
	}

	if !quiet {
		fmt.Println()
		green.Printf("✓ Backup created successfully\n\n")
		fmt.Printf("File: %s\n", outputFile)
		fmt.Printf("Environments: %d\n", len(environments))
		fmt.Printf("Total secrets: %d\n", totalSecrets)
		fmt.Println()
		yellow.Println("⚠ Store this backup securely! It contains encrypted secrets.")
		yellow.Println("⚠ You'll need your master key to restore this backup.")
	}

	return nil
}
