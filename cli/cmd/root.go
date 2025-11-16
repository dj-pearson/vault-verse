package cmd

import (
	"fmt"
	"os"

	"github.com/spf13/cobra"
	"github.com/spf13/viper"
)

var (
	cfgFile   string
	Version   string
	BuildTime string

	// Global flags
	quiet  bool
	json   bool
	debug  bool
)

// rootCmd represents the base command when called without any subcommands
var rootCmd = &cobra.Command{
	Use:   "envault",
	Short: "Secure, local-first environment variable management",
	Long: `EnvVault is a secure, local-first environment variable management tool
for developers and teams. It provides zero-knowledge encryption and optional
team sync for managing .env files across multiple environments.

Features:
  • Local-first: Works 100% offline with no account required
  • Zero-knowledge encryption: Your secrets never leave your machine unencrypted
  • Multi-environment support: dev, staging, production, and custom environments
  • Team sync: Optional encrypted sync for team collaboration
  • CLI-first: Fast, intuitive command-line interface`,
	SilenceUsage:  true,
	SilenceErrors: true,
}

// Execute adds all child commands to the root command and sets flags appropriately.
func Execute() error {
	return rootCmd.Execute()
}

func init() {
	cobra.OnInitialize(initConfig)

	// Global flags
	rootCmd.PersistentFlags().StringVar(&cfgFile, "config", "", "config file (default: $HOME/.envault/config.yml)")
	rootCmd.PersistentFlags().BoolVarP(&quiet, "quiet", "q", false, "suppress output")
	rootCmd.PersistentFlags().BoolVar(&json, "json", false, "output in JSON format")
	rootCmd.PersistentFlags().BoolVar(&debug, "debug", false, "enable debug mode")

	// Version flag
	rootCmd.Flags().BoolP("version", "v", false, "show version information")
	rootCmd.Run = func(cmd *cobra.Command, args []string) {
		if v, _ := cmd.Flags().GetBool("version"); v {
			fmt.Printf("envault version %s (built %s)\n", Version, BuildTime)
			return
		}
		cmd.Help()
	}
}

// initConfig reads in config file and ENV variables if set.
func initConfig() {
	if cfgFile != "" {
		viper.SetConfigFile(cfgFile)
	} else {
		home, err := os.UserHomeDir()
		if err != nil {
			fmt.Fprintln(os.Stderr, "Error:", err)
			os.Exit(1)
		}

		// Create config directory if it doesn't exist
		configDir := fmt.Sprintf("%s/.envault", home)
		if err := os.MkdirAll(configDir, 0700); err != nil {
			fmt.Fprintln(os.Stderr, "Error creating config directory:", err)
			os.Exit(1)
		}

		viper.AddConfigPath(configDir)
		viper.SetConfigName("config")
		viper.SetConfigType("yml")
	}

	viper.AutomaticEnv()

	// If a config file is found, read it in.
	if err := viper.ReadInConfig(); err == nil && debug {
		fmt.Fprintln(os.Stderr, "Using config file:", viper.ConfigFileUsed())
	}
}
