package cmd

import (
	"fmt"

	"github.com/dj-pearson/envault/internal/config"
	"github.com/dj-pearson/envault/internal/crypto"
	"github.com/dj-pearson/envault/internal/storage"
	"github.com/dj-pearson/envault/internal/utils"
	"github.com/fatih/color"
	"github.com/manifoldco/promptui"
	"github.com/olekukonko/tablewriter"
	"github.com/spf13/cobra"
	"os"
	"strings"
)

var envCmd = &cobra.Command{
	Use:   "env",
	Short: "Manage environments",
	Long: `Manage environments within a project.

Subcommands:
  list        List all environments
  create      Create a new environment
  delete      Delete an environment
  rename      Rename an environment
  copy        Copy variables between environments`,
}

var envListCmd = &cobra.Command{
	Use:   "list",
	Short: "List all environments",
	RunE:  runEnvList,
}

var envCreateCmd = &cobra.Command{
	Use:   "create NAME",
	Short: "Create a new environment",
	Args:  cobra.ExactArgs(1),
	RunE:  runEnvCreate,
}

var envDeleteCmd = &cobra.Command{
	Use:   "delete NAME",
	Short: "Delete an environment",
	Args:  cobra.ExactArgs(1),
	RunE:  runEnvDelete,
}

var envCopyCmd = &cobra.Command{
	Use:   "copy SOURCE TARGET",
	Short: "Copy variables from one environment to another",
	Args:  cobra.ExactArgs(2),
	RunE:  runEnvCopy,
}

func init() {
	rootCmd.AddCommand(envCmd)
	envCmd.AddCommand(envListCmd)
	envCmd.AddCommand(envCreateCmd)
	envCmd.AddCommand(envDeleteCmd)
	envCmd.AddCommand(envCopyCmd)
}

func runEnvList(cmd *cobra.Command, args []string) error {
	cyan := color.New(color.FgCyan)

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

	// Get environments
	environments, err := db.ListEnvironments(ctx.ProjectID)
	if err != nil {
		return fmt.Errorf("failed to list environments: %w", err)
	}

	if len(environments) == 0 {
		fmt.Println("No environments found")
		return nil
	}

	// Display as table
	cyan.Printf("Environments for project: %s\n\n", ctx.ProjectName)

	table := tablewriter.NewWriter(os.Stdout)
	table.SetHeader([]string{"Name", "Variables", "Created"})
	table.SetBorder(false)

	for _, env := range environments {
		secrets, _ := db.ListSecrets(env.ID)
		varCount := fmt.Sprintf("%d", len(secrets))

		table.Append([]string{
			env.Name,
			varCount,
			env.CreatedAt.Format("2006-01-02"),
		})
	}

	table.Render()

	return nil
}

func runEnvCreate(cmd *cobra.Command, args []string) error {
	green := color.New(color.FgGreen)
	yellow := color.New(color.FgYellow)

	envName := args[0]

	// Validate environment name
	if envName == "" {
		return fmt.Errorf("environment name cannot be empty")
	}

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

	// Check if environment already exists
	existing, _ := db.GetEnvironment(ctx.ProjectID, envName)
	if existing != nil {
		return fmt.Errorf("environment '%s' already exists", envName)
	}

	// Create environment
	env, err := db.CreateEnvironment(ctx.ProjectID, envName)
	if err != nil {
		return fmt.Errorf("failed to create environment: %w", err)
	}

	green.Printf("✓ Created environment '%s'\n", env.Name)

	// Ask if they want to copy from existing
	if !quiet {
		yellow.Println("\nCopy variables from an existing environment?")
		prompt := promptui.Select{
			Label: "Source environment",
			Items: []string{"(skip)", "development", "staging", "production"},
		}

		_, result, err := prompt.Run()
		if err == nil && result != "(skip)" {
			if err := copyEnvironmentVariables(db, ctx.ProjectID, result, envName); err != nil {
				yellow.Printf("⚠ Failed to copy variables: %v\n", err)
			} else {
				green.Printf("✓ Copied variables from %s\n", result)
			}
		}
	}

	return nil
}

