# Change Log

All notable changes to the "EnVault" extension will be documented in this file.

## [0.1.0] - 2025-01-XX

### Initial Release

#### Features

- 🎉 **Project Management**
  - Initialize EnVault projects from VS Code
  - Auto-detect existing EnVault projects
  - Project status in status bar

- 🔐 **Secret Management**
  - Add, edit, and delete secrets
  - Multi-environment support (dev, staging, production)
  - Import from .env files
  - Export to .env files

- 🔄 **Team Collaboration**
  - Sync secrets with team
  - Pull latest secrets
  - Push local changes
  - Login/logout functionality

- 💡 **IntelliSense & Autocomplete**
  - Autocomplete for `process.env.*`
  - Support for Node.js, Deno, Vite patterns
  - Masked value previews
  - Description tooltips

- 🎯 **Hover Tooltips**
  - Hover to see masked secret values
  - Quick actions: Copy, Edit, History
  - Warning for undefined secrets

- 📊 **Sidebar Views**
  - Secrets tree view by environment
  - Environments list view
  - Right-click context menus
  - Visual current environment indicator

- 🎚️ **Status Bar**
  - Current environment display
  - Environment switcher
  - Sync status indicator
  - Color coding (production = warning)

- 📝 **Audit & History**
  - View audit log
  - View secret history/versions
  - Track all changes

- ⚙️ **Configuration**
  - Custom CLI path
  - Default environment setting
  - Auto-sync option
  - Show/hide values in tree
  - Enable/disable IntelliSense
  - Enable/disable hover
  - Customizable mask pattern

#### Supported Languages

- JavaScript
- TypeScript
- Python
- Go
- Rust
- Ruby
- PHP
- Java

### Known Issues

- Placeholder icon (will be replaced with official icon)
- No inline documentation screenshots yet

### Coming Soon

- [ ] Secret templates
- [ ] Bulk operations
- [ ] Search/filter secrets
- [ ] VS Code workspace sync
- [ ] Encrypted workspace settings
