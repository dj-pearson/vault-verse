package cmd

import (
	"fmt"
	"os"
	"path/filepath"
	"strings"

	"github.com/dj-pearson/envault/internal/config"
	"github.com/dj-pearson/envault/internal/crypto"
	"github.com/dj-pearson/envault/internal/storage"
	"github.com/fatih/color"
	"github.com/google/uuid"
	"github.com/manifoldco/promptui"
	"github.com/spf13/cobra"
)

var (
	initTeam        bool
	initTemplate    string
	initEnvironments string
)

var initCmd = &cobra.Command{
	Use:   "init [project-name]",
	Short: "Initialize a new envault project",
	Long: `Initialize a new envault project in the current directory.

This command creates a new project with default environments (development, staging, production)
and sets up local encrypted storage for your environment variables.

Examples:
  envault init my-app
  envault init my-app --team
  envault init my-app --env dev,staging,prod`,
	RunE: runInit,
}

func init() {
	rootCmd.AddCommand(initCmd)

	initCmd.Flags().BoolVar(&initTeam, "team", false, "Initialize for team sync")
	initCmd.Flags().StringVar(&initTemplate, "template", "", "Use template (nodejs, python, rails)")
	initCmd.Flags().StringVarP(&initEnvironments, "env", "e", "development,staging,production", "Comma-separated environments")
}

func runInit(cmd *cobra.Command, args []string) error {
	green := color.New(color.FgGreen)
	yellow := color.New(color.FgYellow)
	red := color.New(color.FgRed)

	// Check if already initialized
	if _, err := os.Stat(".envault"); err == nil {
		return red.Sprint("Error: Project already initialized in this directory")
	}

	// Get project name
	var projectName string
	if len(args) > 0 {
		projectName = args[0]
	} else {
		// Get from current directory name
		cwd, err := os.Getwd()
		if err != nil {
			return fmt.Errorf("failed to get current directory: %w", err)
		}
		projectName = filepath.Base(cwd)

		// Prompt for confirmation
		prompt := promptui.Prompt{
			Label:     fmt.Sprintf("Project name"),
			Default:   projectName,
			AllowEdit: true,
		}
		result, err := prompt.Run()
		if err != nil {
			return fmt.Errorf("prompt cancelled")
		}
		projectName = result
	}

	// Validate project name
	if projectName == "" {
		return fmt.Errorf("project name cannot be empty")
	}

	// Parse environments
	envs := strings.Split(initEnvironments, ",")
	for i, env := range envs {
		envs[i] = strings.TrimSpace(env)
	}

	// Confirm team sync
	if !initTeam && !quiet {
		prompt := promptui.Prompt{
			Label:     "Enable team sync",
			IsConfirm: true,
		}
		result, _ := prompt.Run()
		initTeam = strings.ToLower(result) == "y"
	}

	// Initialize config
	cfg, err := config.New()
	if err != nil {
		return fmt.Errorf("failed to create config: %w", err)
	}

	if err := cfg.EnsureDirectories(); err != nil {
		return fmt.Errorf("failed to create directories: %w", err)
	}

	// Initialize database
	db, err := storage.New(cfg.DBPath)
	if err != nil {
		return fmt.Errorf("failed to initialize database: %w", err)
	}
	defer db.Close()

	// Create project
	projectID := uuid.New().String()
	project, err := db.CreateProject(projectName, "", "local") // Owner ID will be set after login
	if err != nil {
		return fmt.Errorf("failed to create project: %w", err)
	}

	// Create environments
	for _, envName := range envs {
		if _, err := db.CreateEnvironment(project.ID, envName); err != nil {
			return fmt.Errorf("failed to create environment %s: %w", envName, err)
		}
	}

	// Create .envault file in current directory
	envaultFile := filepath.Join(".", ".envault")
	content := fmt.Sprintf("project_id=%s\nproject_name=%s\n", project.ID, projectName)
	if err := os.WriteFile(envaultFile, []byte(content), 0600); err != nil {
		return fmt.Errorf("failed to create .envault file: %w", err)
	}

	// Add to .gitignore
	if err := addToGitignore(".envault"); err != nil {
		yellow.Println("Warning: Could not update .gitignore")
	}

	// Success output
	fmt.Println()
	green.Printf("✓ Project '%s' initialized\n", projectName)
	green.Printf("✓ Created environments: %s\n", strings.Join(envs, ", "))
	if initTeam {
		green.Println("✓ Team sync enabled")
	}
	fmt.Println()

	if !quiet {
		fmt.Println("Next steps:")
		fmt.Println("  Add variables:    envault set KEY=value")
		fmt.Println("  View variables:   envault list")
		fmt.Println("  Run with env:     envault run npm start")
		if initTeam {
			yellow.Println("\nTeam sync requires login: envault login")
		}
	}

	return nil
}

func addToGitignore(entry string) error {
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
	f.WriteString(fmt.Sprintf("\n# EnvVault\n%s\n", entry))

	return nil
}
