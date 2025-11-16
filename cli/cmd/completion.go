package cmd

import (
	"os"

	"github.com/spf13/cobra"
)

// completionCmd represents the completion command
var completionCmd = &cobra.Command{
	Use:   "completion [bash|zsh|fish|powershell]",
	Short: "Generate shell completion scripts",
	Long: `Generate shell completion scripts for envvault.

To load completions:

Bash:

  $ source <(envvault completion bash)

  # To load completions for each session, execute once:
  # Linux:
  $ envvault completion bash > /etc/bash_completion.d/envvault
  # macOS:
  $ envvault completion bash > $(brew --prefix)/etc/bash_completion.d/envvault

Zsh:

  # If shell completion is not already enabled in your environment,
  # you will need to enable it.  You can execute the following once:

  $ echo "autoload -U compinit; compinit" >> ~/.zshrc

  # To load completions for each session, execute once:
  $ envvault completion zsh > "${fpath[1]}/_envvault"

  # You will need to start a new shell for this setup to take effect.

Fish:

  $ envvault completion fish | source

  # To load completions for each session, execute once:
  $ envvault completion fish > ~/.config/fish/completions/envvault.fish

PowerShell:

  PS> envvault completion powershell | Out-String | Invoke-Expression

  # To load completions for every new session, run:
  PS> envvault completion powershell > envvault.ps1
  # and source this file from your PowerShell profile.
`,
	DisableFlagsInUseLine: true,
	ValidArgs:             []string{"bash", "zsh", "fish", "powershell"},
	Args:                  cobra.MatchAll(cobra.ExactArgs(1), cobra.OnlyValidArgs),
	RunE: func(cmd *cobra.Command, args []string) error {
		switch args[0] {
		case "bash":
			return cmd.Root().GenBashCompletion(os.Stdout)
		case "zsh":
			return cmd.Root().GenZshCompletion(os.Stdout)
		case "fish":
			return cmd.Root().GenFishCompletion(os.Stdout, true)
		case "powershell":
			return cmd.Root().GenPowerShellCompletionWithDesc(os.Stdout)
		}
		return nil
	},
}

func init() {
	rootCmd.AddCommand(completionCmd)
}
