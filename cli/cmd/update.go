package cmd

import (
	"encoding/json"
	"fmt"
	"io"
	"net/http"
	"os"
	"runtime"
	"strings"
	"time"

	"github.com/fatih/color"
	"github.com/spf13/cobra"
)

const (
	githubAPI = "https://api.github.com/repos/dj-pearson/vault-verse/releases/latest"
	repoURL   = "https://github.com/dj-pearson/vault-verse"
)

// GitHubRelease represents a GitHub release
type GitHubRelease struct {
	TagName string `json:"tag_name"`
	Name    string `json:"name"`
	Body    string `json:"body"`
	Assets  []struct {
		Name               string `json:"name"`
		BrowserDownloadURL string `json:"browser_download_url"`
	} `json:"assets"`
}

// updateCmd represents the update command
var updateCmd = &cobra.Command{
	Use:   "update",
	Short: "Update envvault to the latest version",
	Long: `Check for and install the latest version of envvault.

This command will:
  1. Check GitHub for the latest release
  2. Compare with your current version
  3. Download and install the update if available

The update will replace the current binary in place.`,
	RunE: runUpdate,
}

var (
	checkOnly bool
	force     bool
)

func init() {
	rootCmd.AddCommand(updateCmd)
	updateCmd.Flags().BoolVar(&checkOnly, "check", false, "check for updates without installing")
	updateCmd.Flags().BoolVar(&force, "force", false, "force update even if already on latest version")
}

func runUpdate(cmd *cobra.Command, args []string) error {
	// Get current version
	currentVersion := strings.TrimPrefix(Version, "v")
	if currentVersion == "" || currentVersion == "dev" {
		if checkOnly {
			return fmt.Errorf("cannot check for updates: running development version")
		}
		color.Yellow("Warning: Running development version")
		if !force {
			return fmt.Errorf("use --force to update from development version")
		}
	}

	// Fetch latest release
	fmt.Println("Checking for updates...")
	release, err := fetchLatestRelease()
	if err != nil {
		return fmt.Errorf("failed to check for updates: %w", err)
	}

	latestVersion := strings.TrimPrefix(release.TagName, "v")

	// Compare versions
	if !force && currentVersion == latestVersion {
		color.Green("✓ You are already on the latest version: v%s", latestVersion)
		return nil
	}

	// Show update information
	fmt.Println()
	color.Cyan("Current version: v%s", currentVersion)
	color.Cyan("Latest version:  v%s", latestVersion)
	fmt.Println()

	if checkOnly {
		if currentVersion == latestVersion {
			color.Green("✓ No update available")
		} else {
			color.Yellow("! Update available: v%s → v%s", currentVersion, latestVersion)
			fmt.Println()
			fmt.Println("To update, run:")
			fmt.Println("  envvault update")
		}
		return nil
	}

	// Get the appropriate binary for this platform
	binaryName := getBinaryName()
	asset := findAsset(release, binaryName)
	if asset == nil {
		return fmt.Errorf("no binary found for platform: %s", binaryName)
	}

	// Confirm update
	if !force {
		fmt.Printf("Do you want to update to v%s? [y/N]: ", latestVersion)
		var response string
		fmt.Scanln(&response)
		if strings.ToLower(response) != "y" && strings.ToLower(response) != "yes" {
			fmt.Println("Update cancelled")
			return nil
		}
	}

	// Download and install
	fmt.Println()
	fmt.Println("Downloading update...")
	if err := downloadAndInstall(asset.BrowserDownloadURL); err != nil {
		return fmt.Errorf("failed to install update: %w", err)
	}

	color.Green("✓ Successfully updated to v%s", latestVersion)
	fmt.Println()
	fmt.Println("Release notes:")
	fmt.Println(release.Body)

	return nil
}

// fetchLatestRelease gets the latest release from GitHub
func fetchLatestRelease() (*GitHubRelease, error) {
	client := &http.Client{Timeout: 10 * time.Second}

	req, err := http.NewRequest("GET", githubAPI, nil)
	if err != nil {
		return nil, err
	}

	// Set user agent (GitHub API requires it)
	req.Header.Set("User-Agent", fmt.Sprintf("envvault/%s", Version))

	resp, err := client.Do(req)
	if err != nil {
		return nil, err
	}
	defer resp.Body.Close()

	if resp.StatusCode != http.StatusOK {
		return nil, fmt.Errorf("GitHub API returned status %d", resp.StatusCode)
	}

	var release GitHubRelease
	if err := json.NewDecoder(resp.Body).Decode(&release); err != nil {
		return nil, err
	}

	return &release, nil
}

// getBinaryName returns the binary name for the current platform
func getBinaryName() string {
	goos := runtime.GOOS
	goarch := runtime.GOARCH

	// Map Go architectures to our naming
	arch := goarch
	if arch == "amd64" {
		arch = "amd64"
	} else if arch == "arm64" {
		arch = "arm64"
	}

	// Construct binary name
	name := fmt.Sprintf("envvault-%s-%s", goos, arch)

	// Add .exe for Windows
	if goos == "windows" {
		name += ".exe"
	}

	return name
}

// findAsset finds the asset matching the binary name
func findAsset(release *GitHubRelease, binaryName string) *struct {
	Name               string `json:"name"`
	BrowserDownloadURL string `json:"browser_download_url"`
} {
	for i := range release.Assets {
		if release.Assets[i].Name == binaryName {
			return &release.Assets[i]
		}
	}
	return nil
}

// downloadAndInstall downloads and installs the new binary
func downloadAndInstall(url string) error {
	// Get current executable path
	exePath, err := os.Executable()
	if err != nil {
		return fmt.Errorf("failed to get executable path: %w", err)
	}

	// Download to temporary file
	tmpFile, err := os.CreateTemp("", "envvault-update-*")
	if err != nil {
		return fmt.Errorf("failed to create temp file: %w", err)
	}
	defer os.Remove(tmpFile.Name())

	// Download binary
	client := &http.Client{Timeout: 5 * time.Minute}
	resp, err := client.Get(url)
	if err != nil {
		return fmt.Errorf("failed to download: %w", err)
	}
	defer resp.Body.Close()

	if resp.StatusCode != http.StatusOK {
		return fmt.Errorf("download failed with status %d", resp.StatusCode)
	}

	// Copy to temp file
	if _, err := io.Copy(tmpFile, resp.Body); err != nil {
		return fmt.Errorf("failed to write download: %w", err)
	}
	tmpFile.Close()

	// Make executable (Unix only)
	if runtime.GOOS != "windows" {
		if err := os.Chmod(tmpFile.Name(), 0755); err != nil {
			return fmt.Errorf("failed to make executable: %w", err)
		}
	}

	// Backup current binary
	backupPath := exePath + ".backup"
	if err := os.Rename(exePath, backupPath); err != nil {
		return fmt.Errorf("failed to backup current binary: %w", err)
	}

	// Move new binary to executable path
	if err := os.Rename(tmpFile.Name(), exePath); err != nil {
		// Restore backup on failure
		os.Rename(backupPath, exePath)
		return fmt.Errorf("failed to install new binary: %w", err)
	}

	// Remove backup
	os.Remove(backupPath)

	return nil
}
