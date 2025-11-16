package cmd

import (
	"encoding/json"
	"fmt"
	"os"
	"strings"

	"github.com/dj-pearson/envault/internal/config"
	"github.com/dj-pearson/envault/internal/models"
	"github.com/dj-pearson/envault/internal/storage"
	"github.com/fatih/color"
	"github.com/olekukonko/tablewriter"
	"github.com/spf13/cobra"
)

var (
	projectsFormat string
)

var projectsCmd = &cobra.Command{
	Use:   "projects",
	Short: "List all projects",
	Long: `List all envault projects stored locally.

This shows all projects that have been initialized on this machine,
including their sync status and basic metadata.

Examples:
  envault projects
  envault projects --format json`,
	RunE: runProjects,
}

func init() {
	rootCmd.AddCommand(projectsCmd)

	projectsCmd.Flags().StringVarP(&projectsFormat, "format", "f", "table", "Output format: table, json")
}

func runProjects(cmd *cobra.Command, args []string) error {
	cyan := color.New(color.FgCyan)
	yellow := color.New(color.FgYellow)

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

	// Get all projects
	projects, err := db.ListProjects()
	if err != nil {
		return fmt.Errorf("failed to list projects: %w", err)
	}

	if len(projects) == 0 {
		yellow.Println("No projects found. Run 'envault init' to create one.")
		return nil
	}

	// Output based on format
	if projectsFormat == "json" {
		encoder := json.NewEncoder(os.Stdout)
		encoder.SetIndent("", "  ")
		return encoder.Encode(projects)
	}

	// Group by personal vs team
	personal := make([]*models.Project, 0)
	team := make([]*models.Project, 0)

	for _, p := range projects {
		if p.TeamID != nil {
			team = append(team, p)
		} else {
			personal = append(personal, p)
		}
	}

	// Display personal projects
	if len(personal) > 0 {
		cyan.Println("Personal Projects")
		fmt.Println(strings.Repeat("─", 60))

		table := tablewriter.NewWriter(os.Stdout)
		table.SetHeader([]string{"Name", "Environments", "Status"})
		table.SetBorder(false)

		for _, p := range personal {
			envs, _ := db.ListEnvironments(p.ID)
			status := "Local only"
			if p.SyncEnabled {
				status = "Local + Synced"
			}

			table.Append([]string{
				p.Name,
				fmt.Sprintf("%d envs", len(envs)),
				status,
			})
		}

		table.Render()
		fmt.Println()
	}

	// Display team projects
	if len(team) > 0 {
		cyan.Println("Team Projects")
		fmt.Println(strings.Repeat("─", 60))

		table := tablewriter.NewWriter(os.Stdout)
		table.SetHeader([]string{"Name", "Team", "Environments"})
		table.SetBorder(false)

		for _, p := range team {
			envs, _ := db.ListEnvironments(p.ID)
			teamName := "Team"
			if p.TeamID != nil {
				teamName = *p.TeamID
			}

			table.Append([]string{
				p.Name,
				teamName,
				fmt.Sprintf("%d envs", len(envs)),
			})
		}

		table.Render()
	}

	return nil
}
