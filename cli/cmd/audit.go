package cmd

import (
	"encoding/json"
	"fmt"
	"os"
	"strconv"

	"github.com/dj-pearson/envault/internal/config"
	"github.com/dj-pearson/envault/internal/storage"
	"github.com/dj-pearson/envault/internal/utils"
	"github.com/fatih/color"
	"github.com/olekukonko/tablewriter"
	"github.com/spf13/cobra"
)

var (
	auditLimit int
)

var auditCmd = &cobra.Command{
	Use:   "audit",
	Short: "View audit log of project changes",
	Long: `View the audit log showing all changes made to the project.

The audit log tracks:
  • Secret additions, updates, and deletions
  • Environment changes
  • Team member changes
  • Sync operations

Examples:
  envault audit                      # View last 50 entries
  envault audit --limit 100          # View last 100 entries
  envault audit --json               # Output as JSON`,
	RunE: runAudit,
}

func init() {
	rootCmd.AddCommand(auditCmd)

	auditCmd.Flags().IntVarP(&auditLimit, "limit", "n", 50, "maximum number of entries to show")
}

func runAudit(cmd *cobra.Command, args []string) error {
	cyan := color.New(color.FgCyan)
	green := color.New(color.FgGreen)
	yellow := color.New(color.FgYellow)
	red := color.New(color.FgRed)

	// Load project context
	ctx, err := utils.LoadProjectContext()
	if err != nil {
		return fmt.Errorf("Error: %v", err)
	}

	// Initialize database
	cfg, err := config.New()
	if err != nil {
		return fmt.Errorf("failed to create config: %w", err)
	}

	db, err := storage.New(cfg.DBPath)
	if err != nil {
		return fmt.Errorf("failed to initialize database: %w", err)
	}
	defer db.Close()

	// Fetch audit logs
	logs, err := db.ListAuditLogs(ctx.ProjectID, auditLimit)
	if err != nil {
		return fmt.Errorf("failed to fetch audit logs: %w", err)
	}

	if len(logs) == 0 {
		if !quiet {
			yellow.Println("No audit logs found")
			fmt.Println()
			fmt.Println("Audit logs track all changes to your project.")
			fmt.Println("Start making changes with:")
			green.Println("  envault set API_KEY=value")
			green.Println("  envault env create staging")
		}
		return nil
	}

	// JSON output
	if jsonOutput {
		jsonData, err := json.MarshalIndent(logs, "", "  ")
		if err != nil {
			return fmt.Errorf("failed to marshal logs: %w", err)
		}
		fmt.Println(string(jsonData))
		return nil
	}

	// Table output
	if !quiet {
		cyan.Printf("Audit log for project: %s\n\n", ctx.ProjectName)
	}

	table := tablewriter.NewWriter(os.Stdout)
	table.SetHeader([]string{"Time", "Action", "Details"})
	table.SetBorder(false)
	table.SetAutoWrapText(false)
	table.SetColumnAlignment([]int{
		tablewriter.ALIGN_LEFT,
		tablewriter.ALIGN_LEFT,
		tablewriter.ALIGN_LEFT,
	})

	for _, log := range logs {
		// Format timestamp
		timestamp := log.CreatedAt.Format("2006-01-02 15:04:05")

		// Color code actions
		action := log.Action
		actionColor := action
		switch {
		case contains(action, "create", "add", "set"):
			actionColor = green.Sprint(action)
		case contains(action, "delete", "remove", "unset"):
			actionColor = red.Sprint(action)
		case contains(action, "update", "modify", "sync"):
			actionColor = yellow.Sprint(action)
		default:
			actionColor = cyan.Sprint(action)
		}

		// Parse metadata if it's JSON
		metadata := log.Metadata
		if metadata != "" {
			var metaMap map[string]interface{}
			if err := json.Unmarshal([]byte(metadata), &metaMap); err == nil {
				// Format as key=value pairs
				var parts []string
				for k, v := range metaMap {
					parts = append(parts, fmt.Sprintf("%s=%v", k, v))
				}
				if len(parts) > 0 {
					metadata = fmt.Sprintf("%v", parts)
				}
			}
		}

		table.Append([]string{timestamp, actionColor, metadata})
	}

	table.Render()

	if !quiet {
		fmt.Printf("\nShowing %s of audit logs\n", auditLimitText(auditLimit, len(logs)))
		fmt.Println()
		fmt.Println("Use --limit to adjust the number of entries shown")
	}

	return nil
}

// Helper function to check if a string contains any of the given substrings (case insensitive)
func contains(s string, substrs ...string) bool {
	lower := s
	for _, substr := range substrs {
		if len(lower) >= len(substr) {
			for i := 0; i <= len(lower)-len(substr); i++ {
				match := true
				for j := 0; j < len(substr); j++ {
					c1 := lower[i+j]
					c2 := substr[j]
					if c1 >= 'A' && c1 <= 'Z' {
						c1 += 32
					}
					if c2 >= 'A' && c2 <= 'Z' {
						c2 += 32
					}
					if c1 != c2 {
						match = false
						break
					}
				}
				if match {
					return true
				}
			}
		}
	}
	return false
}

func auditLimitText(limit, actual int) string {
	if actual < limit {
		return strconv.Itoa(actual)
	}
	return "last " + strconv.Itoa(limit)
}
