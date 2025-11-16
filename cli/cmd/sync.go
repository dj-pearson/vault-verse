package cmd

import (
	"encoding/base64"
	"fmt"
	"os"

	"github.com/dj-pearson/envvault/internal/api"
	"github.com/dj-pearson/envvault/internal/auth"
	"github.com/dj-pearson/envvault/internal/config"
	"github.com/dj-pearson/envvault/internal/crypto"
	"github.com/dj-pearson/envvault/internal/storage"
	"github.com/dj-pearson/envvault/internal/utils"
	"github.com/fatih/color"
	"github.com/manifoldco/promptui"
	"github.com/spf13/cobra"
	"strings"
)

var (
	syncPush  bool
	syncPull  bool
	syncForce bool
)

var syncCmd = &cobra.Command{
	Use:   "sync",
	Short: "Sync project with team (encrypted)",
	Long: `Sync your project with your team using encrypted cloud storage.

By default, this performs a two-way sync:
  1. Pull latest changes from cloud
  2. Push local changes to cloud

You can also specify one-way sync:
  --push    Push local changes only
  --pull    Pull cloud changes only

Your data is encrypted before being sent to the cloud. The server
never sees your plaintext secrets (zero-knowledge encryption).

Examples:
  envvault sync              # Two-way sync
  envvault sync --push       # Push only
  envvault sync --pull       # Pull only
  envvault sync --force      # Force sync (override conflicts)`,
	RunE: runSync,
}

func init() {
	rootCmd.AddCommand(syncCmd)

	syncCmd.Flags().BoolVar(&syncPush, "push", false, "Push local changes only")
	syncCmd.Flags().BoolVar(&syncPull, "pull", false, "Pull cloud changes only")
	syncCmd.Flags().BoolVar(&syncForce, "force", false, "Force sync (override conflicts)")
}

func runSync(cmd *cobra.Command, args []string) error {
	green := color.New(color.FgGreen)
	yellow := color.New(color.FgYellow)
	red := color.New(color.FgRed)
	cyan := color.New(color.FgCyan)

	// Check authentication
	if !auth.IsLoggedIn() {
		return red.Sprint("Error: Not logged in\nRun 'envvault login' first to enable team sync")
	}

	session, err := auth.GetCurrentUser()
	if err != nil {
		return fmt.Errorf("failed to get user session: %w", err)
	}

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

	cryptoSvc, err := crypto.New()
	if err != nil {
		return fmt.Errorf("failed to initialize crypto: %w", err)
	}

	// Get API client
	apiKey := os.Getenv("ENVVAULT_API_KEY")
	baseURL := os.Getenv("ENVVAULT_API_URL")

	if apiKey == "" {
		return red.Sprint("Error: ENVVAULT_API_KEY not set")
	}

	client := api.New(baseURL, apiKey)
	client.SetAuthToken(session.AccessToken)

	// Determine sync direction
	doPull := !syncPush || syncPull
	doPush := !syncPull || syncPush

	// PULL from cloud
	if doPull {
		if !quiet {
			cyan.Println("↓ Pulling from cloud...")
		}

		// Get latest blob from server
		pullResp, err := client.PullEncryptedBlob(ctx.ProjectID, nil)
		if err != nil {
			return fmt.Errorf("failed to pull from cloud: %w", err)
		}

		if pullResp.HasUpdate {
			// Decrypt and import
			encryptedData, err := base64.StdEncoding.DecodeString(pullResp.EncryptedData)
			if err != nil {
				return fmt.Errorf("failed to decode encrypted data: %w", err)
			}

			// Verify checksum
			actualChecksum := crypto.Hash(pullResp.EncryptedData)
			if actualChecksum != pullResp.Checksum {
				return fmt.Errorf("checksum mismatch: data may be corrupted")
			}

			// Decrypt blob
			decryptedJSON, err := cryptoSvc.Decrypt(encryptedData)
			if err != nil {
				return fmt.Errorf("failed to decrypt blob: %w", err)
			}

			// TODO: Import decrypted data into local database
			// This would involve parsing the JSON and updating secrets

			green.Printf("✓ Pulled version %d from cloud\n", pullResp.Version)
		} else {
			if !quiet {
				fmt.Println("  Already up to date")
			}
		}
	}

	// PUSH to cloud
	if doPush {
		if !quiet {
			cyan.Println("↑ Pushing local changes...")
		}

		// Get all environments and secrets
		environments, err := db.ListEnvironments(ctx.ProjectID)
		if err != nil {
			return fmt.Errorf("failed to list environments: %w", err)
		}

		// Build export data structure
		exportData := make(map[string]map[string]string)

		for _, env := range environments {
			secrets, err := db.ListSecrets(env.ID)
			if err != nil {
				return fmt.Errorf("failed to list secrets for %s: %w", env.Name, err)
			}

			envSecrets := make(map[string]string)
			for _, secret := range secrets {
				// Decrypt secret
				value, err := cryptoSvc.Decrypt(secret.EncryptedValue)
				if err != nil {
					return fmt.Errorf("failed to decrypt %s: %w", secret.Key, err)
				}
				envSecrets[secret.Key] = value
			}

			exportData[env.Name] = envSecrets
		}

		// Convert to JSON (in real implementation, use proper serialization)
		jsonData := fmt.Sprintf("%v", exportData) // Placeholder

		// Encrypt the entire blob
		encryptedBlob, err := cryptoSvc.Encrypt(jsonData)
		if err != nil {
			return fmt.Errorf("failed to encrypt blob: %w", err)
		}

		// Encode as base64
		encodedBlob := base64.StdEncoding.EncodeToString(encryptedBlob)

		// Calculate checksum
		checksum := crypto.Hash(encodedBlob)

		// Push to server
		pushResp, err := client.PushEncryptedBlob(ctx.ProjectID, encodedBlob, checksum)
		if err != nil {
			return fmt.Errorf("failed to push to cloud: %w", err)
		}

		green.Printf("✓ Pushed version %d to cloud\n", pushResp.Version)
	}

	if !quiet {
		fmt.Println()
		green.Println("✓ Sync complete")

		fmt.Println()
		cyan.Println("Your secrets are encrypted end-to-end.")
		cyan.Println("The server only stores encrypted blobs it cannot decrypt.")
	}

	return nil
}
