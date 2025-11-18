package cmd

import (
	"encoding/json"
	"fmt"
	"os"
	"path/filepath"

	"github.com/dj-pearson/envault/internal/config"
	"github.com/dj-pearson/envault/internal/utils"
	"github.com/fatih/color"
	"github.com/spf13/cobra"
	"github.com/spf13/viper"
)

var configCmd = &cobra.Command{
	Use:   "config",
	Short: "Manage EnvVault configuration",
	Long: `View and manage EnvVault configuration settings.

Subcommands:
  show             Show current configuration
  set KEY VALUE    Set a configuration value
  get KEY          Get a configuration value
  reset            Reset configuration to defaults

Configuration includes:
  • Global settings (~/.envault/config.yml)
  • Project settings (.envault)
  • Default environment
  • API endpoints

Examples:
  envault config show
  envault config set default_environment production
  envault config get default_environment`,
}

var configShowCmd = &cobra.Command{
	Use:   "show",
	Short: "Show current configuration",
	RunE:  runConfigShow,
}

var configSetCmd = &cobra.Command{
	Use:   "set KEY VALUE",
	Short: "Set a configuration value",
	Args:  cobra.ExactArgs(2),
	RunE:  runConfigSet,
}

var configGetCmd = &cobra.Command{
	Use:   "get KEY",
	Short: "Get a configuration value",
	Args:  cobra.ExactArgs(1),
	RunE:  runConfigGet,
}

var configResetCmd = &cobra.Command{
	Use:   "reset",
	Short: "Reset configuration to defaults",
	RunE:  runConfigReset,
}

func init() {
	rootCmd.AddCommand(configCmd)
	configCmd.AddCommand(configShowCmd)
	configCmd.AddCommand(configSetCmd)
	configCmd.AddCommand(configGetCmd)
	configCmd.AddCommand(configResetCmd)
}

func runConfigShow(cmd *cobra.Command, args []string) error {
	cyan := color.New(color.FgCyan)
	green := color.New(color.FgGreen)
	yellow := color.New(color.FgYellow)

	// Get configuration
	cfg, err := config.New()
	if err != nil {
		return fmt.Errorf("failed to load config: %w", err)
	}

	if !quiet {
		cyan.Println("EnvVault Configuration")
		fmt.Println()
	}

	// Global configuration
	if !quiet {
		green.Println("Global Settings:")
		fmt.Printf("  Config directory: %s\n", cfg.ConfigDir)
		fmt.Printf("  Data directory:   %s\n", cfg.DataDir)
		fmt.Printf("  Database path:    %s\n", cfg.DBPath)
		fmt.Println()
	}

	// Config file settings
	home, _ := os.UserHomeDir()
	configPath := filepath.Join(home, ".envault", "config.yml")

	if _, err := os.Stat(configPath); err == nil {
		if !quiet {
			green.Println("Config File Settings:")
		}

		// Load viper config
		v := viper.New()
		v.SetConfigFile(configPath)
		if err := v.ReadInConfig(); err == nil {
			settings := v.AllSettings()
			if len(settings) > 0 {
				for key, value := range settings {
					fmt.Printf("  %s: %v\n", key, value)
				}
			} else {
				fmt.Println("  (no settings configured)")
			}
		}
		fmt.Println()
	}

	// Project configuration (if in a project)
	ctx, err := utils.LoadProjectContext()
	if err == nil {
		if !quiet {
			green.Println("Current Project:")
			fmt.Printf("  Project ID:   %s\n", ctx.ProjectID)
			fmt.Printf("  Project Name: %s\n", ctx.ProjectName)
			fmt.Println()
		}
	} else {
		if !quiet {
			yellow.Println("Not in a project directory")
			fmt.Println()
		}
	}

	// Environment variables
	if !quiet {
		green.Println("Environment Variables:")
	}

	envVars := map[string]string{
		"ENVAULT_ENV":       os.Getenv("ENVAULT_ENV"),
		"ENVAULT_API_URL":   os.Getenv("ENVAULT_API_URL"),
		"ENVAULT_API_KEY":   maskIfSet(os.Getenv("ENVAULT_API_KEY")),
		"ENVAULT_DEBUG":     os.Getenv("ENVAULT_DEBUG"),
		"ENVAULT_NO_COLOR":  os.Getenv("ENVAULT_NO_COLOR"),
	}

	hasEnvVars := false
	for key, value := range envVars {
		if value != "" {
			fmt.Printf("  %s: %s\n", key, value)
			hasEnvVars = true
		}
	}

	if !hasEnvVars {
		fmt.Println("  (none set)")
	}

	return nil
}

