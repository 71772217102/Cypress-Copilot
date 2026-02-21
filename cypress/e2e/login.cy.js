describe('Login Test', () => {
  it('Valid Login', () => {
    cy.visit('/login')
    cy.get('#username').type('test')
    cy.get('#password').type('test')
    cy.get('#login').click()
    cy.url().should('include', '/dashboard')
  })
})
