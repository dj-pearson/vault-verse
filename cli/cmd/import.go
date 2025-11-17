package cmd

import (
	"fmt"

	"github.com/dj-pearson/envault/internal/config"
	"github.com/dj-pearson/envault/internal/crypto"
	"github.com/dj-pearson/envault/internal/storage"
	"github.com/dj-pearson/envault/internal/utils"
	"github.com/fatih/color"
	"github.com/joho/godotenv"
	"github.com/manifoldco/promptui"
	"github.com/spf13/cobra"
	"strings"
)

var (
	importEnv       string
	importOverwrite bool
	importDryRun    bool
)

var importCmd = &cobra.Command{
	Use:   "import FILE",
	Short: "Import environment variables from a .env file",
	Long: `Import environment variables from a .env file into encrypted storage.

By default, existing variables are not overwritten. Use --overwrite to replace them.
Use --dry-run to preview what would be imported without making changes.

Examples:
  envault import .env
  envault import .env.production --env production
  envault import .env --overwrite
  envault import .env --dry-run`,
	Args: cobra.ExactArgs(1),
	RunE: runImport,
}

func init() {
	rootCmd.AddCommand(importCmd)

	importCmd.Flags().StringVarP(&importEnv, "env", "e", "development", "Target environment")
	importCmd.Flags().BoolVar(&importOverwrite, "overwrite", false, "Overwrite existing variables")
	importCmd.Flags().BoolVar(&importDryRun, "dry-run", false, "Preview without importing")
}

func runImport(cmd *cobra.Command, args []string) error {
	red := color.New(color.FgRed)
	green := color.New(color.FgGreen)
	yellow := color.New(color.FgYellow)
	cyan := color.New(color.FgCyan)

	filePath := args[0]

	// Load project context
	ctx, err := utils.LoadProjectContext()
	if err != nil {
		return fmt.Errorf("Error: %v", err)
	}

	// Read .env file
	envMap, err := godotenv.Read(filePath)
	if err != nil {
		return fmt.Errorf("failed to read file %s: %w", filePath, err)
	}

	if len(envMap) == 0 {
		return fmt.Errorf("no variables found in %s", filePath)
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
	environment, err := db.GetEnvironment(ctx.ProjectID, importEnv)
	if err != nil {
		return fmt.Errorf("environment '%s' not found: %w", importEnv, err)
	}

	// Get existing secrets
	existingSecrets, err := db.ListSecrets(environment.ID)
	if err != nil {
		return fmt.Errorf("failed to list existing secrets: %w", err)
	}

	existingKeys := make(map[string]bool)
	for _, secret := range existingSecrets {
		existingKeys[secret.Key] = true
	}

	// Preview mode
	if importDryRun {
		cyan.Printf("Would import %d variables to %s environment:\n\n", len(envMap), importEnv)

		newCount := 0
		existsCount := 0

		for key := range envMap {
			if existingKeys[key] {
				if importOverwrite {
					yellow.Printf("  %s (exists, would overwrite)\n", key)
				} else {
					yellow.Printf("  %s (exists, would skip)\n", key)
				}
				existsCount++
			} else {
				green.Printf("  %s (new)\n", key)
				newCount++
			}
		}

		fmt.Println()
		cyan.Printf("Summary: %d new, %d existing\n", newCount, existsCount)
		return nil
	}

	// Confirm if overwriting
	if importOverwrite && len(existingKeys) > 0 && !quiet {
		overwriteCount := 0
		for key := range envMap {
			if existingKeys[key] {
				overwriteCount++
			}
		}

		if overwriteCount > 0 {
			prompt := promptui.Prompt{
				Label:     fmt.Sprintf("Overwrite %d existing variables", overwriteCount),
				IsConfirm: true,
			}

			result, err := prompt.Run()
			if err != nil || strings.ToLower(result) != "y" {
				yellow.Println("Cancelled")
				return nil
			}
		}
	}

	// Import variables
	imported := 0
	skipped := 0
	failed := 0

	for key, value := range envMap {
		// Validate key
		if err := utils.ValidateEnvKey(key); err != nil {
			yellow.Printf("⚠ Skipping invalid key: %s (%v)\n", key, err)
			failed++
			continue
		}

		// Check if exists and skip if not overwriting
		if existingKeys[key] && !importOverwrite {
			if debug {
				yellow.Printf("  Skipping %s (already exists)\n", key)
			}
			skipped++
			continue
		}

		// Encrypt value
		encrypted, err := cryptoSvc.Encrypt(value)
		if err != nil {
			yellow.Printf("⚠ Failed to encrypt %s: %v\n", key, err)
			failed++
			continue
		}

		// Store secret
		if _, err := db.CreateSecret(environment.ID, key, encrypted, ""); err != nil {
			yellow.Printf("⚠ Failed to store %s: %v\n", key, err)
			failed++
			continue
		}

		imported++
	}

	// Summary
	if !quiet {
		fmt.Println()
		green.Printf("✓ Imported %d variables to %s environment\n", imported, importEnv)
		if skipped > 0 {
			yellow.Printf("  Skipped %d existing variables (use --overwrite to replace)\n", skipped)
		}
		if failed > 0 {
			red.Printf("  Failed to import %d variables\n", failed)
		}
	}

	return nil
}
