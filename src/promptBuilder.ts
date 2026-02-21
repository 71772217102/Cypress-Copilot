/**
 * Build a few-shot, chain-of-thought style prompt for GPT-4o to convert
 * a BDD scenario into Cypress test + Page Object + Step Definitions.
 */
export function buildPrompt(scenario: string): string {
  const exampleScenario = `Given user is on login page\nWhen user enters username and password\nThen user should see dashboard`;

  const exampleOutput = `{
  "testFile": "describe('Login Test', () => {\n  it('Valid Login', () => {\n    cy.visit('/login')\n    cy.get('#username').type('test')\n    cy.get('#password').type('test')\n    cy.get('#login').click()\n    cy.url().should('include', '/dashboard')\n  })\n})",
  "pageObject": "class LoginPage {\n  visit() { cy.visit('/login') }\n  enterUsername(name) { cy.get('#username').type(name) }\n  enterPassword(pw) { cy.get('#password').type(pw) }\n  submit() { cy.get('#login').click() }\n}\nmodule.exports = LoginPage;",
  "stepDefinitions": "const { Given, When, Then } = require('@badeball/cypress-cucumber-preprocessor');\nconst LoginPage = require('../../support/pageObjects/LoginPage');\nconst page = new LoginPage();\nGiven('user is on login page', () => { page.visit(); });\nWhen('user enters username and password', () => { page.enterUsername('test'); page.enterPassword('test'); page.submit(); });\nThen('user should see dashboard', () => { cy.url().should('include', '/dashboard'); });"
}`;

  const instruction = `You are an expert test automation engineer. Convert the following BDD scenario into three parts (JSON): testFile, pageObject, stepDefinitions. Provide valid JavaScript code for Cypress 12+ and use Page Object Model where requested. Return only a JSON object with three string fields. Avoid prose. Use chain-of-thought style reasoning internally but return the JSON only.`;

  return `${instruction}\n\nEXAMPLE_SCENARIO:\n${exampleScenario}\n\nEXAMPLE_OUTPUT:\n${exampleOutput}\n\nUSER_SCENARIO:\n${scenario}\n\nProvide the JSON response exactly.`;
}
