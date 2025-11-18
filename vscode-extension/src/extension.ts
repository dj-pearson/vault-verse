import * as vscode from 'vscode';
import { CLIService } from './services/cliService';
import { ProjectService } from './services/projectService';
import { StatusBarManager } from './ui/statusBar';
import {
  SecretsTreeDataProvider,
  EnvironmentsTreeDataProvider,
} from './providers/treeDataProvider';
import { EnvCompletionProvider } from './providers/completionProvider';
import { EnvHoverProvider } from './providers/hoverProvider';
import { registerCommands } from './commands';

export async function activate(context: vscode.ExtensionContext) {
  console.log('EnVault extension is now active!');

  // Initialize services
  const cliService = new CLIService();
  const projectService = new ProjectService(cliService);

  // Check if CLI is installed
  const cliInstalled = await cliService.checkCLI();
  if (!cliInstalled) {
    const action = await vscode.window.showWarningMessage(
      'EnVault CLI is not installed or not found in PATH. Please install it first.',
      'Install Instructions',
      'Configure Path'
    );

    if (action === 'Install Instructions') {
      vscode.env.openExternal(vscode.Uri.parse('https://envault.net/docs/installation'));
    } else if (action === 'Configure Path') {
      vscode.commands.executeCommand('workbench.action.openSettings', 'envault.cliPath');
    }

    // Don't return - still activate extension in case CLI is installed later
  }

  // Initialize UI
  const statusBar = new StatusBarManager(projectService);
  context.subscriptions.push(statusBar);

  // Initialize tree data providers
  const secretsTreeProvider = new SecretsTreeDataProvider(cliService, projectService);
  const environmentsTreeProvider = new EnvironmentsTreeDataProvider(cliService, projectService);

  // Register tree views
  context.subscriptions.push(
    vscode.window.createTreeView('envault-secrets', {
      treeDataProvider: secretsTreeProvider,
      showCollapseAll: true,
    })
  );

  context.subscriptions.push(
    vscode.window.createTreeView('envault-environments', {
      treeDataProvider: environmentsTreeProvider,
      showCollapseAll: false,
    })
  );

  // Register completion provider for environment variables
  const completionProvider = new EnvCompletionProvider(cliService, projectService);
  context.subscriptions.push(
    vscode.languages.registerCompletionItemProvider(
      [
        { language: 'javascript' },
        { language: 'typescript' },
        { language: 'javascriptreact' },
        { language: 'typescriptreact' },
        { language: 'python' },
        { language: 'go' },
        { language: 'rust' },
        { language: 'ruby' },
        { language: 'php' },
        { language: 'java' },
      ],
      completionProvider,
      '.', // Trigger on dot
      '[', // Trigger on bracket
      '"', // Trigger on quote
      "'" // Trigger on single quote
    )
  );

  // Register hover provider for environment variables
  const hoverProvider = new EnvHoverProvider(cliService, projectService);
  context.subscriptions.push(
    vscode.languages.registerHoverProvider(
      [
        { language: 'javascript' },
        { language: 'typescript' },
        { language: 'javascriptreact' },
        { language: 'typescriptreact' },
        { language: 'python' },
        { language: 'go' },
        { language: 'rust' },
        { language: 'ruby' },
        { language: 'php' },
        { language: 'java' },
      ],
      hoverProvider
    )
  );

  // Register all commands
  registerCommands(
    context,
    cliService,
    projectService,
    statusBar,
    secretsTreeProvider,
    environmentsTreeProvider
  );

  // Register enhanced commands
  const {
    registerSearchSecretsCommand,
    registerClearSearchCommand,
    registerCopySecretCommand,
    registerCheckGitSafetyCommand,
    registerSetupFromTemplateCommand,
    registerBulkImportCommand,
    registerExportFormattedCommand,
  } = require('./commands/enhancedCommands');

  context.subscriptions.push(registerSearchSecretsCommand(context, secretsTreeProvider));
  context.subscriptions.push(registerClearSearchCommand(context, secretsTreeProvider));
  context.subscriptions.push(registerCopySecretCommand(context, cliService, projectService));
  context.subscriptions.push(registerCheckGitSafetyCommand(context));
  context.subscriptions.push(registerSetupFromTemplateCommand(context, cliService, projectService, secretsTreeProvider));
  context.subscriptions.push(registerBulkImportCommand(context, cliService, projectService, secretsTreeProvider));
  context.subscriptions.push(registerExportFormattedCommand(context, cliService, projectService));

  // Add helper commands for hover provider
  context.subscriptions.push(
    vscode.commands.registerCommand('envault.copySecretValue', async (args) => {
      try {
        const { key, env } = args;
        const value = await cliService.getSecret(key, env);
        await vscode.env.clipboard.writeText(value);
        vscode.window.showInformationMessage(`Copied ${key} to clipboard`);
      } catch (error) {
        vscode.window.showErrorMessage(`Failed to copy secret: ${error}`);
      }
    })
  );

  context.subscriptions.push(
    vscode.commands.registerCommand('envault.addSecretWithKey', async (args) => {
      const { key } = args;

      const value = await vscode.window.showInputBox({
        prompt: `Enter value for ${key}`,
        password: true,
      });

      if (!value) {
        return;
      }

      const description = await vscode.window.showInputBox({
        prompt: 'Enter description (optional)',
        placeHolder: 'Description of this secret',
      });

      const environment = projectService.currentEnvironment;

      try {
        await cliService.setSecret(key, value, environment, description);
        vscode.window.showInformationMessage(`Secret "${key}" added to ${environment}!`);
        secretsTreeProvider.refresh();
      } catch (error) {
        vscode.window.showErrorMessage(`Failed to add secret: ${error}`);
      }
    })
  );

  // Watch for .envault file changes
  const projectWatcher = projectService.watchProject(() => {
    statusBar.update();
    secretsTreeProvider.refresh();
    environmentsTreeProvider.refresh();
  });
  context.subscriptions.push(projectWatcher);

  // Check if auto-sync is enabled and project exists
  const config = vscode.workspace.getConfiguration('envault');
  const autoSync = config.get<boolean>('autoSync', false);
  const hasProject = await projectService.hasProject();

  if (autoSync && hasProject) {
    const shouldSync = await vscode.window.showInformationMessage(
      'EnVault project detected. Would you like to sync secrets?',
      'Sync Now',
      'Not Now'
    );

    if (shouldSync === 'Sync Now') {
      vscode.commands.executeCommand('envault.sync');
    }
  }

  // Show comprehensive welcome message for first-time users
  const hasShownWelcome = context.globalState.get<boolean>('envault.hasShownWelcome', false);

  if (!hasShownWelcome) {
    if (cliInstalled && hasProject) {
      // User has CLI and project - show quick tips
      const action = await vscode.window.showInformationMessage(
        '🔐 Welcome to EnVault! Your secrets are now managed securely.',
        'Quick Tour',
        'View Commands',
        "Don't show again"
      );

      if (action === 'Quick Tour') {
        vscode.window.showInformationMessage(
          '💡 Tip 1/3: Type "process.env." in any file for intelligent autocomplete of your secrets!',
        ).then(() => {
          vscode.window.showInformationMessage(
            '💡 Tip 2/3: Use the status bar at the bottom to quickly switch between environments.',
          ).then(() => {
            vscode.window.showInformationMessage(
              '💡 Tip 3/3: Press Ctrl+Shift+P (Cmd+Shift+P on Mac) and type "EnVault" to see all available commands.',
              'Got it!'
            );
          });
        });
      } else if (action === 'View Commands') {
        vscode.commands.executeCommand('workbench.action.showCommands', '>EnVault:');
      }

      if (action === "Don't show again" || action) {
        context.globalState.update('envault.hasShownWelcome', true);
      }
    } else if (cliInstalled && !hasProject) {
      // User has CLI but no project - guide them to initialize
      const action = await vscode.window.showInformationMessage(
        '🔐 EnVault is ready! Get started by initializing a new project.',
        'Initialize Project',
        'Learn More',
        "Don't show again"
      );

      if (action === 'Initialize Project') {
        vscode.commands.executeCommand('envault.init');
      } else if (action === 'Learn More') {
        vscode.env.openExternal(vscode.Uri.parse('https://envault.net/docs/quickstart'));
      }

      if (action === "Don't show again" || action) {
        context.globalState.update('envault.hasShownWelcome', true);
      }
    } else if (!cliInstalled) {
      // User doesn't have CLI - already showed warning above
      context.globalState.update('envault.hasShownWelcome', true);
    }
  }

  // Cleanup
  context.subscriptions.push({
    dispose: () => {
      projectService.dispose();
    },
  });

  return {
    // Export API for other extensions
    getSecret: (key: string, env?: string) => cliService.getSecret(key, env || projectService.currentEnvironment),
    listSecrets: (env?: string) => cliService.listSecrets(env || projectService.currentEnvironment),
    setSecret: (key: string, value: string, env?: string, description?: string) =>
      cliService.setSecret(key, value, env || projectService.currentEnvironment, description),
  };
}

export function deactivate() {
  console.log('EnVault extension is now deactivated');
}
