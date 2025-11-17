package cmd

import (
	"encoding/json"
	"fmt"

	"github.com/dj-pearson/envault/internal/config"
	"github.com/dj-pearson/envault/internal/crypto"
	"github.com/dj-pearson/envault/internal/models"
	"github.com/dj-pearson/envault/internal/storage"
	"github.com/dj-pearson/envault/internal/utils"
	"github.com/fatih/color"
	"github.com/olekukonko/tablewriter"
	"github.com/spf13/cobra"
	"os"
	"regexp"
	"strings"
)

var (
	listEnv        string
	listShowValues bool
	listFormat     string
	listFilter     string
)

var listCmd = &cobra.Command{
	Use:   "list",
	Short: "List all environment variables",
	Long: `List all environment variables in the current project.

By default, values are masked for security. Use --show-values to display actual values.

Examples:
  envault list
  envault list --env production
  envault list --show-values
  envault list --format json
  envault list --filter "^API_"`,
	RunE: runList,
}

func init() {
	rootCmd.AddCommand(listCmd)

	listCmd.Flags().StringVarP(&listEnv, "env", "e", "", "Environment (default: all)")
	listCmd.Flags().BoolVar(&listShowValues, "show-values", false, "Show actual values (default: masked)")
	listCmd.Flags().StringVarP(&listFormat, "format", "f", "table", "Output format: table, json, env")
	listCmd.Flags().StringVar(&listFilter, "filter", "", "Filter by regex pattern")
}

func runList(cmd *cobra.Command, args []string) error {
	red := color.New(color.FgRed)
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

	cryptoSvc, err := crypto.New()
	if err != nil {
		return fmt.Errorf("failed to initialize crypto: %w", err)
	}

	// Get environments to list
	var environments []*models.Environment
	if listEnv != "" {
		env, err := db.GetEnvironment(ctx.ProjectID, listEnv)
		if err != nil {
			return fmt.Errorf("environment '%s' not found: %w", listEnv, err)
		}
		environments = append(environments, env)
	} else {
		envs, err := db.ListEnvironments(ctx.ProjectID)
		if err != nil {
			return fmt.Errorf("failed to list environments: %w", err)
		}
		environments = envs
	}

	// Compile filter regex if provided
	var filterRegex *regexp.Regexp
	if listFilter != "" {
		var err error
		filterRegex, err = regexp.Compile(listFilter)
		if err != nil {
			return fmt.Errorf("invalid filter regex: %w", err)
		}
	}

	// Process each environment
	allSecrets := make(map[string][]*models.DecryptedSecret)
	totalCount := 0

	for _, env := range environments {
		secrets, err := db.ListSecrets(env.ID)
		if err != nil {
			return fmt.Errorf("failed to list secrets for %s: %w", env.Name, err)
		}

		decrypted := make([]*models.DecryptedSecret, 0)
		for _, secret := range secrets {
			// Apply filter
			if filterRegex != nil && !filterRegex.MatchString(secret.Key) {
				continue
			}

			var value string
			if listShowValues {
				decryptedValue, err := cryptoSvc.Decrypt(secret.EncryptedValue)
				if err != nil {
					return fmt.Errorf("failed to decrypt %s: %w", secret.Key, err)
				}
				value = decryptedValue
			} else {
				value = "***"
			}

			decrypted = append(decrypted, &models.DecryptedSecret{
				Key:         secret.Key,
				Value:       value,
				Description: secret.Description,
			})
		}

		if len(decrypted) > 0 {
			allSecrets[env.Name] = decrypted
			totalCount += len(decrypted)
		}
	}

	if totalCount == 0 {
		fmt.Println("No variables found")
		return nil
	}

	// Output based on format
	switch listFormat {
	case "json":
		return outputJSON(allSecrets)
	case "env":
		return outputEnv(allSecrets, listShowValues)
	default:
		return outputTable(allSecrets, cyan)
	}
}

func outputTable(allSecrets map[string][]*models.DecryptedSecret, cyan *color.Color) error {
	for envName, secrets := range allSecrets {
		cyan.Printf("\nEnvironment: %s (%d variables)\n", envName, len(secrets))
		fmt.Println(strings.Repeat("─", 60))

		table := tablewriter.NewWriter(os.Stdout)
		table.SetHeader([]string{"Key", "Value", "Description"})
		table.SetBorder(false)
		table.SetColumnSeparator("")
		table.SetHeaderLine(false)

		for _, secret := range secrets {
			value := secret.Value
			if !listShowValues {
				value = utils.MaskSecret(secret.Value)
			}

			table.Append([]string{
				secret.Key,
				value,
				secret.Description,
			})
		}

		table.Render()
		fmt.Println()
	}

	if !listShowValues {
		yellow := color.New(color.FgYellow)
		yellow.Println("💡 Tip: Use --show-values to see actual values")
	}

	return nil
}

func outputJSON(allSecrets map[string][]*models.DecryptedSecret) error {
	result := make(map[string]map[string]string)

	for envName, secrets := range allSecrets {
		envVars := make(map[string]string)
		for _, secret := range secrets {
			envVars[secret.Key] = secret.Value
		}
		result[envName] = envVars
	}

	encoder := json.NewEncoder(os.Stdout)
	encoder.SetIndent("", "  ")
	return encoder.Encode(result)
}

func outputEnv(allSecrets map[string][]*models.DecryptedSecret, showValues bool) error {
	for envName, secrets := range allSecrets {
		if len(allSecrets) > 1 {
			fmt.Printf("# Environment: %s\n", envName)
		}

		for _, secret := range secrets {
			value := secret.Value
			if !showValues {
				value = utils.MaskSecret(secret.Value)
			}

			if secret.Description != "" {
				fmt.Printf("# %s\n", secret.Description)
			}
			fmt.Printf("%s=%s\n", secret.Key, value)
		}

		if len(allSecrets) > 1 {
			fmt.Println()
		}
	}

	return nil
}
