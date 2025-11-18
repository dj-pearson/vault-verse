package cmd

import (
	"encoding/base64"
	"encoding/json"
	"fmt"
	"os"

	"github.com/dj-pearson/envault/internal/config"
	"github.com/dj-pearson/envault/internal/crypto"
	"github.com/dj-pearson/envault/internal/storage"
	"github.com/dj-pearson/envault/internal/utils"
	"github.com/fatih/color"
	"github.com/spf13/cobra"
)

var (
	restoreInput string
	restoreMerge bool
)

var restoreCmd = &cobra.Command{
	Use:   "restore",
	Short: "Restore from encrypted backup",
	Long: `Restore environment variables from an encrypted backup file.

By default, this will replace all existing secrets. Use --merge to
merge with existing secrets instead.

Examples:
  envault restore --input backup.enc      # Restore from backup
  envault restore --input backup.enc --merge  # Merge with existing`,
	RunE: runRestore,
}

func init() {
	rootCmd.AddCommand(restoreCmd)

	restoreCmd.Flags().StringVarP(&restoreInput, "input", "i", "", "backup file path (required)")
	restoreCmd.MarkFlagRequired("input")
	restoreCmd.Flags().BoolVar(&restoreMerge, "merge", false, "merge with existing secrets instead of replacing")
}

func runRestore(cmd *cobra.Command, args []string) error {
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
		cyan.Printf("Restoring backup for project: %s\n\n", ctx.ProjectName)
	}

	// Read backup file
	encodedBackup, err := os.ReadFile(restoreInput)
	if err != nil {
		return fmt.Errorf("failed to read backup file: %w", err)
	}

	// Decode base64
	encryptedBackup, err := base64.StdEncoding.DecodeString(string(encodedBackup))
	if err != nil {
		return fmt.Errorf("failed to decode backup file: %w", err)
	}

	// Decrypt backup
	decryptedJSON, err := cryptoSvc.Decrypt(encryptedBackup)
	if err != nil {
		return fmt.Errorf("failed to decrypt backup (wrong key?): %w", err)
	}

	// Parse backup data
	var backupData struct {
		Version      string                       `json:"version"`
		CreatedAt    string                       `json:"created_at"`
		ProjectID    string                       `json:"project_id"`
		ProjectName  string                       `json:"project_name"`
		Environments map[string]map[string]string `json:"environments"`
	}

	if err := json.Unmarshal([]byte(decryptedJSON), &backupData); err != nil {
		return fmt.Errorf("failed to parse backup data: %w", err)
	}

	// Verify backup is for this project (unless merge mode)
	if !restoreMerge && backupData.ProjectID != ctx.ProjectID {
		yellow.Printf("⚠ Warning: Backup is from project '%s' but current project is '%s'\n",
			backupData.ProjectName, ctx.ProjectName)

		if !utils.ConfirmDangerousAction("Restore backup from different project") {
			fmt.Println("Restore cancelled")
			return nil
		}
	}

	// Confirm restoration
	if !quiet && !restoreMerge {
		yellow.Println("⚠ This will REPLACE all existing secrets in this project")

		if !utils.ConfirmDangerousAction("Restore backup and replace all secrets") {
			fmt.Println("Restore cancelled")
			return nil
		}
	}

	if !quiet {
		fmt.Printf("Backup created: %s\n", backupData.CreatedAt)
		fmt.Printf("Environments in backup: %d\n\n", len(backupData.Environments))
	}

	// Restore each environment
	totalRestored := 0
	envsCreated := 0

	for envName, secrets := range backupData.Environments {
		// Get or create environment
		env, err := db.GetEnvironment(ctx.ProjectID, envName)
		if err != nil {
			// Environment doesn't exist, create it
			env, err = db.CreateEnvironment(ctx.ProjectID, envName)
			if err != nil {
				return fmt.Errorf("failed to create environment %s: %w", envName, err)
			}
			envsCreated++
			if !quiet {
				cyan.Printf("  Created environment: %s\n", envName)
			}
		}

		// Clear existing secrets if not merging
		if !restoreMerge {
			existingSecrets, err := db.ListSecrets(env.ID)
			if err != nil {
				return fmt.Errorf("failed to list existing secrets: %w", err)
			}
			for _, secret := range existingSecrets {
				if err := db.DeleteSecret(secret.ID); err != nil {
					return fmt.Errorf("failed to clear secret %s: %w", secret.Key, err)
				}
			}
		}

		// Restore secrets
		for key, value := range secrets {
			// Encrypt the value
			encryptedValue, err := cryptoSvc.Encrypt(value)
			if err != nil {
				return fmt.Errorf("failed to encrypt %s: %w", key, err)
			}

			// Create/update secret
			_, err = db.CreateSecret(env.ID, key, encryptedValue, "")
			if err != nil {
				return fmt.Errorf("failed to restore %s: %w", key, err)
			}

			totalRestored++
		}

		if !quiet {
			cyan.Printf("  ✓ %s: %d secrets\n", envName, len(secrets))
		}
	}

	if !quiet {
		fmt.Println()
		green.Printf("✓ Backup restored successfully\n\n")
		if envsCreated > 0 {
			fmt.Printf("Environments created: %d\n", envsCreated)
		}
		fmt.Printf("Total secrets restored: %d\n", totalRestored)
	}

	return nil
}
