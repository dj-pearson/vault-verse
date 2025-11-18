import * as vscode from 'vscode';
import { CLIService } from '../services/cliService';
import { ProjectService } from '../services/projectService';

export class EnvCompletionProvider implements vscode.CompletionItemProvider {
  private cliService: CLIService;
  private projectService: ProjectService;

  constructor(cliService: CLIService, projectService: ProjectService) {
    this.cliService = cliService;
    this.projectService = projectService;
  }

  async provideCompletionItems(
    document: vscode.TextDocument,
    position: vscode.Position,
    token: vscode.CancellationToken,
    context: vscode.CompletionContext
  ): Promise<vscode.CompletionItem[] | undefined> {
    const config = vscode.workspace.getConfiguration('envault');
    const enabled = config.get<boolean>('enableIntelliSense', true);

    if (!enabled) {
      return undefined;
    }

    // Check if we have an EnVault project
    const hasProject = await this.projectService.hasProject();
    if (!hasProject) {
      return undefined;
    }

    // Get the line text up to the cursor
    const linePrefix = document.lineAt(position).text.substring(0, position.character);

    // Check if we're in a process.env context
    // Matches patterns like: process.env., Deno.env.get(""), import.meta.env., etc.
    const patterns = [
      /process\.env\.$/, // Node.js: process.env.
      /process\.env\[['"]$/, // Node.js: process.env["
      /Deno\.env\.get\(['"]$/, // Deno: Deno.env.get("
      /import\.meta\.env\.$/, // Vite: import.meta.env.
      /process\.env\.get\(['"]$/, // Some Node libs: process.env.get("
    ];

    const isEnvContext = patterns.some((pattern) => pattern.test(linePrefix));

    if (!isEnvContext) {
      return undefined;
    }

    try {
      const currentEnv = this.projectService.currentEnvironment;
      const secrets = await this.cliService.listSecrets(currentEnv);

      const completionItems: vscode.CompletionItem[] = [];

      for (const [key, secret] of Object.entries(secrets)) {
        const item = new vscode.CompletionItem(key, vscode.CompletionItemKind.Constant);

        // Add masked value as detail
        const maskedValue = this.maskValue(secret.value);
        item.detail = `${maskedValue} (${currentEnv})`;

        // Add description if available
        if (secret.description) {
          item.documentation = new vscode.MarkdownString(
            `**${key}**\n\n${secret.description}\n\n---\n\n*Environment: ${currentEnv}*\n\n*Value: ${maskedValue}*`
          );
        } else {
          item.documentation = new vscode.MarkdownString(
            `**${key}**\n\n*Environment: ${currentEnv}*\n\n*Value: ${maskedValue}*`
          );
        }

        // Set sort priority
        item.sortText = key;

        // Add icon
        item.kind = vscode.CompletionItemKind.Constant;

        completionItems.push(item);
      }

      return completionItems;
    } catch (error) {
      console.error('Error providing completions:', error);
      return undefined;
    }
  }

  private maskValue(value: string): string {
    if (value.length <= 4) {
      return '***';
    }
    return value.substring(0, 4) + '***';
  }
}
