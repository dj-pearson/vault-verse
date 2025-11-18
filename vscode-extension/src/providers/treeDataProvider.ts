import * as vscode from 'vscode';
import { CLIService, Secret } from '../services/cliService';
import { ProjectService } from '../services/projectService';
import { detectSecretType, validateSecret } from '../utils/secretTypes';

export class SecretTreeItem extends vscode.TreeItem {
  constructor(
    public readonly key: string,
    public readonly value: string,
    public readonly environment: string,
    public readonly description?: string,
    public readonly collapsibleState: vscode.TreeItemCollapsibleState = vscode.TreeItemCollapsibleState.None,
    public readonly contextValue: string = 'secret'
  ) {
    super(key, collapsibleState);

    const config = vscode.workspace.getConfiguration('envault');
    const showValues = config.get<boolean>('showValuesInTree', false);
    const maskPattern = config.get<string>('maskPattern', '***');

    // Detect secret type and set appropriate icon
    const typeInfo = detectSecretType(key, value);
    this.iconPath = new vscode.ThemeIcon(
      typeInfo.icon,
      typeInfo.color ? new vscode.ThemeColor(typeInfo.color) : undefined
    );

    // Validate secret
    const validation = validateSecret(key, value);

    // Build tooltip with type info and warnings
    let tooltipText = `${key}\nType: ${typeInfo.description}`;
    if (this.description) {
      tooltipText += `\nDescription: ${this.description}`;
    }
    if (showValues) {
      tooltipText += `\nValue: ${this.maskValue(value, maskPattern)}`;
    }
    if (validation.warnings.length > 0) {
      tooltipText += '\n\n' + validation.warnings.join('\n');
    }

    this.tooltip = new vscode.MarkdownString(tooltipText);
    this.description = showValues ? this.maskValue(value, maskPattern) : typeInfo.description;

    // Add warning decoration for invalid secrets
    if (!validation.isValid && validation.severity === 'error') {
      this.iconPath = new vscode.ThemeIcon('warning', new vscode.ThemeColor('errorForeground'));
    }
  }

  private maskValue(value: string, maskPattern: string): string {
    if (value.length <= 4) {
      return maskPattern;
    }
    return value.substring(0, 4) + maskPattern;
  }
}

export class EnvironmentTreeItem extends vscode.TreeItem {
  constructor(
    public readonly name: string,
    public readonly count: number,
    public readonly isCurrent: boolean
  ) {
    super(name, vscode.TreeItemCollapsibleState.Expanded);

    this.description = `${count} secret${count !== 1 ? 's' : ''}`;
    this.tooltip = `Environment: ${name}\n${count} secrets`;
    this.iconPath = new vscode.ThemeIcon(isCurrent ? 'circle-filled' : 'circle-outline');
    this.contextValue = 'environment';
  }
}

export class SecretsTreeDataProvider implements vscode.TreeDataProvider<vscode.TreeItem> {
  private _onDidChangeTreeData = new vscode.EventEmitter<vscode.TreeItem | undefined | null | void>();
  readonly onDidChangeTreeData = this._onDidChangeTreeData.event;

  private cliService: CLIService;
  private projectService: ProjectService;
  private searchFilter: string = '';

  constructor(cliService: CLIService, projectService: ProjectService) {
    this.cliService = cliService;
    this.projectService = projectService;

    // Listen for environment changes
    this.projectService.onEnvironmentChanged(() => {
      this.refresh();
    });
  }

  refresh(): void {
    this._onDidChangeTreeData.fire();
  }

  setSearchFilter(filter: string): void {
    this.searchFilter = filter.toLowerCase();
    this.refresh();
  }

  clearSearchFilter(): void {
    this.searchFilter = '';
    this.refresh();
  }

  getTreeItem(element: vscode.TreeItem): vscode.TreeItem {
    return element;
  }

