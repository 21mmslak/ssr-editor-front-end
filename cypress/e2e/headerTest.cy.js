/// <reference types="cypress" />

describe('Header', () => {
  beforeEach(() => {
    cy.visit('http://localhost:3000/')
  })

  it('displays the header with logo and search field', () => {
    cy.get('header').should('exist')
    cy.get('header img[alt="Logo"]').should('be.visible')
    cy.get('header input[type="text"]')
      .should('have.attr', 'placeholder', 'Sök, en dag kanske det funkar...')
  })
})