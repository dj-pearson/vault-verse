package cmd

import (
	"fmt"
	"os"
	"strings"

	"github.com/dj-pearson/envault/internal/config"
	"github.com/dj-pearson/envault/internal/crypto"
	"github.com/dj-pearson/envault/internal/storage"
	"github.com/dj-pearson/envault/internal/utils"
	"github.com/fatih/color"
	"github.com/joho/godotenv"
	"github.com/manifoldco/promptui"
	"github.com/spf13/cobra"
)

var (
	setEnv         string
	setFile        string
	setDescription string
)

var setCmd = &cobra.Command{
	Use:   "set KEY=value or KEY (for hidden input)",
	Short: "Set an environment variable",
	Long: `Set an environment variable with encrypted storage.

If only the key is provided, you'll be prompted to enter the value securely (hidden input).
Values are encrypted using AES-256-GCM before being stored locally.

Examples:
  envault set DATABASE_URL=postgres://localhost/mydb
  envault set API_KEY=sk_live_... --env production
  envault set API_KEY  # Hidden input prompt
  envault set --file .env.production --env production`,
	RunE: runSet,
}

func init() {
	rootCmd.AddCommand(setCmd)

	setCmd.Flags().StringVarP(&setEnv, "env", "e", "development", "Environment")
	setCmd.Flags().StringVarP(&setFile, "file", "f", "", "Import from .env file")
	setCmd.Flags().StringVarP(&setDescription, "description", "d", "", "Description")
}

func runSet(cmd *cobra.Command, args []string) error {
	green := color.New(color.FgGreen)
	yellow := color.New(color.FgYellow)

	// Load project context
	ctx, err := utils.LoadProjectContext()
	if err != nil {
		return fmt.Errorf("Error: %v\nRun 'envault init' first", err)
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
	env, err := db.GetEnvironment(ctx.ProjectID, setEnv)
	if err != nil {
		return fmt.Errorf("environment '%s' not found: %w", setEnv, err)
	}

	// Handle file import
	if setFile != "" {
		return importFromFile(db, cryptoSvc, env.ID, setFile, green, yellow)
	}

	// Handle single key-value pair
	if len(args) == 0 {
		return fmt.Errorf("usage: envault set KEY=value or envault set KEY")
	}

	arg := args[0]
	var key, value string

	// Check if KEY=value format
	if strings.Contains(arg, "=") {
		parts := strings.SplitN(arg, "=", 2)
		key = strings.TrimSpace(parts[0])
		value = strings.TrimSpace(parts[1])
	} else {
		// Just KEY provided, prompt for value
		key = strings.TrimSpace(arg)

		prompt := promptui.Prompt{
			Label: fmt.Sprintf("Value for %s", key),
			Mask:  '*',
		}
		result, err := prompt.Run()
		if err != nil {
			return fmt.Errorf("prompt cancelled")
		}
		value = result
	}

	// Validate key
	if err := utils.ValidateEnvKey(key); err != nil {
		return fmt.Errorf("invalid key: %w", err)
	}

	// SECURITY SAFEGUARD: Warn if setting sensitive keys in development
	if setEnv == "development" && utils.IsSensitiveKey(key) {
		yellow.Printf("⚠ Warning: Setting sensitive key '%s' in development environment\n", key)
		prompt := promptui.Prompt{
			Label:     "Continue",
			IsConfirm: true,
		}
		if result, _ := prompt.Run(); strings.ToLower(result) != "y" {
			return fmt.Errorf("cancelled")
		}
	}

	// SECURITY SAFEGUARD: Prevent storing keys that look like they might be in plaintext files
	if utils.LooksLikeFilePath(value) {
		yellow.Printf("⚠ Warning: Value looks like a file path. Did you mean to use --file?\n")
		prompt := promptui.Prompt{
			Label:     "Continue anyway",
			IsConfirm: true,
		}
		if result, _ := prompt.Run(); strings.ToLower(result) != "y" {
			return fmt.Errorf("cancelled")
		}
	}

	// Encrypt value
	encrypted, err := cryptoSvc.Encrypt(value)
	if err != nil {
		return fmt.Errorf("failed to encrypt value: %w", err)
	}

	// Store secret
	if _, err := db.CreateSecret(env.ID, key, encrypted, setDescription); err != nil {
		return fmt.Errorf("failed to store secret: %w", err)
	}

	if !quiet {
		green.Printf("✓ Set %s in %s environment\n", key, setEnv)
	}

	return nil
}

func importFromFile(db *storage.DB, cryptoSvc *crypto.Service, envID, filePath string, green, yellow *color.Color) error {
	// Read .env file
	envMap, err := godotenv.Read(filePath)
	if err != nil {
		return fmt.Errorf("failed to read file %s: %w", filePath, err)
	}

	if len(envMap) == 0 {
		return fmt.Errorf("no variables found in %s", filePath)
	}

	// Import each variable
	count := 0
	for key, value := range envMap {
		// Validate key
		if err := utils.ValidateEnvKey(key); err != nil {
			yellow.Printf("⚠ Skipping invalid key: %s (%v)\n", key, err)
			continue
		}

		// Encrypt and store
		encrypted, err := cryptoSvc.Encrypt(value)
		if err != nil {
			yellow.Printf("⚠ Failed to encrypt %s: %v\n", key, err)
			continue
		}

		if _, err := db.CreateSecret(envID, key, encrypted, ""); err != nil {
			yellow.Printf("⚠ Failed to store %s: %v\n", key, err)
			continue
		}

		count++
	}

	green.Printf("✓ Imported %d variables from %s\n", count, filePath)
	return nil
}