  async getChildren(element?: vscode.TreeItem): Promise<vscode.TreeItem[]> {
    const hasProject = await this.projectService.hasProject();

    if (!hasProject) {
      return [
        new vscode.TreeItem('No EnVault project found', vscode.TreeItemCollapsibleState.None)
      ];
    }

    // If no element, return environments
    if (!element) {
      try {
        const environments = await this.cliService.listEnvironments();
        const currentEnv = this.projectService.currentEnvironment;

        const items: EnvironmentTreeItem[] = [];

        for (const env of environments) {
          const secrets = await this.cliService.listSecrets(env);
          const count = Object.keys(secrets).length;
          items.push(new EnvironmentTreeItem(env, count, env === currentEnv));
        }

        return items;
      } catch (error) {
        vscode.window.showErrorMessage(`Failed to load environments: ${error}`);
        return [];
      }
    }

    // If element is an environment, return its secrets
    if (element instanceof EnvironmentTreeItem) {
      try {
        const secrets = await this.cliService.listSecrets(element.name);
        let entries = Object.entries(secrets);

        // Apply search filter
        if (this.searchFilter) {
          entries = entries.filter(([key, secret]) => {
            const keyMatch = key.toLowerCase().includes(this.searchFilter);
            const descMatch = secret.description?.toLowerCase().includes(this.searchFilter);
            return keyMatch || descMatch;
          });
        }

        if (entries.length === 0 && this.searchFilter) {
          const item = new vscode.TreeItem(
            `No secrets matching "${this.searchFilter}"`,
            vscode.TreeItemCollapsibleState.None
          );
          item.iconPath = new vscode.ThemeIcon('search');
          return [item];
        }

        if (entries.length === 0) {
          const item = new vscode.TreeItem('No secrets yet', vscode.TreeItemCollapsibleState.None);
          item.iconPath = new vscode.ThemeIcon('info');
          item.tooltip = 'Click the + button above to add your first secret';
          return [item];
        }

        // Sort alphabetically
        entries.sort(([a], [b]) => a.localeCompare(b));

        return entries.map(([key, secret]) => new SecretTreeItem(key, secret.value, element.name, secret.description));
      } catch (error) {
        vscode.window.showErrorMessage(`Failed to load secrets: ${error}`);
        return [];
      }
    }

    return [];
  }
}

export class EnvironmentsTreeDataProvider implements vscode.TreeDataProvider<vscode.TreeItem> {
  private _onDidChangeTreeData = new vscode.EventEmitter<vscode.TreeItem | undefined | null | void>();
  readonly onDidChangeTreeData = this._onDidChangeTreeData.event;

  private cliService: CLIService;
  private projectService: ProjectService;

  constructor(cliService: CLIService, projectService: ProjectService) {
    this.cliService = cliService;
    this.projectService = projectService;

    // Listen for environment changes
    this.projectService.onEnvironmentChanged(() => {
      this.refresh();
    });
  }

  refresh(): void {
    this._onDidChangeTreeData.fire();
  }

  getTreeItem(element: vscode.TreeItem): vscode.TreeItem {
    return element;
  }

  async getChildren(): Promise<vscode.TreeItem[]> {
    const hasProject = await this.projectService.hasProject();

    if (!hasProject) {
      return [
        new vscode.TreeItem('No EnVault project found', vscode.TreeItemCollapsibleState.None)
      ];
    }

    try {
      const environments = await this.cliService.listEnvironments();
      const currentEnv = this.projectService.currentEnvironment;

      return environments.map((env) => {
        const item = new vscode.TreeItem(env, vscode.TreeItemCollapsibleState.None);
        item.iconPath = new vscode.ThemeIcon(env === currentEnv ? 'circle-filled' : 'circle-outline');
        item.description = env === currentEnv ? '(current)' : '';
        item.contextValue = 'environment';
        item.command = {
          command: 'envault.switchEnvironment',
          title: 'Switch Environment',
          arguments: [env],
        };
        return item;
      });
    } catch (error) {
      vscode.window.showErrorMessage(`Failed to load environments: ${error}`);
      return [];
    }
  }
}
