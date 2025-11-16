package cmd

import (
	"fmt"
	"strings"

	"github.com/dj-pearson/envault/internal/config"
	"github.com/dj-pearson/envault/internal/storage"
	"github.com/dj-pearson/envault/internal/utils"
	"github.com/fatih/color"
	"github.com/manifoldco/promptui"
	"github.com/spf13/cobra"
)

var (
	unsetEnv     string
	unsetAllEnvs bool
	unsetForce   bool
)

var unsetCmd = &cobra.Command{
	Use:   "unset KEY",
	Short: "Remove an environment variable",
	Long: `Remove an environment variable from the specified environment.

By default, this command will prompt for confirmation before deleting.
Use --force to skip confirmation.

Examples:
  envault unset OLD_API_KEY
  envault unset TEMP_VAR --env staging --force
  envault unset DEPRECATED_KEY --all-envs`,
	Args: cobra.ExactArgs(1),
	RunE: runUnset,
}

func init() {
	rootCmd.AddCommand(unsetCmd)

	unsetCmd.Flags().StringVarP(&unsetEnv, "env", "e", "development", "Environment")
	unsetCmd.Flags().BoolVar(&unsetAllEnvs, "all-envs", false, "Remove from all environments")
	unsetCmd.Flags().BoolVarP(&unsetForce, "force", "f", false, "Skip confirmation")
}

func runUnset(cmd *cobra.Command, args []string) error {
	green := color.New(color.FgGreen)
	red := color.New(color.FgRed)
	yellow := color.New(color.FgYellow)

	key := args[0]

	// Load project context
	ctx, err := utils.LoadProjectContext()
	if err != nil {
		return red.Sprintf("Error: %v", err)
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

	// Get environments to delete from
	var environments []string
	if unsetAllEnvs {
		envs, err := db.ListEnvironments(ctx.ProjectID)
		if err != nil {
			return fmt.Errorf("failed to list environments: %w", err)
		}
		for _, env := range envs {
			environments = append(environments, env.Name)
		}
	} else {
		environments = []string{unsetEnv}
	}

	// SECURITY SAFEGUARD: Confirm deletion
	if !unsetForce && !quiet {
		envList := strings.Join(environments, ", ")
		message := fmt.Sprintf("Remove '%s' from %s?", key, envList)

		prompt := promptui.Prompt{
			Label:     message,
			IsConfirm: true,
		}

		result, err := prompt.Run()
		if err != nil || strings.ToLower(result) != "y" {
			yellow.Println("Cancelled")
			return nil
		}
	}

	// Delete from each environment
	deletedCount := 0
	for _, envName := range environments {
		env, err := db.GetEnvironment(ctx.ProjectID, envName)
		if err != nil {
			yellow.Printf("⚠ Environment '%s' not found, skipping\n", envName)
			continue
		}

		if err := db.DeleteSecret(env.ID, key); err != nil {
			if strings.Contains(err.Error(), "not found") {
				if !quiet {
					yellow.Printf("⚠ '%s' not found in %s\n", key, envName)
				}
				continue
			}
			return fmt.Errorf("failed to delete from %s: %w", envName, err)
		}

		deletedCount++
		if !quiet {
			green.Printf("✓ Removed '%s' from %s\n", key, envName)
		}
	}

	if deletedCount == 0 {
		return fmt.Errorf("variable '%s' not found in any environment", key)
	}

	return nil
}
