/**
 * Enhanced commands for improved UX
 */

import * as vscode from 'vscode';
import { CLIService } from '../services/cliService';
import { ProjectService } from '../services/projectService';
import { SecretsTreeDataProvider, SecretTreeItem } from '../providers/treeDataProvider';
import { checkEnvFilesInGit, checkProductionSafety, autoFixGitignore } from '../utils/gitSafety';
import { validateSecret } from '../utils/secretTypes';

/**
 * Search secrets command
 */
export function registerSearchSecretsCommand(
  context: vscode.ExtensionContext,
  secretsTreeProvider: SecretsTreeDataProvider
): vscode.Disposable {
  return vscode.commands.registerCommand('envault.searchSecrets', async () => {
    const searchTerm = await vscode.window.showInputBox({
      prompt: 'Search secrets by key or description',
      placeHolder: 'e.g., API, DATABASE, TOKEN',
    });

    if (searchTerm !== undefined) {
      if (searchTerm) {
        secretsTreeProvider.setSearchFilter(searchTerm);
        vscode.window.showInformationMessage(`Filtering secrets: "${searchTerm}"`);
      } else {
        secretsTreeProvider.clearSearchFilter();
        vscode.window.showInformationMessage('Search filter cleared');
      }
    }
  });
}

/**
 * Clear search command
 */
export function registerClearSearchCommand(
  context: vscode.ExtensionContext,
  secretsTreeProvider: SecretsTreeDataProvider
): vscode.Disposable {
  return vscode.commands.registerCommand('envault.clearSearch', () => {
    secretsTreeProvider.clearSearchFilter();
    vscode.window.showInformationMessage('Search filter cleared');
  });
}

/**
 * Quick copy secret value
 */
export function registerCopySecretCommand(
  context: vscode.ExtensionContext,
  cliService: CLIService,
  projectService: ProjectService
): vscode.Disposable {
  return vscode.commands.registerCommand('envault.copySecret', async (item: SecretTreeItem) => {
    try {
      const value = await cliService.getSecret(item.key, item.environment);
      await vscode.env.clipboard.writeText(value);
      vscode.window.showInformationMessage(`✅ Copied "${item.key}" to clipboard`);
    } catch (error) {
      vscode.window.showErrorMessage(`Failed to copy secret: ${error}`);
    }
  });
}

/**
 * Git safety check command
 */
export function registerCheckGitSafetyCommand(
  context: vscode.ExtensionContext
): vscode.Disposable {
  return vscode.commands.registerCommand('envault.checkGitSafety', async () => {
    const workspaceRoot = vscode.workspace.workspaceFolders?.[0]?.uri.fsPath;
    if (!workspaceRoot) {
      vscode.window.showWarningMessage('No workspace folder open');
      return;
    }

    const result = await checkEnvFilesInGit(workspaceRoot);

    if (result.isSafe) {
      vscode.window.showInformationMessage('✅ Git safety check passed! No secret files are tracked.');
    } else {
      const message = [...result.warnings, '', ...result.recommendations].join('\n');

      const action = await vscode.window.showWarningMessage(
        result.warnings.join('\n'),
        { modal: true, detail: message },
        'Auto-fix .gitignore',
        'Show Details'
      );

      if (action === 'Auto-fix .gitignore') {
        const fixed = await autoFixGitignore(workspaceRoot);
        if (fixed) {
          vscode.window.showInformationMessage('✅ .gitignore has been updated with security rules');
        } else {
          vscode.window.showWarningMessage('.gitignore already has proper rules');
        }
      } else if (action === 'Show Details') {
        const doc = await vscode.workspace.openTextDocument({
          content: message,
          language: 'markdown',
        });
        vscode.window.showTextDocument(doc);
      }
    }
  });
}

/**
 * Setup from template command
 */
