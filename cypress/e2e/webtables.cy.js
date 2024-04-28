//The code below is migrated to cypress on https://migrator.cypress.io/


describe('Migrating from Protractor to Cypress', () => {
    it('can test Webtables angular app', () => {
        let random = Math.floor(Math.random() * 1000)

        cy.visit(Cypress.env('test_url'))
        cy.contains('button', 'Add User').click()
        cy.get('input[name=FirstName]').type('Test' + random)
        cy.get('input[name=LastName]').type('User')
        cy.get('input[name=UserName]').type('TestUser')
        cy.contains('label', 'Company AAA').click()
        //Used the cypress select command - this line of code is not migrated
        cy.get('select[name="RoleId"]').select('Admin')
        cy.get('input[name=Mobilephone]').type('9876543210')
        cy.contains('button', 'Save').click()

        //Assertion
        cy.get('tr.smart-table-data-row')
            .first()
            .find('td.smart-table-data-cell')
            .eq(0)
            .should('eq', `Test${random}`)

    })
})
