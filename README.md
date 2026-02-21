# Cypress Copilot

An AI-powered VS Code extension that converts BDD scenarios into Cypress test automation code using OpenAI GPT-4o.

Installation

- Clone into your workspace.
- Run:

```bash
cd cypress-copilot
npm install
npm run compile
```

Running in VS Code

- Press `Ctrl+Shift+P` and run `Cypress Copilot: Generate Test`.
- Enter a BDD scenario (Given/When/Then). The extension will call OpenAI and show a preview panel.
- Click `Save` to persist files under the `cypress/` folder.

Requirements

- Node.js 18+
- An OpenAI API key set in `.env` as `OPENAI_API_KEY`

Architecture

- `src/extension.ts` — VS Code activation and command wiring.
- `src/promptBuilder.ts` — Creates a few-shot, chain-of-thought prompt.
- `src/openaiService.ts` — Calls OpenAI GPT-4o.
- `src/codeGenerator.ts` — Parses and validates the AI response.
- `src/previewManager.ts` — Webview UI for preview/save/regenerate.
- `src/fileManager.ts` — Writes Cypress files to disk.

How to use

1. Ensure `.env` contains your `OPENAI_API_KEY`.
2. Compile the extension and run it in the Extension Development Host.
3. After saving generated files, run `npx cypress open` to run tests.
