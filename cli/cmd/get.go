package cmd

import (
	"fmt"

	"github.com/dj-pearson/envault/internal/config"
	"github.com/dj-pearson/envault/internal/crypto"
	"github.com/dj-pearson/envault/internal/storage"
	"github.com/dj-pearson/envault/internal/utils"
	"github.com/fatih/color"
	"github.com/spf13/cobra"
)

var (
	getEnv             string
	getShowDescription bool
	getFormat          string
)

var getCmd = &cobra.Command{
	Use:   "get KEY",
	Short: "Get an environment variable value",
	Long: `Get and decrypt an environment variable value.

The value is decrypted from local storage and displayed in plaintext.
Be careful when using this command in shared terminals or logs.

Examples:
  envault get DATABASE_URL
  envault get API_KEY --env production
  envault get DATABASE_URL --format export`,
	Args: cobra.ExactArgs(1),
	RunE: runGet,
}

func init() {
	rootCmd.AddCommand(getCmd)

	getCmd.Flags().StringVarP(&getEnv, "env", "e", "development", "Environment")
	getCmd.Flags().BoolVar(&getShowDescription, "show-description", false, "Show description")
	getCmd.Flags().StringVarP(&getFormat, "format", "f", "plain", "Output format: plain, json, export")
}

func runGet(cmd *cobra.Command, args []string) error {
	red := color.New(color.FgRed)
	key := args[0]

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
	env, err := db.GetEnvironment(ctx.ProjectID, getEnv)
	if err != nil {
		return fmt.Errorf("environment '%s' not found: %w", getEnv, err)
	}

	// Get secret
	secret, err := db.GetSecret(env.ID, key)
	if err != nil {
		return fmt.Errorf("variable '%s' not found in %s environment", key, getEnv)
	}

	// Decrypt value
	value, err := cryptoSvc.Decrypt(secret.EncryptedValue)
	if err != nil {
		return fmt.Errorf("failed to decrypt value: %w", err)
	}

	// Output based on format
	output := utils.FormatEnvVar(key, value, getFormat)
	fmt.Println(output)

	if getShowDescription && secret.Description != "" {
		yellow := color.New(color.FgYellow)
		yellow.Printf("# %s\n", secret.Description)
	}

	return nil
}
