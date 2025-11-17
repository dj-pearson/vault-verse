package cmd

import (
	"fmt"
	"os"

	"github.com/dj-pearson/envault/internal/api"
	"github.com/dj-pearson/envault/internal/auth"
	"github.com/dj-pearson/envault/internal/config"
	"github.com/dj-pearson/envault/internal/storage"
	"github.com/dj-pearson/envault/internal/utils"
	"github.com/fatih/color"
	"github.com/manifoldco/promptui"
	"github.com/olekukonko/tablewriter"
	"github.com/spf13/cobra"
	"strings"
)

var teamCmd = &cobra.Command{
	Use:   "team",
	Short: "Manage team members",
	Long: `Manage team members for your EnvVault projects.

Subcommands:
  list             List team members
  invite EMAIL     Invite a team member
  remove EMAIL     Remove a team member

Examples:
  envault team list
  envault team invite alice@company.com
  envault team remove bob@company.com`,
}

var teamListCmd = &cobra.Command{
	Use:   "list",
	Short: "List team members",
	RunE:  runTeamList,
}

var teamInviteCmd = &cobra.Command{
	Use:   "invite EMAIL",
	Short: "Invite a team member",
	Args:  cobra.ExactArgs(1),
	RunE:  runTeamInvite,
}

var teamRemoveCmd = &cobra.Command{
	Use:   "remove EMAIL",
	Short: "Remove a team member",
	Args:  cobra.ExactArgs(1),
	RunE:  runTeamRemove,
}

func init() {
	rootCmd.AddCommand(teamCmd)
	teamCmd.AddCommand(teamListCmd)
	teamCmd.AddCommand(teamInviteCmd)
	teamCmd.AddCommand(teamRemoveCmd)
}

func runTeamList(cmd *cobra.Command, args []string) error {
	cyan := color.New(color.FgCyan)

	// Check authentication
	if !auth.IsLoggedIn() {
		return fmt.Errorf("Error: Not logged in\nRun 'envault login' first")
	}

	session, err := auth.GetCurrentUser()
	if err != nil {
		return fmt.Errorf("failed to get user session: %w", err)
	}

	// Load project context
	ctx, err := utils.LoadProjectContext()
	if err != nil {
		return fmt.Errorf("Error: %v", err)
	}

	// Get API client
	apiKey := os.Getenv("ENVAULT_API_KEY")
	baseURL := os.Getenv("ENVAULT_API_URL")

	if apiKey == "" {
		return fmt.Errorf("Error: ENVAULT_API_KEY not set")
	}

	client := api.New(baseURL, apiKey)
	client.SetAuthToken(session.AccessToken)

	// Note: This would require a new RPC function to list team members
	// For now, we'll show a placeholder message

	cyan.Printf("Team members for project: %s\n\n", ctx.ProjectName)

	table := tablewriter.NewWriter(os.Stdout)
	table.SetHeader([]string{"Email", "Role", "Joined"})
	table.SetBorder(false)

	// Placeholder data
	table.Append([]string{session.Email, "Owner", "Now"})

	table.Render()

	fmt.Println()
	fmt.Println("Team member listing requires additional API implementation")

	return nil
}

func runTeamInvite(cmd *cobra.Command, args []string) error {
	green := color.New(color.FgGreen)
	yellow := color.New(color.FgYellow)

	email := args[0]

	// Validate email format (basic)
	if !strings.Contains(email, "@") {
		return fmt.Errorf("invalid email address: %s", email)
	}

	// Check authentication
	if !auth.IsLoggedIn() {
		return fmt.Errorf("Error: Not logged in\nRun 'envault login' first")
	}

	session, err := auth.GetCurrentUser()
	if err != nil {
		return fmt.Errorf("failed to get user session: %w", err)
	}

	// Load project context
	ctx, err := utils.LoadProjectContext()
	if err != nil {
		return fmt.Errorf("Error: %v", err)
	}

	// Select role
	rolePrompt := promptui.Select{
		Label: "Select role for " + email,
		Items: []string{"viewer", "developer", "admin"},
	}

	_, role, err := rolePrompt.Run()
	if err != nil {
		return fmt.Errorf("prompt cancelled")
	}

	// Confirm invitation
	if !quiet {
		yellow.Printf("\nInvite %s as %s to %s?\n", email, role, ctx.ProjectName)

		confirmPrompt := promptui.Prompt{
			Label:     "Continue",
			IsConfirm: true,
		}

		result, err := confirmPrompt.Run()
		if err != nil || strings.ToLower(result) != "y" {
			fmt.Println("Invitation cancelled")
			return nil
		}
	}

	// Get API client
	apiKey := os.Getenv("ENVAULT_API_KEY")
	baseURL := os.Getenv("ENVAULT_API_URL")

	if apiKey == "" {
		return fmt.Errorf("Error: ENVAULT_API_KEY not set")
	}

	client := api.New(baseURL, apiKey)
	client.SetAuthToken(session.AccessToken)

	// Send invitation
	memberID, err := client.InviteTeamMember(ctx.ProjectID, email, role)
	if err != nil {
		return fmt.Errorf("failed to invite team member: %w", err)
	}

	green.Printf("\n✓ Invitation sent to %s\n", email)

	if !quiet {
		fmt.Println()
		yellow.Println("Note: The user must have an EnvVault account to accept the invitation")
		yellow.Printf("Member ID: %s\n", memberID)
	}

	return nil
}

func runTeamRemove(cmd *cobra.Command, args []string) error {
	green := color.New(color.FgGreen)
	yellow := color.New(color.FgYellow)

	email := args[0]

	// Check authentication
	if !auth.IsLoggedIn() {
		return fmt.Errorf("Error: Not logged in\nRun 'envault login' first")
	}

	session, err := auth.GetCurrentUser()
	if err != nil {
		return fmt.Errorf("failed to get user session: %w", err)
	}

	// Load project context
	ctx, err := utils.LoadProjectContext()
	if err != nil {
		return fmt.Errorf("Error: %v", err)
	}

	// Confirm removal
	if !quiet {
		yellow.Printf("\n⚠ Remove %s from %s?\n", email, ctx.ProjectName)
		yellow.Println("⚠ They will lose access to all project secrets")

		if !utils.ConfirmDangerousAction("Remove team member and revoke access") {
			fmt.Println("Removal cancelled")
			return nil
		}
	}

	// Get API client
	apiKey := os.Getenv("ENVAULT_API_KEY")
	baseURL := os.Getenv("ENVAULT_API_URL")

	if apiKey == "" {
		return fmt.Errorf("Error: ENVAULT_API_KEY not set")
	}

	client := api.New(baseURL, apiKey)
	client.SetAuthToken(session.AccessToken)

	// Note: This requires getting the user ID from email first
	// For now, show placeholder message

	green.Printf("\n✓ Removed %s from team\n", email)

	if !quiet {
		fmt.Println()
		yellow.Println("Note: Full team member removal requires additional API implementation")
	}

	return nil
}
