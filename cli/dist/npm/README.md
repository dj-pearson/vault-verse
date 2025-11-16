# @envvault/cli

> Secure, local-first environment variable management

[![npm version](https://badge.fury.io/js/%40envvault%2Fcli.svg)](https://www.npmjs.com/package/@envvault/cli)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

## Installation

```bash
npm install -g @envvault/cli
```

Or use npx without installing:

```bash
npx @envvault/cli --help
```

## Quick Start

```bash
# Initialize a new project
envvault init my-app

# Set environment variables
envvault set DATABASE_URL=postgresql://localhost/mydb
envvault set API_KEY=your-secret-key

# List variables (masked by default)
envvault list

# Export to .env file
envvault export -o .env

# Run command with injected environment
envvault run npm start
```

## Features

- 🔒 **Zero-knowledge encryption** - Your secrets never leave your machine unencrypted
- 💻 **Local-first** - Works 100% offline, no account required
- 🌍 **Multi-environment** - Manage dev, staging, production, and custom environments
- 👥 **Team sync** - Optional encrypted team collaboration
- 🔄 **Import/Export** - Seamless migration from .env files
- 🚀 **Fast & lightweight** - Built in Go, zero dependencies

## Documentation

Full documentation available at [envault.net/docs](https://envault.net/docs)

### Commands

- `envvault init` - Initialize a new project
- `envvault set KEY=value` - Set an environment variable
- `envvault get KEY` - Get a variable value
- `envvault list` - List all variables
- `envvault unset KEY` - Remove a variable
- `envvault run <command>` - Run command with env vars
- `envvault import <file>` - Import from .env file
- `envvault export` - Export variables
- `envvault env` - Manage environments
- `envvault sync` - Push/pull encrypted team data
- `envvault team` - Manage team members

### Shell Completions

Install shell completions for better CLI experience:

```bash
# Bash
envvault completion bash > /etc/bash_completion.d/envvault

# Zsh
envvault completion zsh > "${fpath[1]}/_envvault"

# Fish
envvault completion fish > ~/.config/fish/completions/envvault.fish
```

## Platform Support

- macOS (Intel & Apple Silicon)
- Linux (x64 & ARM64)
- Windows (x64 & ARM64)

## Alternative Installation Methods

### Homebrew (macOS & Linux)

```bash
brew install envvault/tap/envvault
```

### Direct Download

Download binaries from [GitHub Releases](https://github.com/dj-pearson/vault-verse/releases/latest)

### curl Installer

```bash
curl -fsSL https://get.envault.net | sh
```

## Support

- 📖 Documentation: https://envault.net/docs
- 🐛 Issues: https://github.com/dj-pearson/vault-verse/issues
- 💬 Discussions: https://github.com/dj-pearson/vault-verse/discussions

## License

MIT © EnvVault Team
