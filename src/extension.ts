import * as vscode from 'vscode';
import { buildPrompt } from './promptBuilder';
import { OpenAIService } from './openaiService';
import { generateFromResponse } from './codeGenerator';
import { PreviewManager } from './previewManager';
import { FileManager } from './fileManager';

const openai = new OpenAIService();
const preview = new PreviewManager();
const files = new FileManager();

export async function activate(context: vscode.ExtensionContext) {
  const disposable = vscode.commands.registerCommand('cypress-copilot.generateTest', async () => {
    try {
      const scenario = await vscode.window.showInputBox({
        prompt: 'Enter a BDD scenario (Given / When / Then)',
        placeHolder: 'Given user is on login page\nWhen user enters username and password\nThen user should see dashboard'
      });

      if (!scenario) {
        vscode.window.showInformationMessage('No scenario provided.');
        return;
      }

      const prompt = buildPrompt(scenario);
      await vscode.window.withProgress({ location: vscode.ProgressLocation.Notification, title: 'Generating Cypress files (AI)...', cancellable: false }, async () => {
        const aiResponse = await openai.generate(prompt);
        const generated = await generateFromResponse(aiResponse);

        const choice = await preview.showPreview(generated);

        if (choice === 'save') {
          await files.saveGenerated(generated);
          vscode.window.showInformationMessage('Cypress files saved to cypress/');
        } else if (choice === 'regenerate') {
          // simple regenerate flow
          const aiResponse2 = await openai.generate(prompt + '\n\nRegenerate using same instructions.');
          const generated2 = await generateFromResponse(aiResponse2);
          await preview.replacePreview(generated2);
        }
      });
    } catch (err: any) {
      vscode.window.showErrorMessage('Error: ' + (err.message || String(err)));
    }
  });

  context.subscriptions.push(disposable);
}

export function deactivate() {}
