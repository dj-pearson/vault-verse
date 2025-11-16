package main

import (
	"fmt"
	"os"

	"github.com/dj-pearson/envault/cmd"
	"github.com/dj-pearson/envault/internal/crypto"
)

var (
	// Version is set during build
	Version = "dev"
	// BuildTime is set during build
	BuildTime = "unknown"
)

func main() {
	// Initialize security features
	initSecurity()

	// Set version info for commands
	cmd.Version = Version
	cmd.BuildTime = BuildTime

	if err := cmd.Execute(); err != nil {
		fmt.Fprintln(os.Stderr, err)
		os.Exit(1)
	}
}

// initSecurity initializes security features for the CLI
func initSecurity() {
	// Disable core dumps to prevent secrets from being written to disk
	if err := crypto.DisableCoreDumps(); err != nil {
		// Non-fatal error, just warn
		// We don't use logger here to avoid circular dependencies at init
		fmt.Fprintf(os.Stderr, "Warning: Failed to disable core dumps: %v\n", err)
	}

	// Additional security initialization can be added here:
	// - Lock process memory (if needed)
	// - Set resource limits
	// - Initialize secure random number generator
}
