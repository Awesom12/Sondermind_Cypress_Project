describe('Sondermind e2e Testing',
    {
        retries: 2 //retries the test on failure
    },
    () => {
        before('intercepts', () => {
            // disable Cypress's default behavior of logging all XMLHttpRequests and fetches
            cy.intercept({ resourceType: /xhr|fetch/ }, { log: false })
            cy.intercept({
                method: 'POST',
                url: 'https://events.launchdarkly.com/events/bulk/*'
            }).as('menu')

            cy.intercept({
                method: 'POST',
                url: 'https://px.ads.linkedin.com/wa/'
            }).as('nextQuestion')

            cy.intercept({
                method: 'PATCH',
                url: 'https://api.sondermind.com/svcs/flows/matching-flow-base/*'
            }).as('flows')
        })

        it('Can find a Therapist', () => {
            //visit the url: https://www.sondermind.com/
            cy.visit(Cypress.env('sm_url'))
            cy.title().should('contain', 'Online or In-Person Therapy')

            //Click the menu
            cy.get('button.btn.pointer').click()

            //click the button 'Find a Therapist'
            cy.contains('a.btn', 'Find a Therapist').click({ force: true })

            //Remove the 'target' attribute from the button ''a.btn-primary', so that the new tab gets opened in the same tab
            cy.get('a.btn-primary').eq(0)
                .invoke('removeAttr', 'target')
                .click({ force: true })
                .then(() => {
                    cy.url().should('include', 'https://start.sondermind.com/')
                })

            //click on the radio button "I'm still exploring"
            cy.contains("I'm still exploring").find('input').check({ force: true })

            //click on the 'next' button
            cy.get('[data-test="next-submit-button"]').click()

            //wait using the intercept instead of explicit wait
            cy.wait('@nextQuestion')
                .its('response.statusCode')
                .should('eq', 204)
            cy.wait('@flows')
                .its('response.statusCode')
                .should('eq', 200)
            cy.wait('@menu')
                .its('response.statusCode')
                .should('eq', 202)
            cy.wait('@flows')
                .its('response.statusCode')
                .should('eq', 200)

            //SOMETIMES THE LINKS TO DIFFERENT RESOURCES PAGE DOESN'T GET OPENED AND HENCE USING THE FOLLOWING IF - ELSE
            // Followed: https://glebbahmutov.com/cypress-examples/recipes/conditional-testing.html#click-a-button-if-present
            // get the element but disable the built-in cy.contains assertions
            // by appending our own dummy .should() assertion
            cy.contains('div[data-test="flows-intake-step-host-container"]', 'We\'re here for you on your journey')
                .should((_) => { })
                .then(($hContent) => {
                    if ($hContent.length) {
                        cy.contains('[data-test="flows-intake-step-host-container"]', 'We\'re here for you on your journey')
                            .next()
                            .find('[data-test="next-submit-button"]')
                            .should('be.visible')
                            .click()

                        //Verify if all the links on the page are live
                        cy.get('a.card.sonder-external-link')
                            .each((link) => {
                                cy.request(link.prop('href'))
                                    .its('status')
                                    .should('eq', 200)
                            })

                        //click on the 'next' button
                        cy.contains('[data-test="flows-intake-step-host-container"]', 'Ready when you are.')
                            .next().find('[data-test="next-submit-button"]').click()
                        return
                    } else {
                        // there is no button
                        cy.log('there is no page that contains "We\'re here for you on your journey"')
                    }
                })

            //Type '80026' in the location field
            cy.contains('[data-test="form-field-label"]', 'Location')
                .next('[data-test="input-field"]').type('80026')

            //Click on 'Add location' icon
            cy.get('.mat-icon', { timeout: 11_000 })
                .contains('add_location').click()

            //down arrow not working without this wait here, above timeout is of no use
            //This could be because we are calling 'google api' which is an external api
            cy.wait(1000)

            //Using Keyboard keys click on 'down arrow' on 'Add location' icon
            cy.contains('.mat-icon', 'add_location', { timeout: 10000 })
                .type('{downArrow}{enter}')

            cy.wait(1000) //next button is not clicked without this wait here

            //click on the 'next' button
            cy.get(".next-from-location")
                .click()

            //Next question - "What brought you here today?" should be displayed
            cy.contains('h2', ' What brought you here today?')
                .should('exist')

        })
    })
