import * as fs from 'fs/promises';
import * as path from 'path';
import * as vscode from 'vscode';
import { GeneratedFiles } from './codeGenerator';

export class FileManager {
  private root: string;

  constructor() {
    this.root = path.join(vscode.workspace.workspaceFolders ? vscode.workspace.workspaceFolders[0].uri.fsPath : process.cwd(), 'cypress');
  }

  async saveGenerated(g: GeneratedFiles) {
    try {
      await this.ensureDirs();
      const e2eDir = path.join(this.root, 'e2e');
      const supportPO = path.join(this.root, 'support', 'pageObjects');
      const stepsDir = path.join(e2eDir, 'stepDefinitions');

      await fs.writeFile(path.join(e2eDir, 'login.cy.js'), g.testFile, 'utf8');
      await fs.writeFile(path.join(supportPO, 'LoginPage.js'), g.pageObject, 'utf8');
      await fs.writeFile(path.join(stepsDir, 'loginSteps.js'), g.stepDefinitions, 'utf8');
    } catch (err: any) {
      vscode.window.showErrorMessage('Failed to write files: ' + (err.message || String(err)));
      throw err;
    }
  }

  private async ensureDirs() {
    const dirs = [path.join(this.root, 'e2e'), path.join(this.root, 'support'), path.join(this.root, 'support', 'pageObjects'), path.join(this.root, 'e2e', 'stepDefinitions')];
    for (const d of dirs) {
      await fs.mkdir(d, { recursive: true });
    }
  }
}
