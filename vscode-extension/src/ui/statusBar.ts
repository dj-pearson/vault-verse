import * as vscode from 'vscode';
import { ProjectService } from '../services/projectService';

export class StatusBarManager {
  private statusBarItem: vscode.StatusBarItem;
  private projectService: ProjectService;

  constructor(projectService: ProjectService) {
    this.projectService = projectService;
    this.statusBarItem = vscode.window.createStatusBarItem(
      vscode.StatusBarAlignment.Left,
      100
    );
    this.statusBarItem.command = 'envault.switchEnvironment';

    // Listen for environment changes
    this.projectService.onEnvironmentChanged(() => {
      this.update();
    });

    this.update();
    this.statusBarItem.show();
  }

  /**
   * Update the status bar display
   */
  async update(): Promise<void> {
    const hasProject = await this.projectService.hasProject();

    if (!hasProject) {
      this.statusBarItem.text = '$(lock) EnVault: No Project';
      this.statusBarItem.tooltip = 'Click to initialize EnVault project';
      this.statusBarItem.command = 'envault.init';
      this.statusBarItem.backgroundColor = undefined;
      return;
    }

    const currentEnv = this.projectService.currentEnvironment;
    const projectInfo = await this.projectService.getProjectInfo();

    // Different colors/icons for different environments
    let icon = '$(database)';
    let color: vscode.ThemeColor | undefined;

    switch (currentEnv.toLowerCase()) {
      case 'production':
      case 'prod':
        icon = '$(flame)';
        color = new vscode.ThemeColor('statusBarItem.warningBackground');
        break;
      case 'staging':
      case 'stage':
        icon = '$(beaker)';
        break;
      case 'development':
      case 'dev':
        icon = '$(code)';
        break;
    }

    this.statusBarItem.text = `${icon} ${currentEnv}`;
    this.statusBarItem.tooltip = `EnVault Environment: ${currentEnv}\nProject: ${projectInfo?.projectName || 'Unknown'}\n\nClick to switch environment`;
    this.statusBarItem.command = 'envault.switchEnvironment';
    this.statusBarItem.backgroundColor = color;
  }

  /**
   * Show a sync indicator
   */
  showSyncing(): void {
    this.statusBarItem.text = '$(sync~spin) Syncing...';
    this.statusBarItem.tooltip = 'Syncing secrets...';
  }

  /**
   * Show a sync success indicator briefly
   */
  showSyncSuccess(): void {
    const originalText = this.statusBarItem.text;
    const originalTooltip = this.statusBarItem.tooltip;

    this.statusBarItem.text = '$(check) Synced';
    this.statusBarItem.tooltip = 'Sync completed successfully';

    setTimeout(() => {
      this.statusBarItem.text = originalText;
      this.statusBarItem.tooltip = originalTooltip;
    }, 2000);
  }

  /**
   * Show a sync error indicator
   */
  showSyncError(error: string): void {
    const originalText = this.statusBarItem.text;
    const originalTooltip = this.statusBarItem.tooltip;

    this.statusBarItem.text = '$(error) Sync Failed';
    this.statusBarItem.tooltip = `Sync failed: ${error}`;
    this.statusBarItem.backgroundColor = new vscode.ThemeColor('statusBarItem.errorBackground');

    setTimeout(() => {
      this.statusBarItem.text = originalText;
      this.statusBarItem.tooltip = originalTooltip;
      this.statusBarItem.backgroundColor = undefined;
    }, 3000);
  }

  dispose(): void {
    this.statusBarItem.dispose();
  }
}
