package cmd

import (
	"fmt"
	"os"

	"github.com/dj-pearson/envvault/internal/config"
	"github.com/dj-pearson/envvault/internal/storage"
	"github.com/dj-pearson/envvault/internal/utils"
	"github.com/fatih/color"
	"github.com/spf13/cobra"
)

var statusCmd = &cobra.Command{
	Use:   "status",
	Short: "Show project status",
	Long: `Show the current project's status including:
  - Project name and ID
  - Sync status
  - Environments and variable counts
  - Storage size
  - Team information (if applicable)

Examples:
  envvault status`,
	RunE: runStatus,
}

func init() {
	rootCmd.AddCommand(statusCmd)
}

func runStatus(cmd *cobra.Command, args []string) error {
	cyan := color.New(color.FgCyan, color.Bold)
	green := color.New(color.FgGreen)
	yellow := color.New(color.FgYellow)
	red := color.New(color.FgRed)

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

	// Get project
	project, err := db.GetProject(ctx.ProjectID)
	if err != nil {
		return fmt.Errorf("project not found: %w", err)
	}

	// Display project info
	fmt.Println()
	cyan.Printf("Project: %s\n", project.Name)
	fmt.Printf("ID: %s\n", project.ID)

	// Sync status
	if project.SyncEnabled {
		if project.TeamID != nil {
			green.Printf("Status: Synced with team ✓\n")
			fmt.Printf("Team: %s\n", *project.TeamID)
		} else {
			green.Printf("Status: Sync enabled ✓\n")
		}
	} else {
		yellow.Printf("Status: Local only\n")
	}

	fmt.Println()

	// Environments
	environments, err := db.ListEnvironments(project.ID)
	if err != nil {
		return fmt.Errorf("failed to list environments: %w", err)
	}

	cyan.Println("Environments:")
	totalVars := 0

	for _, env := range environments {
		secrets, _ := db.ListSecrets(env.ID)
		varCount := len(secrets)
		totalVars += varCount

		syncStatus := "Local"
		if project.SyncEnabled {
			syncStatus = "Local + Cloud"
		}

		fmt.Printf("  %-15s %3d variables    %s\n", env.Name, varCount, syncStatus)
	}

	fmt.Println()

	// Summary
	cyan.Println("Summary:")
	fmt.Printf("  Total variables: %d\n", totalVars)
	fmt.Printf("  Environments: %d\n", len(environments))

	// Storage info
	fileInfo, err := os.Stat(cfg.DBPath)
	if err == nil {
		sizeMB := float64(fileInfo.Size()) / 1024 / 1024
		fmt.Printf("  Storage: %.2f MB (encrypted)\n", sizeMB)
	}

	fmt.Println()

	// Helpful commands
	if !quiet {
		cyan.Println("Quick commands:")
		fmt.Println("  Add variable:     envvault set KEY=value")
		fmt.Println("  List variables:   envvault list")
		fmt.Println("  Run with env:     envvault run npm start")
		if !project.SyncEnabled {
			fmt.Println("  Enable sync:      envvault login")
		}
	}

	fmt.Println()

	return nil
}
