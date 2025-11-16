package cmd

import (
	"fmt"

	"github.com/dj-pearson/envault/internal/auth"
	"github.com/fatih/color"
	"github.com/spf13/cobra"
)

var logoutCmd = &cobra.Command{
	Use:   "logout",
	Short: "Logout from EnvVault",
	Long: `Logout from your EnvVault account.

This will remove your authentication session from this machine.
You will need to login again to use team sync features.

Examples:
  envault logout`,
	RunE: runLogout,
}

func init() {
	rootCmd.AddCommand(logoutCmd)
}

func runLogout(cmd *cobra.Command, args []string) error {
	green := color.New(color.FgGreen)
	yellow := color.New(color.FgYellow)

	// Check if logged in
	if !auth.IsLoggedIn() {
		yellow.Println("Not currently logged in")
		return nil
	}

	// Get current session for display
	session, _ := auth.LoadSession()

	// Clear session
	if err := auth.ClearSession(); err != nil {
		return fmt.Errorf("failed to logout: %w", err)
	}

	if !quiet {
		green.Printf("✓ Logged out successfully")
		if session != nil {
			fmt.Printf(" (was logged in as %s)", session.Email)
		}
		fmt.Println()
	}

	return nil
}