func runConfigSet(cmd *cobra.Command, args []string) error {
	green := color.New(color.FgGreen)
	yellow := color.New(color.FgYellow)

	key := args[0]
	value := args[1]

	// Get home directory
	home, err := os.UserHomeDir()
	if err != nil {
		return fmt.Errorf("failed to get home directory: %w", err)
	}

	configPath := filepath.Join(home, ".envault", "config.yml")

	// Ensure config directory exists
	configDir := filepath.Dir(configPath)
	if err := os.MkdirAll(configDir, 0700); err != nil {
		return fmt.Errorf("failed to create config directory: %w", err)
	}

	// Load or create viper config
	v := viper.New()
	v.SetConfigFile(configPath)

	// Try to read existing config
	if _, err := os.Stat(configPath); err == nil {
		if err := v.ReadInConfig(); err != nil {
			yellow.Printf("Warning: Could not read existing config: %v\n", err)
		}
	}

	// Set the value
	v.Set(key, value)

	// Write config file
	if err := v.WriteConfig(); err != nil {
		// If file doesn't exist, create it
		if err := v.SafeWriteConfig(); err != nil {
			return fmt.Errorf("failed to write config: %w", err)
		}
	}

	green.Printf("✓ Set %s = %s\n", key, value)

	if !quiet {
		fmt.Println()
		fmt.Printf("Config saved to: %s\n", configPath)
	}

	return nil
}

func runConfigGet(cmd *cobra.Command, args []string) error {
	key := args[0]

	// Get home directory
	home, err := os.UserHomeDir()
	if err != nil {
		return fmt.Errorf("failed to get home directory: %w", err)
	}

	configPath := filepath.Join(home, ".envault", "config.yml")

	// Load viper config
	v := viper.New()
	v.SetConfigFile(configPath)

	if err := v.ReadInConfig(); err != nil {
		return fmt.Errorf("failed to read config: %w", err)
	}

	value := v.Get(key)
	if value == nil {
		return fmt.Errorf("configuration key '%s' not found", key)
	}

	// Output value
	if jsonOutput {
		result := map[string]interface{}{key: value}
		jsonData, _ := json.Marshal(result)
		fmt.Println(string(jsonData))
	} else {
		fmt.Println(value)
	}

	return nil
}

func runConfigReset(cmd *cobra.Command, args []string) error {
	green := color.New(color.FgGreen)
	yellow := color.New(color.FgYellow)

	if !quiet {
		yellow.Println("⚠ This will delete your configuration file")

		if !utils.ConfirmDangerousAction("Reset configuration to defaults") {
			fmt.Println("Reset cancelled")
			return nil
		}
	}

	// Get home directory
	home, err := os.UserHomeDir()
	if err != nil {
		return fmt.Errorf("failed to get home directory: %w", err)
	}

	configPath := filepath.Join(home, ".envault", "config.yml")

	// Remove config file
	if err := os.Remove(configPath); err != nil && !os.IsNotExist(err) {
		return fmt.Errorf("failed to remove config file: %w", err)
	}

	green.Println("✓ Configuration reset to defaults")

	if !quiet {
		fmt.Println()
		fmt.Println("Default settings will be used")
	}

	return nil
}

func maskIfSet(value string) string {
	if value == "" {
		return ""
	}
	if len(value) <= 8 {
		return "****"
	}
	return value[:4] + "****" + value[len(value)-4:]
}
