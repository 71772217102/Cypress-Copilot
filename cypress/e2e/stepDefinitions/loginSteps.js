const { Given, When, Then } = require('@badeball/cypress-cucumber-preprocessor');
const LoginPage = require('../../support/pageObjects/LoginPage');
const page = new LoginPage();

Given('user is on login page', () => { page.visit(); });
When('user enters username and password', () => { page.enterUsername('test'); page.enterPassword('test'); page.submit(); });
Then('user should see dashboard', () => { cy.url().should('include', '/dashboard'); });