export function registerSetupFromTemplateCommand(
  context: vscode.ExtensionContext,
  cliService: CLIService,
  projectService: ProjectService,
  secretsTreeProvider: SecretsTreeDataProvider
): vscode.Disposable {
  return vscode.commands.registerCommand('envault.setupFromTemplate', async () => {
    const templates = {
      'Next.js': {
        secrets: [
          { key: 'NEXT_PUBLIC_API_URL', description: 'Public API endpoint', example: 'https://api.example.com' },
          { key: 'DATABASE_URL', description: 'Database connection string', example: 'postgresql://user:pass@localhost:5432/db' },
          { key: 'NEXTAUTH_SECRET', description: 'NextAuth.js secret', example: 'openssl rand -base64 32' },
          { key: 'NEXTAUTH_URL', description: 'Application URL', example: 'http://localhost:3000' },
        ],
      },
      'React / Vite': {
        secrets: [
          { key: 'VITE_API_URL', description: 'API endpoint (public)', example: 'https://api.example.com' },
          { key: 'VITE_APP_NAME', description: 'Application name', example: 'My App' },
        ],
      },
      'Django': {
        secrets: [
          { key: 'SECRET_KEY', description: 'Django secret key', example: 'django-insecure-...' },
          { key: 'DATABASE_URL', description: 'Database URL', example: 'postgresql://user:pass@localhost:5432/db' },
          { key: 'DEBUG', description: 'Debug mode', example: 'False' },
          { key: 'ALLOWED_HOSTS', description: 'Allowed hosts', example: 'localhost,127.0.0.1' },
        ],
      },
      'Express.js': {
        secrets: [
          { key: 'PORT', description: 'Server port', example: '3000' },
          { key: 'DATABASE_URL', description: 'Database connection', example: 'mongodb://localhost:27017/mydb' },
          { key: 'JWT_SECRET', description: 'JWT signing secret', example: 'your-secret-key' },
          { key: 'NODE_ENV', description: 'Environment', example: 'development' },
        ],
      },
      'Laravel': {
        secrets: [
          { key: 'APP_KEY', description: 'Application key', example: 'base64:...' },
          { key: 'APP_URL', description: 'Application URL', example: 'http://localhost' },
          { key: 'DB_CONNECTION', description: 'Database driver', example: 'mysql' },
          { key: 'DB_HOST', description: 'Database host', example: '127.0.0.1' },
          { key: 'DB_PORT', description: 'Database port', example: '3306' },
          { key: 'DB_DATABASE', description: 'Database name', example: 'laravel' },
          { key: 'DB_USERNAME', description: 'Database user', example: 'root' },
          { key: 'DB_PASSWORD', description: 'Database password', example: '' },
        ],
      },
      'Rails': {
        secrets: [
          { key: 'SECRET_KEY_BASE', description: 'Rails secret key', example: 'rake secret' },
          { key: 'DATABASE_URL', description: 'Database URL', example: 'postgresql://localhost/mydb' },
          { key: 'RAILS_ENV', description: 'Rails environment', example: 'development' },
        ],
      },
      'Supabase Project': {
        secrets: [
          { key: 'SUPABASE_URL', description: 'Supabase project URL', example: 'https://xxx.supabase.co' },
          { key: 'SUPABASE_ANON_KEY', description: 'Supabase anonymous key', example: 'eyJ...' },
          { key: 'SUPABASE_SERVICE_ROLE_KEY', description: 'Service role key (server-only)', example: 'eyJ...' },
        ],
      },
    };

    const templateName = await vscode.window.showQuickPick(Object.keys(templates), {
      placeHolder: 'Select a project template',
      title: 'Setup Common Secrets',
    });

    if (!templateName) {
      return;
    }

    const template = templates[templateName as keyof typeof templates];
    const environment = projectService.currentEnvironment;

    let addedCount = 0;
    let skippedCount = 0;

    for (const secret of template.secrets) {
      const value = await vscode.window.showInputBox({
        prompt: secret.description,
        placeHolder: secret.example,
        password: !secret.key.startsWith('NEXT_PUBLIC_') && !secret.key.startsWith('VITE_'),
        title: `${secret.key} (${addedCount + 1}/${template.secrets.length})`,
      });

      if (value === undefined) {
        // User cancelled
        break;
      }

      if (value) {
        try {
          await cliService.setSecret(secret.key, value, environment, secret.description);
          addedCount++;
        } catch (error) {
          vscode.window.showErrorMessage(`Failed to add ${secret.key}: ${error}`);
          skippedCount++;
        }
      } else {
        skippedCount++;
      }
    }

    secretsTreeProvider.refresh();
    vscode.window.showInformationMessage(
      `✅ Template setup complete: ${addedCount} added, ${skippedCount} skipped`
    );
  });
}

/**
 * Bulk import from JSON/YAML
 */
