describe('Migrating from Protractor to Cypress', () => {
    it('can test Webtables angular app', () => {
        let random = Math.floor(Math.random() * 1000)

        browser.get(
            'https://www.way2automation.com/angularjs-protractor/webtables/'
        )
        element(by.buttonText('Add User')).click()
        element(by.css('input[name=FirstName]')).sendKeys('Test' + random)
        element(by.css('input[name=LastName]')).sendKeys('User')
        element(by.css('input[name=UserName]')).sendKeys('TestUser')
        element(by.cssContainingText('label', 'Company AAA')).click()
        element
            .all(by.options('c.Value as c.Text for c in column.options'))
            .last()
            .click()
        element(by.css('input[name=Mobilephone]')).sendKeys('9876543210')
        element(by.cssContainingText('button', 'Save')).click()

        //Assertion
        expect(
            element
                .all(by.css('tr.smart-table-data-row'))
                .first()
                .all(by.css('td.smart-table-data-cell'))
                .get(0)
                .getText()
        ).toEqual(`Test${random}`)
    })
})
