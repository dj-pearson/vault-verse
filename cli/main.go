package main

import (
	"fmt"
	"os"

	"github.com/dj-pearson/envvault/cmd"
)

var (
	// Version is set during build
	Version = "dev"
	// BuildTime is set during build
	BuildTime = "unknown"
)

func main() {
	// Set version info for commands
	cmd.Version = Version
	cmd.BuildTime = BuildTime

	if err := cmd.Execute(); err != nil {
		fmt.Fprintln(os.Stderr, err)
		os.Exit(1)
	}
}
