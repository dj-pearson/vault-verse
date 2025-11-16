package cmd

import (
	"fmt"
	"os"
	"strings"
	"time"

	"github.com/dj-pearson/envault/internal/api"
	"github.com/dj-pearson/envault/internal/auth"
	"github.com/dj-pearson/envault/internal/config"
	"github.com/fatih/color"
	"github.com/manifoldco/promptui"
	"github.com/spf13/cobra"
)

var (
	loginToken  string
	loginManual bool
)

var loginCmd = &cobra.Command{
	Use:   "login",
	Short: "Authenticate CLI with EnvVault",
	Long: `Authenticate the CLI with your EnvVault account to enable team sync features.

You can authenticate using:
  1. Interactive browser-based login (default)
  2. Personal access token (--token flag)
  3. Manual authentication (--manual flag)

Once authenticated, you can use team sync features like:
  - envault sync (push/pull encrypted data)
  - envault team (manage team members)

Examples:
  envault login
  envault login --token envt_a1b2c3d4...
  envault login --manual`,
	RunE: runLogin,
}

func init() {
	rootCmd.AddCommand(loginCmd)

	loginCmd.Flags().StringVar(&loginToken, "token", "", "Personal access token")
	loginCmd.Flags().BoolVar(&loginManual, "manual", false, "Manual authentication (no browser)")
}

func runLogin(cmd *cobra.Command, args []string) error {
	green := color.New(color.FgGreen)
	yellow := color.New(color.FgYellow)
	red := color.New(color.FgRed)
	cyan := color.New(color.FgCyan)

	// Check if already logged in
	if auth.IsLoggedIn() {
		session, _ := auth.LoadSession()
		yellow.Printf("⚠ Already logged in as %s\n", session.Email)

		prompt := promptui.Prompt{
			Label:     "Login with a different account",
			IsConfirm: true,
		}

		result, err := prompt.Run()
		if err != nil || strings.ToLower(result) != "y" {
			fmt.Println("Login cancelled")
			return nil
		}

		// Clear existing session
		if err := auth.ClearSession(); err != nil {
			yellow.Printf("Warning: Could not clear session: %v\n", err)
		}
	}

	// Get API configuration
	cfg, err := config.New()
	if err != nil {
		return fmt.Errorf("failed to create config: %w", err)
	}

	// Get API key and base URL from environment or config
	apiKey := os.Getenv("ENVAULT_API_KEY")
	baseURL := os.Getenv("ENVAULT_API_URL")

	if apiKey == "" {
		return red.Sprint("Error: ENVAULT_API_KEY environment variable not set\n\nPlease set your Supabase API key:\n  export ENVAULT_API_KEY=your_anon_key_here")
	}

	// Create API client
	client := api.New(baseURL, apiKey)

	var accessToken string

	// Handle token-based login
	if loginToken != "" {
		if !quiet {
			cyan.Println("Validating token...")
		}

		userID, err := client.ValidateToken(loginToken)
		if err != nil {
			return fmt.Errorf("token validation failed: %w", err)
		}

		accessToken = loginToken

		// Get user email (would need additional API call in real implementation)
		email := "user@example.com" // Placeholder

		// Save session
		session := &auth.Session{
			UserID:      userID,
			Email:       email,
			AccessToken: accessToken,
			ExpiresAt:   time.Now().Add(90 * 24 * time.Hour), // 90 days
		}

		if err := auth.SaveSession(session); err != nil {
			return fmt.Errorf("failed to save session: %w", err)
		}

		green.Printf("✓ Logged in successfully as %s\n", email)
		return nil
	}

	// Interactive login
	if !loginManual {
		yellow.Println("Opening browser for authentication...")
		yellow.Println("(Browser-based login not yet implemented)")
		fmt.Println()
		yellow.Println("Please use token-based authentication for now:")
		fmt.Println()
		cyan.Println("1. Go to your EnvVault dashboard → Settings → CLI Access")
		cyan.Println("2. Generate a new CLI token")
		cyan.Println("3. Run: envault login --token YOUR_TOKEN")
		fmt.Println()
		return nil
	}

	// Manual token input
	cyan.Println("Manual Authentication")
	fmt.Println()
	cyan.Println("1. Go to: https://your-envault-dashboard/settings/cli")
	cyan.Println("2. Generate a new personal access token")
	cyan.Println("3. Copy the token and paste it below")
	fmt.Println()

	prompt := promptui.Prompt{
		Label: "Personal Access Token",
		Mask:  '*',
		Validate: func(input string) error {
			if !strings.HasPrefix(input, "envt_") {
				return fmt.Errorf("invalid token format (should start with 'envt_')")
			}
			if len(input) < 20 {
				return fmt.Errorf("token too short")
			}
			return nil
		},
	}

	token, err := prompt.Run()
	if err != nil {
		return fmt.Errorf("prompt cancelled")
	}

	// Validate token
	if !quiet {
		cyan.Println("\nValidating token...")
	}

	userID, err := client.ValidateToken(token)
	if err != nil {
		return fmt.Errorf("token validation failed: %w", err)
	}

	// Save session
	session := &auth.Session{
		UserID:      userID,
		Email:       "user@example.com", // Placeholder
		AccessToken: token,
		ExpiresAt:   time.Now().Add(90 * 24 * time.Hour), // 90 days
	}

	if err := auth.SaveSession(session); err != nil {
		return fmt.Errorf("failed to save session: %w", err)
	}

	fmt.Println()
	green.Println("✓ Logged in successfully")
	fmt.Println()

	if !quiet {
		cyan.Println("You can now use team features:")
		fmt.Println("  envault sync     # Sync with team")
		fmt.Println("  envault team     # Manage team members")
	}

	return nil
}