func runEnvDelete(cmd *cobra.Command, args []string) error {
	yellow := color.New(color.FgYellow)
	green := color.New(color.FgGreen)

	envName := args[0]

	// SECURITY SAFEGUARD: Prevent deleting production without explicit confirmation
	if envName == "production" && !quiet {
		yellow.Println("⚠ WARNING: You are about to delete the PRODUCTION environment!")
		yellow.Println("⚠ This will permanently delete all production secrets!")

		if !utils.ConfirmDangerousAction("Delete production environment and all its secrets") {
			yellow.Println("Cancelled")
			return nil
		}
	}

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

	// Get environment
	env, err := db.GetEnvironment(ctx.ProjectID, envName)
	if err != nil {
		return fmt.Errorf("environment '%s' not found", envName)
	}

	// Count secrets
	secrets, _ := db.ListSecrets(env.ID)

	// Confirm deletion
	if !quiet {
		prompt := promptui.Prompt{
			Label:     fmt.Sprintf("Delete '%s' and its %d variables", envName, len(secrets)),
			IsConfirm: true,
		}

		result, err := prompt.Run()
		if err != nil || strings.ToLower(result) != "y" {
			yellow.Println("Cancelled")
			return nil
		}
	}

	// Delete environment (cascades to secrets)
	err = db.DeleteEnvironment(env.ID)
	if err != nil {
		return fmt.Errorf("failed to delete environment: %w", err)
	}

	green.Printf("✓ Deleted environment '%s'\n", envName)

	return nil
}

func runEnvCopy(cmd *cobra.Command, args []string) error {
	green := color.New(color.FgGreen)
	yellow := color.New(color.FgYellow)

	sourceEnv := args[0]
	targetEnv := args[1]

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

	// SECURITY SAFEGUARD: Warn when copying to production
	if targetEnv == "production" && !quiet {
		yellow.Printf("⚠ WARNING: Copying to PRODUCTION environment\n")
		prompt := promptui.Prompt{
			Label:     "Continue",
			IsConfirm: true,
		}

		result, err := prompt.Run()
		if err != nil || strings.ToLower(result) != "y" {
			yellow.Println("Cancelled")
			return nil
		}
	}

	// Copy variables
	if err := copyEnvironmentVariables(db, ctx.ProjectID, sourceEnv, targetEnv); err != nil {
		return err
	}

	green.Printf("✓ Copied variables from %s to %s\n", sourceEnv, targetEnv)

	return nil
}

func copyEnvironmentVariables(db *storage.DB, projectID, sourceEnvName, targetEnvName string) error {
	cryptoSvc, err := crypto.New()
	if err != nil {
		return fmt.Errorf("failed to initialize crypto: %w", err)
	}

	// Get source environment
	sourceEnv, err := db.GetEnvironment(projectID, sourceEnvName)
	if err != nil {
		return fmt.Errorf("source environment '%s' not found", sourceEnvName)
	}

	// Get target environment
	targetEnv, err := db.GetEnvironment(projectID, targetEnvName)
	if err != nil {
		return fmt.Errorf("target environment '%s' not found", targetEnvName)
	}

	// Get source secrets
	sourceSecrets, err := db.ListSecrets(sourceEnv.ID)
	if err != nil {
		return fmt.Errorf("failed to list source secrets: %w", err)
	}

	if len(sourceSecrets) == 0 {
		return fmt.Errorf("no variables found in %s environment", sourceEnvName)
	}

	// Copy each secret
	for _, secret := range sourceSecrets {
		// Decrypt and re-encrypt (in case we need to)
		value, err := cryptoSvc.Decrypt(secret.EncryptedValue)
		if err != nil {
			return fmt.Errorf("failed to decrypt %s: %w", secret.Key, err)
		}

		encrypted, err := cryptoSvc.Encrypt(value)
		if err != nil {
			return fmt.Errorf("failed to encrypt %s: %w", secret.Key, err)
		}

		// Create in target environment
		if _, err := db.CreateSecret(targetEnv.ID, secret.Key, encrypted, secret.Description); err != nil {
			return fmt.Errorf("failed to copy %s: %w", secret.Key, err)
		}
	}

	return nil
}
