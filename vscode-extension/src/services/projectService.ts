import * as vscode from 'vscode';
import { CLIService } from './cliService';

export class ProjectService {
  private cliService: CLIService;
  private _currentEnvironment: string = 'development';
  private _onEnvironmentChanged = new vscode.EventEmitter<string>();
  public readonly onEnvironmentChanged = this._onEnvironmentChanged.event;

  constructor(cliService: CLIService) {
    this.cliService = cliService;
    this.loadCurrentEnvironment();
  }

  /**
   * Get the current active environment
   */
  get currentEnvironment(): string {
    return this._currentEnvironment;
  }

  /**
   * Set the current active environment
   */
  async setCurrentEnvironment(environment: string): Promise<void> {
    this._currentEnvironment = environment;
    await this.saveCurrentEnvironment();
    this._onEnvironmentChanged.fire(environment);
  }

  /**
   * Load the current environment from workspace state
   */
  private async loadCurrentEnvironment(): Promise<void> {
    const workspaceState = vscode.workspace.getConfiguration('envault');
    this._currentEnvironment = workspaceState.get<string>('defaultEnvironment') || 'development';
  }

  /**
   * Save the current environment to workspace state
   */
  private async saveCurrentEnvironment(): Promise<void> {
    // Store in workspace state for session persistence
    const workspaceState = vscode.workspace.getConfiguration('envault');
    await workspaceState.update('defaultEnvironment', this._currentEnvironment, vscode.ConfigurationTarget.Workspace);
  }

  /**
   * Check if the workspace has an EnVault project
   */
  async hasProject(): Promise<boolean> {
    return await this.cliService.hasProject();
  }

  /**
   * Get project information
   */
  async getProjectInfo(): Promise<{ projectId: string; projectName: string } | null> {
    return await this.cliService.getProjectInfo();
  }

  /**
   * List all available environments
   */
  async getEnvironments(): Promise<string[]> {
    return await this.cliService.listEnvironments();
  }

  /**
   * Create a new environment
   */
  async createEnvironment(name: string): Promise<void> {
    await this.cliService.createEnvironment(name);
  }

  /**
   * Delete an environment
   */
  async deleteEnvironment(name: string): Promise<void> {
    await this.cliService.deleteEnvironment(name);
  }

  /**
   * Watch for .envault file changes
   */
  watchProject(callback: () => void): vscode.Disposable {
    const workspaceRoot = vscode.workspace.workspaceFolders?.[0]?.uri.fsPath;
    if (!workspaceRoot) {
      return { dispose: () => {} };
    }

    const watcher = vscode.workspace.createFileSystemWatcher(
      new vscode.RelativePattern(workspaceRoot, '.envault')
    );

    watcher.onDidChange(callback);
    watcher.onDidCreate(callback);
    watcher.onDidDelete(callback);

    return watcher;
  }

  dispose(): void {
    this._onEnvironmentChanged.dispose();
  }
}
