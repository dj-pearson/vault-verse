# envault-cli

> Secure, local-first environment variable management

[![npm version](https://badge.fury.io/js/envault-cli.svg)](https://www.npmjs.com/package/envault-cli)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

## Installation

```bash
npm install -g envault-cli
```

Or use npx without installing:

```bash
npx envault-cli --help
```

## Quick Start

```bash
# Initialize a new project
envault init my-app

# Set environment variables
envault set DATABASE_URL=postgresql://localhost/mydb
envault set API_KEY=your-secret-key

# List variables (masked by default)
envault list

# Export to .env file
envault export -o .env

# Run command with injected environment
envault run npm start
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

- `envault init` - Initialize a new project
- `envault set KEY=value` - Set an environment variable
- `envault get KEY` - Get a variable value
- `envault list` - List all variables
- `envault unset KEY` - Remove a variable
- `envault run <command>` - Run command with env vars
- `envault import <file>` - Import from .env file
- `envault export` - Export variables
- `envault env` - Manage environments
- `envault sync` - Push/pull encrypted team data
- `envault team` - Manage team members

### Shell Completions

Install shell completions for better CLI experience:

```bash
# Bash
envault completion bash > /etc/bash_completion.d/envault

# Zsh
envault completion zsh > "${fpath[1]}/_envault"

# Fish
envault completion fish > ~/.config/fish/completions/envault.fish
```

## Platform Support

- macOS (Intel & Apple Silicon)
- Linux (x64 & ARM64)
- Windows (x64 & ARM64)

## Alternative Installation Methods

### Homebrew (macOS & Linux)

```bash
brew install envault/tap/envault
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
