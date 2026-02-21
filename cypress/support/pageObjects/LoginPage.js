class LoginPage {
  visit() { cy.visit('/login'); }
  enterUsername(name) { cy.get('#username').type(name); }
  enterPassword(pw) { cy.get('#password').type(pw); }
  submit() { cy.get('#login').click(); }
}

module.exports = LoginPage;
