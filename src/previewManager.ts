import * as vscode from 'vscode';
import { GeneratedFiles } from './codeGenerator';

export class PreviewManager {
  private panel: vscode.WebviewPanel | undefined;

  async showPreview(generated: GeneratedFiles): Promise<'save' | 'regenerate' | 'cancel' | undefined> {
    this.panel = vscode.window.createWebviewPanel('cypressCopilotPreview', 'Cypress Copilot Preview', vscode.ViewColumn.One, { enableScripts: true });
    this.panel.webview.html = this.getHtml(generated);

    return await new Promise((resolve) => {
      if (!this.panel) return resolve(undefined);
      const dispos = this.panel.webview.onDidReceiveMessage(async (msg) => {
        if (msg.command === 'save') {
          resolve('save');
          dispos.dispose();
          this.panel?.dispose();
        } else if (msg.command === 'regenerate') {
          resolve('regenerate');
          dispos.dispose();
        } else if (msg.command === 'cancel') {
          resolve('cancel');
          dispos.dispose();
          this.panel?.dispose();
        }
      });
    });
  }

  async replacePreview(generated: GeneratedFiles) {
    if (!this.panel) {
      this.panel = vscode.window.createWebviewPanel('cypressCopilotPreview', 'Cypress Copilot Preview', vscode.ViewColumn.One, { enableScripts: true });
    }
    this.panel.webview.html = this.getHtml(generated);
  }

  private getHtml(g: GeneratedFiles) {
    const nonce = new Date().getTime();
    return `<!DOCTYPE html>
<html>
<head>
  <meta http-equiv="Content-Security-Policy" content="default-src 'none'; script-src 'nonce-${nonce}'; style-src 'unsafe-inline';">
  <style>
    body { font-family: sans-serif; padding: 10px }
    .tabs { display:flex; gap:8px; margin-bottom:8px }
    .tab { padding:6px 12px; background:#eee; cursor:pointer }
    .tab.active { background:#ddd; font-weight:bold }
    pre { background:#1e1e1e; color:#ddd; padding:10px; white-space:pre-wrap; max-height:60vh; overflow:auto }
    .controls { margin-top:8px }
    button { margin-right:8px }
  </style>
</head>
<body>
  <div class="tabs">
    <div class="tab active" data-tab="test">Test File</div>
    <div class="tab" data-tab="page">Page Object</div>
    <div class="tab" data-tab="steps">Step Definitions</div>
  </div>
  <div id="content">
    <pre id="test">${escapeHtml(g.testFile)}</pre>
    <pre id="page" style="display:none">${escapeHtml(g.pageObject)}</pre>
    <pre id="steps" style="display:none">${escapeHtml(g.stepDefinitions)}</pre>
  </div>
  <div class="controls">
    <button id="save">Save</button>
    <button id="regenerate">Regenerate</button>
    <button id="cancel">Cancel</button>
  </div>
  <script nonce="${nonce}">
    const vscode = acquireVsCodeApi();
    document.querySelectorAll('.tab').forEach(t => t.addEventListener('click', () => {
      document.querySelectorAll('.tab').forEach(x => x.classList.remove('active'));
      t.classList.add('active');
      const tab = t.getAttribute('data-tab');
      ['test','page','steps'].forEach(k => document.getElementById(k).style.display = k === (tab==='test'? 'test' : tab==='page'? 'page' : 'steps') ? 'block' : 'none');
    }));
    document.getElementById('save').addEventListener('click', () => vscode.postMessage({ command: 'save' }));
    document.getElementById('regenerate').addEventListener('click', () => vscode.postMessage({ command: 'regenerate' }));
    document.getElementById('cancel').addEventListener('click', () => vscode.postMessage({ command: 'cancel' }));
  </script>
</body>
</html>`;
  }
}

function escapeHtml(s: string) {
  return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}
