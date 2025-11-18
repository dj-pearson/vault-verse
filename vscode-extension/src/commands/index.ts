import * as vscode from 'vscode';
import { CLIService } from '../services/cliService';
import { ProjectService } from '../services/projectService';
import { StatusBarManager } from '../ui/statusBar';
import { SecretsTreeDataProvider, EnvironmentsTreeDataProvider } from '../providers/treeDataProvider';

export function registerCommands(
  context: vscode.ExtensionContext,
  cliService: CLIService,
  projectService: ProjectService,
  statusBar: StatusBarManager,
  secretsTreeProvider: SecretsTreeDataProvider,
  environmentsTreeProvider: EnvironmentsTreeDataProvider
): void {
  // Initialize project
  context.subscriptions.push(
    vscode.commands.registerCommand('envault.init', async () => {
      const projectName = await vscode.window.showInputBox({
        prompt: 'Enter project name',
        placeHolder: 'my-app',
      });

      if (!projectName) {
        return;
      }

      try {
        await vscode.window.withProgress(
          {
            location: vscode.ProgressLocation.Notification,
            title: 'Initializing EnVault project...',
            cancellable: false,
          },
          async () => {
            await cliService.init(projectName);
          }
        );

        vscode.window.showInformationMessage(`EnVault project "${projectName}" initialized!`);
        secretsTreeProvider.refresh();
        environmentsTreeProvider.refresh();
        statusBar.update();
      } catch (error) {
        vscode.window.showErrorMessage(`Failed to initialize project: ${error}`);
      }
    })
  );

  // Add secret
  context.subscriptions.push(
    vscode.commands.registerCommand('envault.addSecret', async () => {
      const key = await vscode.window.showInputBox({
        prompt: 'Enter secret key (e.g., API_KEY)',
        placeHolder: 'SECRET_KEY',
        validateInput: (value) => {
          if (!value) {
            return 'Key is required';
          }
          if (!/^[A-Z_][A-Z0-9_]*$/.test(value)) {
            return 'Key must be uppercase letters, numbers, and underscores only';
          }
          return null;
        },
      });

      if (!key) {
        return;
      }

      const value = await vscode.window.showInputBox({
        prompt: `Enter value for ${key}`,
        password: true,
      });

      if (!value) {
        return;
      }

      const description = await vscode.window.showInputBox({
        prompt: 'Enter description (optional)',
        placeHolder: 'API key for production service',
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

  // Edit secret
  context.subscriptions.push(
    vscode.commands.registerCommand('envault.editSecret', async (item) => {
      if (!item || !item.key) {
        vscode.window.showErrorMessage('No secret selected');
        return;
      }

      const value = await vscode.window.showInputBox({
        prompt: `Enter new value for ${item.key}`,
        password: true,
      });

      if (!value) {
        return;
      }

      try {
        await cliService.setSecret(item.key, value, item.environment);
        vscode.window.showInformationMessage(`Secret "${item.key}" updated!`);
        secretsTreeProvider.refresh();
      } catch (error) {
        vscode.window.showErrorMessage(`Failed to update secret: ${error}`);
      }
    })
  );

  // Delete secret
  context.subscriptions.push(
    vscode.commands.registerCommand('envault.deleteSecret', async (item) => {
      if (!item || !item.key) {
        vscode.window.showErrorMessage('No secret selected');
        return;
      }

      const confirm = await vscode.window.showWarningMessage(
        `Are you sure you want to delete "${item.key}" from ${item.environment}?`,
        { modal: true },
        'Delete'
      );

      if (confirm !== 'Delete') {
        return;
      }

      try {
        await cliService.deleteSecret(item.key, item.environment);
        vscode.window.showInformationMessage(`Secret "${item.key}" deleted!`);
        secretsTreeProvider.refresh();
      } catch (error) {
        vscode.window.showErrorMessage(`Failed to delete secret: ${error}`);
      }
    })
  );

  // List secrets
  context.subscriptions.push(
    vscode.commands.registerCommand('envault.listSecrets', async () => {
      const environment = projectService.currentEnvironment;

      try {
        const secrets = await cliService.listSecrets(environment);
        const keys = Object.keys(secrets);

        if (keys.length === 0) {
          vscode.window.showInformationMessage(`No secrets in ${environment} environment`);
          return;
        }

        const selected = await vscode.window.showQuickPick(keys, {
          placeHolder: `Select a secret from ${environment}`,
        });

        if (selected) {
          const value = secrets[selected].value;
          const action = await vscode.window.showQuickPick(
            ['Copy to clipboard', 'Show value', 'Edit', 'Delete'],
            { placeHolder: `What do you want to do with ${selected}?` }
          );

          if (action === 'Copy to clipboard') {
            await vscode.env.clipboard.writeText(value);
            vscode.window.showInformationMessage(`Copied ${selected} to clipboard`);
          } else if (action === 'Show value') {
            vscode.window.showInformationMessage(`${selected}: ${value}`);
          } else if (action === 'Edit') {
            vscode.commands.executeCommand('envault.editSecret', {
              key: selected,
              environment,
            });
          } else if (action === 'Delete') {
            vscode.commands.executeCommand('envault.deleteSecret', {
              key: selected,
              environment,
            });
          }
        }
      } catch (error) {
        vscode.window.showErrorMessage(`Failed to list secrets: ${error}`);
      }
    })
  );

  // Sync
  context.subscriptions.push(
    vscode.commands.registerCommand('envault.sync', async () => {
      statusBar.showSyncing();

      try {
        await vscode.window.withProgress(
          {
            location: vscode.ProgressLocation.Notification,
            title: 'Syncing secrets...',
            cancellable: false,
          },
          async () => {
            await cliService.sync();
          }
        );

        statusBar.showSyncSuccess();
        vscode.window.showInformationMessage('Secrets synced successfully!');
        secretsTreeProvider.refresh();
      } catch (error: any) {
        statusBar.showSyncError(error.message);
        vscode.window.showErrorMessage(`Sync failed: ${error}`);
      }
    })
  );

  // Pull
  context.subscriptions.push(
    vscode.commands.registerCommand('envault.pull', async () => {
      statusBar.showSyncing();

      try {
        await vscode.window.withProgress(
          {
            location: vscode.ProgressLocation.Notification,
            title: 'Pulling secrets...',
            cancellable: false,
          },
          async () => {
            await cliService.pull();
          }
        );

        statusBar.showSyncSuccess();
        vscode.window.showInformationMessage('Secrets pulled successfully!');
        secretsTreeProvider.refresh();
      } catch (error: any) {
        statusBar.showSyncError(error.message);
        vscode.window.showErrorMessage(`Pull failed: ${error}`);
      }
    })
  );

  // Push
  context.subscriptions.push(
    vscode.commands.registerCommand('envault.push', async () => {
      const confirm = await vscode.window.showWarningMessage(
        'This will push your local secrets to the team. Continue?',
        { modal: true },
        'Push'
      );

      if (confirm !== 'Push') {
        return;
      }

      statusBar.showSyncing();

      try {
        await vscode.window.withProgress(
          {
            location: vscode.ProgressLocation.Notification,
            title: 'Pushing secrets...',
            cancellable: false,
          },
          async () => {
            await cliService.push();
          }
        );

        statusBar.showSyncSuccess();
        vscode.window.showInformationMessage('Secrets pushed successfully!');
      } catch (error: any) {
        statusBar.showSyncError(error.message);
        vscode.window.showErrorMessage(`Push failed: ${error}`);
      }
    })
  );

  // Switch environment
  context.subscriptions.push(
    vscode.commands.registerCommand('envault.switchEnvironment', async (targetEnv?: string) => {
      let environment: string | undefined = targetEnv;

      if (!environment) {
        const environments = await projectService.getEnvironments();
        environment = await vscode.window.showQuickPick(environments, {
          placeHolder: 'Select environment',
        });
      }

      if (!environment) {
        return;
      }

      await projectService.setCurrentEnvironment(environment);
      vscode.window.showInformationMessage(`Switched to ${environment} environment`);
      secretsTreeProvider.refresh();
      environmentsTreeProvider.refresh();
      statusBar.update();
    })
  );

  // Export to .env
  context.subscriptions.push(
    vscode.commands.registerCommand('envault.exportEnv', async () => {
      const environment = projectService.currentEnvironment;

      const confirm = await vscode.window.showWarningMessage(
        `This will export secrets from ${environment} to a .env file in PLAINTEXT. Continue?`,
        { modal: true },
        'Export'
      );

      if (confirm !== 'Export') {
        return;
      }

      try {
        await cliService.exportToEnv(environment);
        vscode.window.showInformationMessage(
          `Secrets exported to .env file! ⚠️ Remember: .env files should be in .gitignore`
        );
      } catch (error) {
        vscode.window.showErrorMessage(`Export failed: ${error}`);
      }
    })
  );

  // Import from .env
  context.subscriptions.push(
    vscode.commands.registerCommand('envault.importEnv', async () => {
      const files = await vscode.window.showOpenDialog({
        canSelectMany: false,
        filters: { 'Environment Files': ['env'] },
        openLabel: 'Import',
      });

      if (!files || files.length === 0) {
        return;
      }

      const environment = projectService.currentEnvironment;

      try {
        await cliService.importFromEnv(files[0].fsPath, environment);
        vscode.window.showInformationMessage(`Secrets imported to ${environment}!`);
        secretsTreeProvider.refresh();
      } catch (error) {
        vscode.window.showErrorMessage(`Import failed: ${error}`);
      }
    })
  );

  // Refresh
  context.subscriptions.push(
    vscode.commands.registerCommand('envault.refresh', () => {
      secretsTreeProvider.refresh();
      environmentsTreeProvider.refresh();
      statusBar.update();
      vscode.window.showInformationMessage('EnVault refreshed!');
    })
  );

  // View audit log
  context.subscriptions.push(
    vscode.commands.registerCommand('envault.viewAuditLog', async () => {
      try {
        const logs = await cliService.getAuditLog(50);

        if (logs.length === 0) {
          vscode.window.showInformationMessage('No audit log entries found');
          return;
        }

        const items = logs.map((log) => ({
          label: log.action,
          description: new Date(log.createdAt).toLocaleString(),
          detail: log.metadata,
        }));

        await vscode.window.showQuickPick(items, {
          placeHolder: 'Audit Log',
        });
      } catch (error) {
        vscode.window.showErrorMessage(`Failed to load audit log: ${error}`);
      }
    })
  );

  // View secret history
  context.subscriptions.push(
    vscode.commands.registerCommand('envault.viewHistory', async (item) => {
      if (!item || !item.key) {
        vscode.window.showErrorMessage('No secret selected');
        return;
      }

      try {
        const history = await cliService.getSecretHistory(item.key, item.environment);

        if (history.length === 0) {
          vscode.window.showInformationMessage(`No history found for ${item.key}`);
          return;
        }

        const items = history.map((entry) => ({
          label: `Version ${entry.version}`,
          description: new Date(entry.createdAt).toLocaleString(),
          detail: entry.value.substring(0, 20) + '...',
        }));

        await vscode.window.showQuickPick(items, {
          placeHolder: `History for ${item.key}`,
        });
      } catch (error) {
        vscode.window.showErrorMessage(`Failed to load history: ${error}`);
      }
    })
  );

  // Login
  context.subscriptions.push(
    vscode.commands.registerCommand('envault.login', async () => {
      const token = await vscode.window.showInputBox({
        prompt: 'Enter your EnVault API token',
        password: true,
        placeHolder: 'envt_...',
      });

      if (!token) {
        return;
      }

      try {
        await cliService.login(token);
        vscode.window.showInformationMessage('Logged in successfully!');
      } catch (error) {
        vscode.window.showErrorMessage(`Login failed: ${error}`);
      }
    })
  );

  // Logout
  context.subscriptions.push(
    vscode.commands.registerCommand('envault.logout', async () => {
      const confirm = await vscode.window.showWarningMessage(
        'Are you sure you want to logout?',
        { modal: true },
        'Logout'
      );

      if (confirm !== 'Logout') {
        return;
      }

      try {
        await cliService.logout();
        vscode.window.showInformationMessage('Logged out successfully!');
      } catch (error) {
        vscode.window.showErrorMessage(`Logout failed: ${error}`);
      }
    })
  );
}
