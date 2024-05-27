import { faker } from '@faker-js/faker'

describe('Sondermind e2e Testing', () => {
    before('intercepts', () => {
        // disable Cypress's default behavior of logging all XMLHttpRequests and fetches in the command log
        cy.intercept({ resourceType: /xhr|fetch/ }, { log: false })

        cy.intercept('POST', 'https://events.launchdarkly.com/events/bulk/*').as('menu')
        cy.intercept('POST', 'https://px.ads.linkedin.com/wa/').as('nextQuestion')
        cy.intercept('PATCH', 'https://api.sondermind.com/svcs/flows/matching-flow-base/*').as('flows')
    })

    it('Can find a Therapist', () => {
        //Getting the url from cypress.env.json
        cy.section('Open Sondermind\'s website')
        cy.step('visit the url: https://www.sondermind.com/')
        cy.visit(Cypress.env('sm_url'))
        cy.title()
            .should('contain', 'Online or In-Person Therapy')

        cy.step('Click on the menu button')
        cy.get('button.btn.pointer').click()

        cy.step("Click on the button - 'Find a Therapist'")
        cy.contains('a.btn', 'Find a Therapist').click({ force: true })

        cy.step("Remove the 'target' attribute from the button ''a.btn-primary', so that the new tab gets opened in the current tab")
        cy.get('a.btn-primary').eq(0)
            .invoke('removeAttr', 'target')
            .click({ force: true })

        cy.step("Another tab gets opened with a different url, hence assert the url")
        cy.url()
            .should('include', 'https://start.sondermind.com/')

        cy.step("The spinning icon should not exist to proceed to the questionnnaire")
        cy.get('.flow-spinner-container')
            .should('not.exist')

        cy.section("The questionnaire to 'Find a Therapist' starts")
        //click on the radio button "I'm still exploring"
        cy.step("click on the radio button - I'm still exploring of the question 'Which best describes you?'")
        cy.contains('label.mat-radio-label', "I'm still exploring", { timeout: 30_000 })
            .should('be.visible')
            .click()

        cy.step("click on the Next button")
        cy.clickNextBtn() //This is a custom command

        //wait using the intercept instead of explicit wait
        //cy.wait(['@flows', '@nextQuestion', '@menu', '@flows'])

        //Sometimes waiting for intercept is not enough hence adding the wait below
        cy.wait(1000)

        //SOMETIMES THE LINKS TO DIFFERENT RESOURCES PAGE DOESN'T GET OPENED AND HENCE USING THE FOLLOWING IF - ELSE
        // Followed: https://glebbahmutov.com/cypress-examples/recipes/conditional-testing.html#click-a-button-if-present
        // get the element but disable the built-in cy.contains assertions
        // by appending dummy .should() assertion

        cy.step("Check if the query We're here for you on your journey opens")
        //****cy.getDataTest is a custom command****
        cy.getDataTest("We're here for you on your journey", { timeout: 30_000 })
            .should((_) => { })
            .then(($hContent) => {
                if ($hContent.length) {
                    cy.getDataTest("We're here for you on your journey")
                        .scrollIntoView({ duration: 500 })
                        .should('be.visible')
                        .as('journey')

                    cy.section("If the query We're here for you on your journey gets visible")
                    cy.step("Verify if all the links on the query are live")
                    cy.get('a.card.sonder-external-link')
                        .each((link) => {
                            cy.request(link.prop('href'))
                                .its('status')
                                .should('eq', 200)
                        })

                    cy.step("click on the Next button")
                    //****cy.getDataTest is a custom command****
                    cy.getDataTest("We're here for you on your journey")
                        .next()
                        .clickNextBtn()

                    cy.section("The query titled - Curious to see available therapists? containing 'Ready when you are.' should be displayed")
                    cy.getDataTest('Ready when you are.')
                        .should('be.visible')
                        .as('Ready')

                    cy.step("click on the Next button")
                    cy.get('@Ready')
                        .next()
                        .clickNextBtn()

                    return
                } else {
                    cy.step("The query titled - 'We\'re here for you on your journey' is NOT displayed")
                }
            })
        cy.section("The query titled - 'Where are you located?' should be displayed")
        cy.contains('h2', 'Where are you located?')
            .should('be.visible')

        cy.step("Enter '80026' in the location field")
        cy.contains('[data-test="form-field-label"]', 'Location')
            .next('[data-test="input-field"]')
            .type('80026')

        cy.step("Click on 'Add location' icon")
        cy.contains('.mat-icon', 'add_location')
            .as('locationIcon')
            .click()

        //'down arrow' is not working without this wait here, timeout in the command is of no use
        //This could be because we are calling 'google api' which is an external api
        cy.wait(500)

        cy.step(" Using Keyboard keys click on 'down arrow' and select the correct location")
        cy.get('@locationIcon')
            .type('{downArrow}{enter}')

        cy.wait(500) //next button is not clicked without this wait here

        cy.step("click on the Next button")
        //****cy.getDataTest is a custom command****       
        cy.getDataTest('Location')
            .next()
            .clickNextBtn()

        cy.section("The query titled - 'What brought you here today?' should be displayed")
        cy.contains('h2', ' What brought you here today?')
            .should('exist')

        cy.step("click on the radio button - I'm feeling down or depressed")
        cy.contains('label.mat-radio-label', "I'm feeling down or depressed")
            .click()

        cy.step("click on the Next button")
        cy.getDataTest("I'm feeling down or depressed")
            .next()
            .clickNextBtn()

        cy.section("The query titled - 'Are you open to video sessions?' should be displayed")
        cy.contains('h2', ' Are you open to video sessions?')
            .should('exist')

        cy.step("click on the radio button - Yes")
        cy.contains('label.mat-radio-label', 'Yes')
            .click()

        cy.step("click on the Next button")
        //****cy.getDataTest is a custom command****        
        cy.getDataTest('Yes')
            .next()
            .clickNextBtn()

        //Adding this wait below as the test fails at the question: When are you available for sessions? fails without wait
        cy.wait(500)

        //SOMETIMES THE USER'S AVAILABILITY TO SESSIONS PAGE DOESN'T GET OPENED AND HENCE USING THE FOLLOWING IF - ELSE
        cy.contains('h2[data-test="hero-header-text"]', 'When are you available for sessions?', { timeout: 30_000 })
            .should((_) => { })
            .then(($hContent) => {
                if ($hContent.length) {
                    cy.section("If the query titled - 'When are you available for sessions?' is displayed")
                    cy.contains('[data-test="hero-header-text"]', 'When are you available for sessions?')
                        .should('be.visible')

                    cy.step("click on the checkbox - Daytime (9am-5pm)")
                    cy.contains('label.mat-checkbox-layout', 'Daytime (9am-5pm)')
                        .click()

                    cy.step("click on the Next button")
                    cy.getDataTest('Weekdays', 'Weekends')
                        .next()
                        .clickNextBtn()

                    return
                } else {
                    // there is no button
                    cy.step("The query titled - 'When are you available for sessions?' is NOT displayed")
                }
            })

        cy.section("The query titled - 'Would you prefer a therapist of a certain gender?' should be displayed")
        cy.contains('h2', 'Would you prefer a therapist of a certain gender?')
            .should('exist')

        cy.step("click on the radio button - 'Woman'")
        cy.contains("Woman").find('.mat-radio-inner-circle').click()

        cy.step("click on the Next button")
        cy.clickNextBtn()

        cy.section("The query titled - 'Are there any other preferences you'd like to share?' should be displayed")
        cy.contains('h2', "Are there any other preferences you'd like to share?")
            .should('be.visible')

        cy.step("click on the radio button - Yes")
        cy.contains("Yes")
            .find('.mat-radio-inner-circle')
            .click()

        //Enter long text and avoid delay while entering
        cy.get('textarea[name=reasonDetailText]')
            .type('This might include race, ethnicity, sexuality, or another identity that is important to you. ' +
                "We'll do our best to meet as many of your preferences as possible.", { delay: 0 })

        cy.step("click on the Next button")
        cy.clickNextBtn()

        cy.section("The query titled - 'How will you pay for therapy?' should be displayed")
        cy.contains('h2', 'How will you pay for therapy?')
            .should('be.visible')

        cy.step("click on the radio button - Health insurance")
        cy.contains("Health insurance").find('.mat-radio-inner-circle').click()

        cy.step("click on the Next button")
        cy.clickNextBtn()

        cy.section("The query titled - 'Select your insurance company?' should be displayed")
        cy.contains('h2', 'Select your insurance company')
            .should('be.visible')

        cy.step("click on drop down to select the Insurance company")
        cy.contains('button.iris-dropdown', 'Insurance company')
            .click()

        cy.step("click on the dropdown list item 'Lucent Health - Summit County Government Plan'")
        cy.contains('div.iris-dropdown-list-item', 'Lucent Health - Summit County Government Plan')
            .click()

        cy.step("click any where on the page so that the dropdown list item gets selected")
        cy.contains('h2', 'Select your insurance company')
            .click()

        cy.step("click on the Next button")
        cy.clickNextBtn()

        cy.section("The query titled - 'How did you hear about us?' should be displayed")
        cy.contains('h2', 'How did you hear about us?')
            .should('be.visible')

        cy.step("click on the radio button - 'Health insurance'")
        cy.contains('label.mat-radio-label', 'Internet Search')
            .find('>span')
            .first()
            .click()

        cy.step("click on the Next button")
        cy.clickNextBtn()


        cy.section("The query titled - 'Who's getting therapy?' should be displayed")
        cy.contains('h2', 'Who\'s getting therapy?')
            .should('be.visible')

        //APPENDING RANDOM VALUES TO THE USER'S FIRSTNAME SO THAT WE CAN ENTER DYNAMIC USER EACH TIME
        let rand = Math.floor(Math.random() * 1000)
        //GETTING USER INFO FROM 'FIXTURES'
        /* cy.fixture('user.json').then((user) => {
            let FirstName = rand + user.fName
            cy.step("Enter First Name")
            cy.get('input[name=contactFirstName]')
                .type(FirstName)

            cy.step("Enter Last Name")
            cy.get('input[name=contactLastName]')
                .type(user.lName)

            cy.step("Enter Birthday")
            cy.get('input[data-test=mobile-basic-form-birthday-input]')
                .type(user.bDay)

            cy.step("Click on gender dropdown")
            cy.get('mat-select[data-test="gender-dropdown"]')
                .find('div.mat-select-arrow-wrapper')
                .click()

            cy.step("Choose the option - 'Man'")
            cy.get('div[role="listbox"]')
                .find('mat-option')
                .contains('Man')
                .click()

            cy.step("click on the Next button")
            cy.get('@NextBtn')
                .first()
                .click()

            cy.section("The query titled - 'Where should we send account updates?' should be displayed")
            cy.contains('h2', 'Where should we send account updates?')
                .should('be.visible')

            cy.step("Enter contact Email")
            cy.get('input[name="contactEmail"]')
                .scrollIntoView()
                .type(FirstName + user.email)

            cy.step("Enter Phone number")
            cy.get('input[name="contactPhoneNumber"]')
                .type(user.phone, { log: false })
        }) */

        //GETTING USER INFO FROM FAKER API
        cy.step("Enter the first name")
        cy.get('input[name=contactFirstName]')
            .scrollIntoView()
            .type(faker.person.firstName())

        cy.step("Enter the last name")
        cy.get('input[name=contactLastName]', { timeout: 30000 })
            .type(faker.person.lastName())

        const bDay = faker.date.birthdate().toLocaleDateString('en-US', {
            year: "numeric",
            month: "2-digit",
            day: "2-digit",
        })

        cy.step("Enter the birth day")
        cy.get('input[data-test=mobile-basic-form-birthday-input]', { timeout: 30_000 })
            .type(bDay)

        cy.step("Click on gender dropdown")
        cy.get('mat-select[data-test="gender-dropdown"]')
            .find('div.mat-select-arrow-wrapper')
            .click()

        cy.step("Choose the option - 'Man'")
        cy.get('div[role="listbox"]')
            .find('mat-option')
            .contains('Man')
            .click()

        cy.step("click on the Next button")
        cy.clickNextBtn()

        cy.section("The query titled - 'Where should we send account updates?' should be displayed")
        cy.contains('h2', 'Where should we send account updates?')
            .should('be.visible')

        cy.step("Enter contact email")
        cy.get('input[name="contactEmail"]')
            .scrollIntoView()
            .type(faker.internet.email())

        cy.step("Enter Phone number")
        cy.get('input[name="contactPhoneNumber"]')
            //with faker.phone.number(), some times getting the error invalid phone number
            // .type(faker.phone.number())
            //Hence using thefaker.helpers.fromRegExp()
            .type(faker.helpers.fromRegExp('303315[0-9]{4}'))

        cy.step("click on the Next button")
        cy.clickNextBtn()

        cy.section("The query titled - 'How should your therapist matches contact you?' should be displayed")
        cy.contains('h2', 'How should your therapist matches contact you?')
            .should('be.visible')

    })
})
