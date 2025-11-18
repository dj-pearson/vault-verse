# EnVault for VS Code

Secure environment variable management for VS Code. EnVault helps you manage secrets safely with zero-knowledge encryption, team collaboration, and seamless IDE integration.

## Features

### 🔐 Secure Secret Management

- **Zero-knowledge encryption** - Your secrets are encrypted locally before syncing
- **Team collaboration** - Share secrets securely with your team
- **Multi-environment support** - Manage dev, staging, and production secrets separately
- **Audit logging** - Track all changes to your secrets

### 💡 Smart IntelliSense

Auto-complete environment variables from your EnVault project:

![IntelliSense Demo](https://via.placeholder.com/600x300.png?text=IntelliSense+Demo)

- Works in JavaScript, TypeScript, Python, Go, Rust, and more
- Shows masked values in autocomplete
- Displays descriptions for documented secrets

### 🎯 Hover Tooltips

Hover over any environment variable to see its masked value:

![Hover Demo](https://via.placeholder.com/600x300.png?text=Hover+Tooltip+Demo)

- Quick actions: Copy, Edit, View History
- Environment indicator
- Suggests creating missing secrets

### 📊 Sidebar Views

Browse and manage all your secrets from the VS Code sidebar:

![Sidebar Demo](https://via.placeholder.com/600x300.png?text=Sidebar+Demo)

- Tree view organized by environment
- Right-click context menus
- Quick add, edit, and delete actions

### 🎚️ Environment Switching

Switch between environments with one click from the status bar:

![Status Bar](https://via.placeholder.com/300x50.png?text=Status+Bar)

- Visual indicators for production vs development
- Current environment always visible
- Sync status updates

## Installation

### Prerequisites

You need the EnVault CLI installed on your system:

```bash
# macOS/Linux via Homebrew
brew install dj-pearson/tap/envault

# or via npm
npm install -g envault-cli

# or via curl
curl -fsSL https://get.envault.net | sh
```

### Install Extension

1. Open VS Code
2. Go to Extensions (Cmd+Shift+X / Ctrl+Shift+X)
3. Search for "EnVault"
4. Click Install

## Quick Start

### 1. Initialize a Project

Open a workspace folder and run:

```
Cmd+Shift+P → EnVault: Initialize Project
```

This creates a `.envault` file in your project root.

### 2. Add Your First Secret

```
Cmd+Shift+P → EnVault: Add Secret
```

Enter a key (e.g., `API_KEY`) and value.

### 3. Use in Code

Now just type `process.env.` and see your secrets autocomplete!

```javascript
const apiKey = process.env.API_KEY; // ← IntelliSense works here!
```

## Commands

All commands are available via the Command Palette (Cmd+Shift+P / Ctrl+Shift+P):

| Command | Description |
|---------|-------------|
| `EnVault: Initialize Project` | Create a new EnVault project |
| `EnVault: Add Secret` | Add a new environment variable |
| `EnVault: List Secrets` | Browse all secrets in current environment |
| `EnVault: Switch Environment` | Change active environment |
| `EnVault: Sync Secrets` | Sync with team |
| `EnVault: Pull Secrets` | Pull latest secrets from team |
| `EnVault: Push Secrets` | Push local secrets to team |
| `EnVault: Export to .env` | Export secrets to .env file (plaintext) |
| `EnVault: Import from .env` | Import secrets from .env file |
| `EnVault: View Audit Log` | See all project changes |
| `EnVault: Login` | Authenticate for team features |
| `EnVault: Logout` | Clear authentication |

## Configuration

Configure the extension in VS Code settings:

| Setting | Default | Description |
|---------|---------|-------------|
| `envault.cliPath` | `envault` | Path to EnVault CLI executable |
| `envault.defaultEnvironment` | `development` | Default environment to use |
| `envault.autoSync` | `false` | Auto-sync on project open |
| `envault.showValuesInTree` | `false` | Show masked values in sidebar |
| `envault.enableIntelliSense` | `true` | Enable autocomplete |
| `envault.enableHover` | `true` | Enable hover tooltips |
| `envault.maskPattern` | `***` | Pattern for masking values |

## Usage Examples

### JavaScript/TypeScript

```javascript
// Node.js
const dbUrl = process.env.DATABASE_URL;

// With destructuring
const { API_KEY, SECRET_KEY } = process.env;

// Vite/React
const apiUrl = import.meta.env.VITE_API_URL;
```

### Python

```python
import os

api_key = os.environ['API_KEY']
db_url = os.getenv('DATABASE_URL')
```

### Go

```go
import "os"

apiKey := os.Getenv("API_KEY")
```

## Team Collaboration

### Setting Up Team Sync

1. **Login to EnVault**:
   ```
   Cmd+Shift+P → EnVault: Login
   ```

2. **Initialize with Team**:
   ```bash
   # Via CLI
   envault init my-app --team
   ```

3. **Team members pull secrets**:
   ```
   Cmd+Shift+P → EnVault: Pull Secrets
   ```

### Best Practices

- ✅ Use **development** for local work
- ✅ Use **staging** for testing
- ✅ Use **production** for prod (careful!)
- ✅ Always pull before making changes
- ✅ Review changes in audit log
- ❌ Don't commit `.env` files to git
- ❌ Don't share secrets via Slack/email

## Security

EnVault uses **zero-knowledge encryption**:

- Secrets are encrypted on your machine with AES-256-GCM
- Encryption keys never leave your device
- Server cannot decrypt your secrets
- Perfect for compliance (SOC 2, HIPAA, etc.)

## Troubleshooting

### CLI Not Found Error

If you see **"'envault' is not recognized as an internal or external command"** or **"EnVault CLI is not installed"**:

**Solution:**
1. Install the CLI first (see [Installation](#installation) above)
2. Verify installation: Open terminal and run `envault --version`
3. If installed but not in PATH, configure custom path:
   - Open VS Code Settings: `Ctrl+,` (Windows/Linux) or `Cmd+,` (Mac)
   - Search for "EnVault CLI Path"
   - Set the full path to the `envault` executable
   - Example (Windows): `C:\Program Files\EnVault\envault.exe`
   - Example (Mac/Linux): `/usr/local/bin/envault`

**On Windows:** Make sure to restart VS Code after installing the CLI.

### Deprecation Warnings in Output

If you see warnings like:
```
[DEP0040] DeprecationWarning: The `punycode` module is deprecated
[DEP0005] DeprecationWarning: Buffer() is deprecated
```

**Don't worry!** These are harmless warnings from Node.js dependencies and don't affect functionality. They come from VS Code's internal modules, not EnVault. You can safely ignore them - they will be fixed in future Node.js/VS Code updates.

To hide these warnings (optional):
- Add `"NODE_NO_WARNINGS=1"` to your environment variables, or
- Update to the latest VS Code version, or
- Wait for dependency updates (we're tracking this)

### "unknown flag: --show-description" Error

If you see this error, it means your CLI version is outdated.

**Solution:**
1. Update the CLI to the latest version:
   ```bash
   # If installed via npm
   npm update -g envault-cli

   # If installed via brew
   brew upgrade envault
   ```
2. Reload VS Code: `Ctrl+Shift+P` → "Developer: Reload Window"
3. Verify version: Run `envault --version` (should be >= 0.2.0)

### Database Permission Warnings

If you see **"[WARN] Database file had insecure permissions"**:

This is a security feature - EnVault automatically fixes insecure file permissions on your database file. The warning is informational only. The issue has been fixed automatically, and your data is secure.

**To prevent this warning:** Ensure your `.envault.db` file has permissions `600` (owner read/write only).

### No Secrets Showing

1. Ensure you've initialized the project: `Cmd+Shift+P` → `EnVault: Initialize Project`
2. Check `.envault` file exists in workspace root
3. Try refreshing the tree view: `Cmd+Shift+P` → `EnVault: Refresh`
4. Check you're using the correct environment (see status bar at bottom)

### IntelliSense Not Working

1. Verify setting is enabled: `Settings` → `envault.enableIntelliSense` → `true`
2. Ensure you're typing the correct pattern:
   - JavaScript/TypeScript: `process.env.`
   - Python: `os.environ[` or `os.getenv(`
   - Go: `os.Getenv(`
3. Reload window: `Cmd+Shift+P` → `Developer: Reload Window`
4. Check the language is supported (see [Features](#features))

### Sync Failures

1. Ensure you're logged in: `Cmd+Shift+P` → `EnVault: Login`
2. Check network connection (firewall/proxy issues)
3. Verify project has team sync enabled: Check `.envault` file for `team_id`
4. Try pulling first: `Cmd+Shift+P` → `EnVault: Pull Secrets`

### Extension Not Activating

1. Check VS Code version (requires VS Code 1.80.0 or later)
2. Look for error messages: `View` → `Output` → Select "EnVault" from dropdown
3. Reload window: `Cmd+Shift+P` → `Developer: Reload Window`
4. Reinstall extension if needed

## FAQ

**Q: Is this free?**
A: Local use is free forever. Team sync is $8/user/month.

**Q: Does this work offline?**
A: Yes! EnVault is local-first. Sync is optional.

**Q: Can I use this without the CLI?**
A: No, the extension requires the CLI to be installed.

**Q: What languages are supported?**
A: IntelliSense works in JS, TS, Python, Go, Rust, Ruby, PHP, Java.

**Q: Can I self-host?**
A: Yes, for enterprise customers. Contact us.

**Q: How is this different from .env files?**
A: EnVault encrypts secrets, adds team sync, audit logs, and prevents committing secrets to git.

## Support

- **Documentation**: https://envault.net/docs
- **Issues**: https://github.com/dj-pearson/vault-verse/issues
- **Discord**: https://discord.gg/envault
- **Email**: support@envault.net

## Contributing

Contributions are welcome! See [CONTRIBUTING.md](https://github.com/dj-pearson/vault-verse/blob/main/CONTRIBUTING.md)

## License

MIT © EnVault

---

**Made with ❤️ by the EnVault team**
