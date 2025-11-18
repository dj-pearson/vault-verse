package cmd

import (
	"encoding/json"
	"fmt"
	"os"

	"github.com/dj-pearson/envault/internal/config"
	"github.com/dj-pearson/envault/internal/crypto"
	"github.com/dj-pearson/envault/internal/storage"
	"github.com/dj-pearson/envault/internal/utils"
	"github.com/fatih/color"
	"github.com/olekukonko/tablewriter"
	"github.com/spf13/cobra"
)

var (
	historyEnv   string
	historyLimit int
)

var historyCmd = &cobra.Command{
	Use:   "history KEY",
	Short: "View secret value history",
	Long: `View the version history of a secret value.

This shows all previous values of a secret, allowing you to see
when it was changed and potentially rollback to a previous version.

Examples:
  envault history API_KEY
  envault history DATABASE_URL --env production
  envault history SECRET_KEY --limit 10`,
	Args: cobra.ExactArgs(1),
	RunE: runHistory,
}

func init() {
	rootCmd.AddCommand(historyCmd)

	historyCmd.Flags().StringVar(&historyEnv, "env", "development", "environment name")
	historyCmd.Flags().IntVarP(&historyLimit, "limit", "n", 20, "maximum number of versions to show")
}

func runHistory(cmd *cobra.Command, args []string) error {
	cyan := color.New(color.FgCyan)
	green := color.New(color.FgGreen)
	yellow := color.New(color.FgYellow)

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
	env, err := db.GetEnvironment(ctx.ProjectID, historyEnv)
	if err != nil {
		return fmt.Errorf("environment '%s' not found", historyEnv)
	}

	// Get current secret
	secret, err := db.GetSecret(env.ID, key)
	if err != nil {
		return fmt.Errorf("secret '%s' not found in environment '%s'", key, historyEnv)
	}

	// Get history
	history, err := db.ListSecretHistory(secret.ID, historyLimit)
	if err != nil {
		return fmt.Errorf("failed to fetch history: %w", err)
	}

	if len(history) == 0 {
		if !quiet {
			yellow.Printf("No history found for %s\n", key)
			fmt.Println()
			fmt.Println("History is recorded when secrets are updated.")
			fmt.Println("This may be a newly created secret.")
		}
		return nil
	}

	// JSON output
	if jsonOutput {
		type HistoryEntry struct {
			Version     int    `json:"version"`
			Value       string `json:"value"`
			Description string `json:"description"`
			CreatedAt   string `json:"created_at"`
		}

		var entries []HistoryEntry
		for _, h := range history {
			value, err := cryptoSvc.Decrypt(h.EncryptedValue)
			if err != nil {
				value = "[decryption failed]"
			}
			entries = append(entries, HistoryEntry{
				Version:     h.Version,
				Value:       value,
				Description: h.Description,
				CreatedAt:   h.CreatedAt.Format("2006-01-02 15:04:05"),
			})
		}

		jsonData, _ := json.MarshalIndent(entries, "", "  ")
		fmt.Println(string(jsonData))
		return nil
	}

	// Table output
	if !quiet {
		cyan.Printf("History for %s in %s\n\n", key, historyEnv)
	}

	table := tablewriter.NewWriter(os.Stdout)
	table.SetHeader([]string{"Version", "Value", "Changed At"})
	table.SetBorder(false)
	table.SetAutoWrapText(false)

	for _, h := range history {
		value, err := cryptoSvc.Decrypt(h.EncryptedValue)
		if err != nil {
			value = "[decryption failed]"
		}

		// Mask the value
		maskedValue := utils.MaskSecret(value)

		table.Append([]string{
			fmt.Sprintf("v%d", h.Version),
			maskedValue,
			h.CreatedAt.Format("2006-01-02 15:04:05"),
		})
	}

	table.Render()

	if !quiet {
		fmt.Println()
		green.Println("💡 Tip: Use 'envault get' with --show to reveal values")
		fmt.Printf("Showing %d version(s)\n", len(history))
	}

	return nil
}
