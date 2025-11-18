import * as vscode from 'vscode';
import { CLIService, Secret } from '../services/cliService';
import { ProjectService } from '../services/projectService';

export class SecretTreeItem extends vscode.TreeItem {
  constructor(
    public readonly key: string,
    public readonly value: string,
    public readonly environment: string,
    public readonly collapsibleState: vscode.TreeItemCollapsibleState,
    public readonly contextValue: string
  ) {
    super(key, collapsibleState);

    const config = vscode.workspace.getConfiguration('envault');
    const showValues = config.get<boolean>('showValuesInTree', false);
    const maskPattern = config.get<string>('maskPattern', '***');

    this.tooltip = `${key}${showValues ? ': ' + this.maskValue(value, maskPattern) : ''}`;
    this.description = showValues ? this.maskValue(value, maskPattern) : '';
    this.iconPath = new vscode.ThemeIcon('key');
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

        return Object.entries(secrets).map(
          ([key, secret]) =>
            new SecretTreeItem(key, secret.value, element.name, vscode.TreeItemCollapsibleState.None, 'secret')
        );
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
