import * as vscode from 'vscode';
import { CLIService } from '../services/cliService';
import { ProjectService } from '../services/projectService';

export class EnvHoverProvider implements vscode.HoverProvider {
  private cliService: CLIService;
  private projectService: ProjectService;

  constructor(cliService: CLIService, projectService: ProjectService) {
    this.cliService = cliService;
    this.projectService = projectService;
  }

  async provideHover(
    document: vscode.TextDocument,
    position: vscode.Position,
    token: vscode.CancellationToken
  ): Promise<vscode.Hover | undefined> {
    const config = vscode.workspace.getConfiguration('envault');
    const enabled = config.get<boolean>('enableHover', true);

    if (!enabled) {
      return undefined;
    }

    // Check if we have an EnVault project
    const hasProject = await this.projectService.hasProject();
    if (!hasProject) {
      return undefined;
    }

    // Get the word at the cursor position
    const wordRange = document.getWordRangeAtPosition(position);
    if (!wordRange) {
      return undefined;
    }

    const word = document.getText(wordRange);

    // Check if this looks like an environment variable key
    // Must be UPPERCASE_WITH_UNDERSCORES format
    if (!/^[A-Z_][A-Z0-9_]*$/.test(word)) {
      return undefined;
    }

    // Get the line to check context
    const line = document.lineAt(position.line).text;

    // Check if this is in an environment variable context
    const envContextPatterns = [
      /process\.env\./, // Node.js: process.env.VAR
      /process\.env\[['"]/, // Node.js: process.env["VAR"]
      /Deno\.env\.get\(['"]/, // Deno: Deno.env.get("VAR")
      /import\.meta\.env\./, // Vite: import.meta.env.VAR
      /process\.env\.get\(['"]/, // Some Node libs
      /\benv\./, // Generic env.VAR
    ];

    const isEnvContext = envContextPatterns.some((pattern) => pattern.test(line));

    if (!isEnvContext) {
      return undefined;
    }

    try {
      const currentEnv = this.projectService.currentEnvironment;

      // Try to get the secret value
      const value = await this.cliService.getSecret(word, currentEnv);

      if (!value) {
        return undefined;
      }

      // Mask the value
      const maskedValue = this.maskValue(value);

      // Create hover content
      const markdown = new vscode.MarkdownString();
      markdown.isTrusted = true;
      markdown.supportHtml = true;

      markdown.appendMarkdown(`### 🔐 ${word}\n\n`);
      markdown.appendMarkdown(`**Environment:** ${currentEnv}\n\n`);
      markdown.appendMarkdown(`**Value:** \`${maskedValue}\`\n\n`);
      markdown.appendMarkdown(`---\n\n`);

      // Add action buttons
      markdown.appendMarkdown(
        `[$(copy) Copy Value](command:envault.copySecretValue?${encodeURIComponent(JSON.stringify({ key: word, env: currentEnv }))} "Copy to clipboard") | `
      );
      markdown.appendMarkdown(
        `[$(edit) Edit](command:envault.editSecret?${encodeURIComponent(JSON.stringify({ key: word, environment: currentEnv }))} "Edit secret") | `
      );
      markdown.appendMarkdown(
        `[$(history) History](command:envault.viewHistory?${encodeURIComponent(JSON.stringify({ key: word, environment: currentEnv }))} "View history")`
      );

      return new vscode.Hover(markdown, wordRange);
    } catch (error) {
      // Secret doesn't exist in EnVault
      // Offer to create it
      const markdown = new vscode.MarkdownString();
      markdown.isTrusted = true;

      markdown.appendMarkdown(`### ⚠️ ${word}\n\n`);
      markdown.appendMarkdown(`This environment variable is not defined in EnVault.\n\n`);
      markdown.appendMarkdown(
        `[$(add) Add Secret](command:envault.addSecretWithKey?${encodeURIComponent(JSON.stringify({ key: word }))} "Add this secret to EnVault")`
      );

      return new vscode.Hover(markdown, wordRange);
    }
  }

  private maskValue(value: string): string {
    const config = vscode.workspace.getConfiguration('envault');
    const maskPattern = config.get<string>('maskPattern', '***');

    if (value.length <= 4) {
      return maskPattern;
    }

    // Show first 4 characters, mask the rest
    return value.substring(0, 4) + maskPattern;
  }
}