export function registerBulkImportCommand(
  context: vscode.ExtensionContext,
  cliService: CLIService,
  projectService: ProjectService,
  secretsTreeProvider: SecretsTreeDataProvider
): vscode.Disposable {
  return vscode.commands.registerCommand('envault.bulkImport', async () => {
    const fileUri = await vscode.window.showOpenDialog({
      canSelectFiles: true,
      canSelectMany: false,
      filters: {
        'Config Files': ['json', 'yaml', 'yml', 'env'],
      },
      title: 'Select file to import',
    });

    if (!fileUri || fileUri.length === 0) {
      return;
    }

    const filePath = fileUri[0].fsPath;
    const fileName = filePath.split(/[\\/]/).pop() || '';
    const ext = fileName.split('.').pop()?.toLowerCase();

    const environment = projectService.currentEnvironment;

    try {
      if (ext === 'json') {
        const fs = require('fs');
        const content = fs.readFileSync(filePath, 'utf-8');
        const data = JSON.parse(content);

        let count = 0;
        for (const [key, value] of Object.entries(data)) {
          await cliService.setSecret(key, String(value), environment);
          count++;
        }

        secretsTreeProvider.refresh();
        vscode.window.showInformationMessage(`✅ Imported ${count} secrets from JSON`);
      } else if (ext === 'env') {
        // Use existing .env import
        vscode.commands.executeCommand('envault.importEnv', filePath);
      } else {
        vscode.window.showWarningMessage('Unsupported file format. Use .json or .env files.');
      }
    } catch (error) {
      vscode.window.showErrorMessage(`Import failed: ${error}`);
    }
  });
}

/**
 * Export to multiple formats
 */
export function registerExportFormattedCommand(
  context: vscode.ExtensionContext,
  cliService: CLIService,
  projectService: ProjectService
): vscode.Disposable {
  return vscode.commands.registerCommand('envault.exportFormatted', async () => {
    const format = await vscode.window.showQuickPick(
      [
        { label: '.env (Dotenv)', value: 'dotenv', description: 'Standard .env file format' },
        { label: 'JSON', value: 'json', description: 'JSON object format' },
        { label: 'YAML', value: 'yaml', description: 'YAML format' },
        { label: 'Docker Compose', value: 'docker', description: 'Docker compose environment section' },
        { label: 'Kubernetes Secret', value: 'k8s', description: 'Kubernetes Secret manifest (Base64)' },
        { label: 'TypeScript', value: 'ts', description: 'TypeScript type definitions' },
      ],
      {
        placeHolder: 'Select export format',
      }
    );

    if (!format) {
      return;
    }

    const environment = projectService.currentEnvironment;
    const secrets = await cliService.listSecrets(environment);

    let output = '';
    let fileExt = '';

    switch (format.value) {
      case 'dotenv':
        fileExt = 'env';
        for (const [key, secret] of Object.entries(secrets)) {
          if (secret.description) {
            output += `# ${secret.description}\n`;
          }
          output += `${key}=${secret.value}\n`;
        }
        break;

      case 'json':
        fileExt = 'json';
        const jsonObj: any = {};
        for (const [key, secret] of Object.entries(secrets)) {
          jsonObj[key] = secret.value;
        }
        output = JSON.stringify(jsonObj, null, 2);
        break;

      case 'yaml':
        fileExt = 'yaml';
        for (const [key, secret] of Object.entries(secrets)) {
          if (secret.description) {
            output += `# ${secret.description}\n`;
          }
          output += `${key}: "${secret.value}"\n`;
        }
        break;

      case 'docker':
        fileExt = 'yml';
        output = 'environment:\n';
        for (const [key, secret] of Object.entries(secrets)) {
          output += `  - ${key}=${secret.value}\n`;
        }
        break;

      case 'k8s':
        fileExt = 'yaml';
        output = `apiVersion: v1\nkind: Secret\nmetadata:\n  name: ${environment}-secrets\ntype: Opaque\ndata:\n`;
        for (const [key, secret] of Object.entries(secrets)) {
          const base64 = Buffer.from(secret.value).toString('base64');
          output += `  ${key}: ${base64}\n`;
        }
        break;

      case 'ts':
        fileExt = 'ts';
        output = 'declare global {\n  namespace NodeJS {\n    interface ProcessEnv {\n';
        for (const [key, secret] of Object.entries(secrets)) {
          const comment = secret.description ? `/** ${secret.description} */\n      ` : '';
          output += `      ${comment}${key}: string;\n`;
        }
        output += '    }\n  }\n}\n\nexport {};\n';
        break;
    }

    // Show in new document
    const doc = await vscode.workspace.openTextDocument({
      content: output,
      language: format.value === 'json' ? 'json' : format.value === 'ts' ? 'typescript' : 'plaintext',
    });
    await vscode.window.showTextDocument(doc);

    vscode.window.showInformationMessage(
      `✅ Exported ${Object.keys(secrets).length} secrets as ${format.label}`
    );
  });
}
