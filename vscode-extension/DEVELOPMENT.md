# Development Guide

This guide will help you set up, develop, and test the EnVault VS Code extension.

## Prerequisites

- Node.js 20+
- npm or yarn
- VS Code 1.85+
- EnVault CLI installed locally

## Setup

1. **Clone the repository**:
   ```bash
   cd vscode-extension
   ```

2. **Install dependencies**:
   ```bash
   npm install
   ```

3. **Compile TypeScript**:
   ```bash
   npm run compile
   ```

## Development Workflow

### Running the Extension

1. Open the `vscode-extension` folder in VS Code
2. Press `F5` to launch Extension Development Host
3. A new VS Code window will open with the extension loaded
4. Test the extension in this window

### Watch Mode

For automatic recompilation on file changes:

```bash
npm run watch
```

Then reload the Extension Development Host window (Cmd+R / Ctrl+R) after changes.

### Debugging

1. Set breakpoints in the `.ts` files
2. Press `F5` to start debugging
3. Breakpoints will be hit in the Extension Development Host

Debug console will show:
- `console.log()` output
- Extension activation logs
- Error messages

## Testing

### Manual Testing

1. **Test without EnVault project**:
   - Open a folder without `.envault` file
   - Status bar should show "No Project"
   - Commands should prompt to initialize

2. **Test with EnVault project**:
   ```bash
   # In a test directory
   envault init test-project
   envault set TEST_KEY=test_value
   ```
   - Open this folder in Extension Development Host
   - Status bar should show current environment
   - Tree view should list secrets

3. **Test IntelliSense**:
   - Create a `.js` file
   - Type `process.env.`
   - Should see autocomplete with `TEST_KEY`

4. **Test Hover**:
   - Type `process.env.TEST_KEY` in a file
   - Hover over `TEST_KEY`
   - Should see tooltip with masked value

5. **Test Environment Switching**:
   - Click status bar
   - Select different environment
   - Verify secrets refresh

### Automated Tests

TODO: Add automated test suite

```bash
npm run test
```

## Project Structure

```
vscode-extension/
├── src/
│   ├── extension.ts              # Main entry point
│   ├── commands/
│   │   └── index.ts               # All command handlers
│   ├── providers/
│   │   ├── completionProvider.ts  # IntelliSense
│   │   ├── hoverProvider.ts       # Hover tooltips
│   │   └── treeDataProvider.ts    # Sidebar views
│   ├── services/
│   │   ├── cliService.ts          # CLI wrapper
│   │   └── projectService.ts      # Project state
│   └── ui/
│       └── statusBar.ts           # Status bar manager
├── out/                           # Compiled JavaScript (git ignored)
├── package.json                   # Extension manifest
├── tsconfig.json                  # TypeScript config
└── README.md                      # User documentation
```

## Key Files

### `package.json`

Defines:
- Extension metadata (name, version, description)
- VS Code engine version
- Activation events
- Contributed commands
- Configuration schema
- View containers and views

### `extension.ts`

Main entry point:
- `activate()` - Called when extension loads
- `deactivate()` - Called when extension unloads
- Initializes services, providers, and commands

### `services/cliService.ts`

Wraps all EnVault CLI commands:
- Executes CLI via `child_process.execSync()`
- Parses JSON output
- Handles errors

### `commands/index.ts`

Registers all Command Palette commands:
- Init, add, edit, delete secrets
- Sync, pull, push
- Switch environment
- Import/export

### `providers/completionProvider.ts`

IntelliSense for environment variables:
- Detects `process.env.` patterns
- Fetches secrets from current environment
- Provides completion items with masked values

### `providers/hoverProvider.ts`

Hover tooltips:
- Detects environment variable references
- Shows masked values
- Provides quick actions (copy, edit, history)

## Making Changes

### Adding a New Command

1. **Add to `package.json`**:
   ```json
   {
     "command": "envault.myCommand",
     "title": "EnVault: My Command",
     "icon": "$(icon-name)"
   }
   ```

2. **Register in `commands/index.ts`**:
   ```typescript
   context.subscriptions.push(
     vscode.commands.registerCommand('envault.myCommand', async () => {
       // Implementation
     })
   );
   ```

3. **Implement in CLI service** (if needed):
   ```typescript
   async myOperation(): Promise<void> {
     this.exec('my-cli-command');
   }
   ```

### Adding a Configuration Setting

1. **Add to `package.json` contributions**:
   ```json
   "envault.mySetting": {
     "type": "boolean",
     "default": true,
     "description": "My setting description"
   }
   ```

2. **Read in code**:
   ```typescript
   const config = vscode.workspace.getConfiguration('envault');
   const mySetting = config.get<boolean>('mySetting', true);
   ```

### Adding a New Provider

1. Create file in `src/providers/`
2. Implement VS Code provider interface
3. Register in `extension.ts`:
   ```typescript
   const myProvider = new MyProvider();
   context.subscriptions.push(
     vscode.languages.registerMyProvider(selector, myProvider)
   );
   ```

## Building for Production

### Package Extension

```bash
npm run package
```

This creates a `.vsix` file that can be installed or published.

### Install Locally

```bash
code --install-extension envault-vscode-0.1.0.vsix
```

### Publish to Marketplace

1. **Create Publisher** (one-time):
   ```bash
   npx vsce create-publisher envault
   ```

2. **Login**:
   ```bash
   npx vsce login envault
   ```

3. **Publish**:
   ```bash
   npm run publish
   ```

## Troubleshooting

### Extension Not Activating

- Check activation events in `package.json`
- Look for errors in "Output" → "Extension Host"
- Ensure `.envault` file exists if using `workspaceContains:.envault`

### IntelliSense Not Working

- Verify language is in `registerCompletionItemProvider` selector
- Check trigger characters (`.`, `[`, `"`, `'`)
- Look for errors in Debug Console

### CLI Commands Failing

- Check CLI is in PATH: `which envault`
- Verify CLI output format (should be JSON with `--json` flag)
- Test CLI command manually in terminal

### Tree View Empty

- Ensure `getChildren()` returns valid TreeItems
- Check for exceptions in provider
- Call `refresh()` after data changes

## Best Practices

### Error Handling

Always wrap CLI calls in try/catch:

```typescript
try {
  await cliService.setSecret(key, value);
  vscode.window.showInformationMessage('Success!');
} catch (error) {
  vscode.window.showErrorMessage(`Failed: ${error}`);
}
```

### Progress Indicators

Use for long-running operations:

```typescript
await vscode.window.withProgress({
  location: vscode.ProgressLocation.Notification,
  title: 'Syncing...',
}, async () => {
  await cliService.sync();
});
```

### User Input Validation

Always validate user input:

```typescript
const key = await vscode.window.showInputBox({
  validateInput: (value) => {
    if (!value) return 'Key is required';
    if (!/^[A-Z_][A-Z0-9_]*$/.test(value)) {
      return 'Invalid format';
    }
    return null;
  }
});
```

### Performance

- Cache secrets to avoid repeated CLI calls
- Use `--json` flag for faster parsing
- Debounce frequent operations

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

See [CONTRIBUTING.md](../CONTRIBUTING.md) for more details.

## Resources

- [VS Code Extension API](https://code.visualstudio.com/api)
- [Extension Guides](https://code.visualstudio.com/api/extension-guides/overview)
- [Publishing Extensions](https://code.visualstudio.com/api/working-with-extensions/publishing-extension)
- [EnVault CLI Docs](https://envault.net/docs/cli)
