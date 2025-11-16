package cmd

import (
	"fmt"
	"os"
	"os/exec"
	"strings"
	"syscall"

	"github.com/dj-pearson/envault/internal/config"
	"github.com/dj-pearson/envault/internal/crypto"
	"github.com/dj-pearson/envault/internal/storage"
	"github.com/dj-pearson/envault/internal/utils"
	"github.com/fatih/color"
	"github.com/spf13/cobra"
)

var (
	runEnv         string
	runPreserveEnv bool
)

var runCmd = &cobra.Command{
	Use:   "run [command]",
	Short: "Run a command with environment variables injected",
	Long: `Run a command with environment variables injected from the encrypted vault.

Variables are loaded into the process environment and then the command is executed.
The variables only exist for that process and are not written to disk.

Examples:
  envault run npm start
  envault run --env production node server.js
  envault run python manage.py migrate
  envault run bash  # Interactive shell with vars`,
	DisableFlagParsing: true,
	RunE:               runRun,
}

func init() {
	rootCmd.AddCommand(runCmd)
}

func runRun(cmd *cobra.Command, args []string) error {
	red := color.New(color.FgRed)
	green := color.New(color.FgGreen)
	cyan := color.New(color.FgCyan)

	// Parse flags manually since we disabled flag parsing
	var cmdArgs []string
	env := "development"
	preserveEnv := false

	for i := 0; i < len(args); i++ {
		if args[i] == "--env" || args[i] == "-e" {
			if i+1 < len(args) {
				env = args[i+1]
				i++
			}
		} else if args[i] == "--preserve-env" {
			preserveEnv = true
		} else {
			cmdArgs = append(cmdArgs, args[i])
		}
	}

	if len(cmdArgs) == 0 {
		return fmt.Errorf("usage: envault run [flags] <command> [args...]")
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

	// Get environment
	environment, err := db.GetEnvironment(ctx.ProjectID, env)
	if err != nil {
		return fmt.Errorf("environment '%s' not found: %w", env, err)
	}

	// Load secrets
	secrets, err := db.ListSecrets(environment.ID)
	if err != nil {
		return fmt.Errorf("failed to load secrets: %w", err)
	}

	// Prepare environment variables
	envVars := make(map[string]string)

	// Preserve existing environment if requested
	if preserveEnv {
		for _, e := range os.Environ() {
			parts := strings.SplitN(e, "=", 2)
			if len(parts) == 2 {
				envVars[parts[0]] = parts[1]
			}
		}
	}

	// Decrypt and add secrets
	for _, secret := range secrets {
		value, err := cryptoSvc.Decrypt(secret.EncryptedValue)
		if err != nil {
			return fmt.Errorf("failed to decrypt %s: %w", secret.Key, err)
		}
		envVars[secret.Key] = value
	}

	if !quiet && debug {
		cyan.Printf("✓ Loaded %d environment variables from %s\n", len(secrets), env)
	}

	// Convert map to slice for exec
	envSlice := make([]string, 0, len(envVars))
	for k, v := range envVars {
		envSlice = append(envSlice, fmt.Sprintf("%s=%s", k, v))
	}

	// Find command in PATH
	cmdPath, err := exec.LookPath(cmdArgs[0])
	if err != nil {
		return fmt.Errorf("command not found: %s", cmdArgs[0])
	}

	// SECURITY SAFEGUARD: Warn if running with production env
	if env == "production" && !quiet {
		yellow := color.New(color.FgYellow)
		yellow.Printf("⚠ Running with production environment variables\n")
	}

	if !quiet {
		green.Printf("✓ Starting: %s\n", strings.Join(cmdArgs, " "))
		fmt.Println()
	}

	// Execute command with environment
	// Use syscall.Exec to replace current process (like exec in bash)
	err = syscall.Exec(cmdPath, cmdArgs, envSlice)
	if err != nil {
		return fmt.Errorf("failed to execute command: %w", err)
	}

	return nil
}
