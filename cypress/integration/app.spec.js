describe('Instructions', () => {
  it('should open read more', () => {
    cy.visit('/');

    cy.get('button[]').click();

    cy.url().should('include', '/about');

    cy.get('h1').contains('About Page');
  });
});
