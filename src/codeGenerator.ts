import * as vscode from 'vscode';

export interface GeneratedFiles {
  testFile: string;
  pageObject: string;
  stepDefinitions: string;
}

function tryParseJsonCandidate(raw: string) {
  // Try to parse as JSON directly
  try {
    const obj = JSON.parse(raw);
    if (obj.testFile && obj.pageObject && obj.stepDefinitions) return obj;
  } catch {}

  // Try to extract JSON block from markdown code fence
  const jsonMatch = raw.match(/```json\s*([\s\S]*?)```/i);
  if (jsonMatch) {
    try {
      const obj = JSON.parse(jsonMatch[1]);
      if (obj.testFile && obj.pageObject && obj.stepDefinitions) return obj;
    } catch {}
  }

  // Try to extract JS code blocks and map to fields by markers
  // Fallback: attempt to find sections labeled "testFile", "pageObject", "stepDefinitions"
  const sections: any = {};
  const labels = ['testFile', 'pageObject', 'stepDefinitions'];
  labels.forEach((label) => {
    const re = new RegExp(label + ':?\s*([\s\S]*?)(?=\n\w+:|$)', 'i');
    const m = raw.match(re);
    if (m) sections[label] = m[1].trim();
  });

  if (sections.testFile && sections.pageObject && sections.stepDefinitions) return sections;
  return null;
}

export async function generateFromResponse(aiResponse: { raw: string }): Promise<GeneratedFiles> {
  const raw = aiResponse.raw;
  const parsed = tryParseJsonCandidate(raw);
  if (!parsed) {
    vscode.window.showWarningMessage('Could not parse AI response as structured JSON; attempting best-effort extraction.');
  }

  const result = {
    testFile: (parsed && parsed.testFile) || extractCodeBlock(raw, 'testFile') || defaultTestFile(),
    pageObject: (parsed && parsed.pageObject) || extractCodeBlock(raw, 'pageObject') || defaultPageObject(),
    stepDefinitions: (parsed && parsed.stepDefinitions) || extractCodeBlock(raw, 'stepDefinitions') || defaultStepDefinitions()
  };

  // Basic validation — ensure strings contain 'cy.' or require keywords
  if (!result.testFile.includes('cy.')) {
    // warn but allow
    vscode.window.showWarningMessage('Generated test file may be invalid (no cy. found).');
  }

  return result;
}

function extractCodeBlock(raw: string, key: string) {
  const re = new RegExp('```(?:js|javascript)?\\s*([\\s\\S]*?)```', 'gi');
  let m;
  while ((m = re.exec(raw)) !== null) {
    const block = m[1];
    if (block.toLowerCase().includes(key.toLowerCase()) || guessContainsKey(block, key)) return block.trim();
  }
  return null;
}

function guessContainsKey(block: string, key: string) {
  if (key === 'testFile') return block.includes('describe(') || block.includes('it(') || block.includes('cy.');
  if (key === 'pageObject') return block.includes('class ') || block.includes('module.exports');
  if (key === 'stepDefinitions') return block.includes('Given(') || block.includes("cucumber") || block.includes('Given, When, Then');
  return false;
}

function defaultTestFile() {
  return "describe('Generated Test', () => {\n  it('should run', () => {\n    // TODO: implement\n  })\n})";
}

function defaultPageObject() {
  return "class Page {\n  visit() { }\n}\nmodule.exports = Page;";
}

function defaultStepDefinitions() {
  return "// Step definitions not generated correctly";
}
