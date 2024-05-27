# Sondermind 'Find a Therapist' End to End Automation Cypress_Project
Welcome to our Project! This repository contains automated tests built using Cypress for ensuring the quality and reliability of our application.

## Project Overview
This project aims to automate end-to-end tests for Sondermind's Find a Therapist Questionnaire and Webtables angular application. By leveraging Cypress, we can thoroughly test various user interactions, workflows, and functionalities of the application.

## Getting Started
To get started with the project, follow these steps:

**Clone the Repository:**  Clone this repository to your local machine using **'git clone'**.

**Install Dependencies:** Run **'npm install'** to install all the necessary dependencies.

## Test Specs:
The test specs are located under **'e2e'** directory. We can add new tests or modify existing ones as per the requirement.

## Test Data:
The test data used to run the SM_Test test spec is placed in **'user.json'** file under **'fixtures'** directory.
Also, Faker API is used in order to fetch the user information.
In the Spec file, from lines 252 - 287, we have the user info fields filled using the data from the fixture user.json, which is now commented and
from the lines 291 - 337, the user info fields are filled using faker api. 

Inorder to see how user info fields get data from fixtures or faker api, we need to comment one section of code and uncomment the other.

## Custom Commands:
The definitions of various custom commands used in the test specs are placed in **'commands.js'** file under **'support'** directory.

## Configuration:
Cypress configuration details are placed in **'cypress.config.js'** file. '**Test retries**' which is Experimental Flake Detection feature introduced in Cyress version 13.4 is added here.
A separate cypress.env.json is created for placing the base urls of both 'Sondermind' and 'WebTables' app. Hence, each of these test cases can use different urls as needed.

## package.json:
This file defines project dependencies and scripts.

## Run and view the test results

**Run Tests on GUI:** Execute **'npm run test'** or **'npx cypress open'** to run the Cypress tests in GUI mode.

**Run Tests in Headless mode:** Execute **'npm run headless'** or **'npx cypress run'** to run the Cypress tests in headless mode.

**Run Tests in Headless mode for SM_Test:** Execute **'npm run SM_Test'** to run the Cypress tests in headless mode of only SM_Test test spec.

**e2e-tests.yml** file enables to run the code in github for every push

**View Test Results:** Once the tests finish running, Cypress will display the results in an interactive test runner.

## Reports and Videos
Report will be generated once the test runs in headless mode and can be found under **cypress -> reports\html -> index.html** of the project
They can also be found in the github repository **https://github.com/Awesom12/Sondermind_Cypress_Project**. Click on **Actions -> Summary**. Test reports can be found under the **Artifacts** section.

Videos can be found directly on the reports or can be watched from **cypress -> videos**

## Features of SM_Test spec

- Test specs are in isolation.
- The baseUrls which are used in the specs SM_Test.cy.js and webtables.cy.js are set in cypress.env.json file.
- **Find a Therapist** questionnaire of the application opens up in a separate tab. This is handled by removing the target attribute from the relevant html element.
- The questions **We're here for you on your journey** and **When are you available for sessions?** don't appear in the flow of questions every time you fill in the questionnaire. This is handled using 'if - else' condition
- Instead of directly typing the **Location** value for the question **'Where are you located?**. Automated the test script to type a part of the location, then click on the 'add location' icon and use 'down Arrow' option and select the location.
- To enter text in **Addition preferences** field of the question **Are there any other preferences you'd like to share?** is automated by entering long text using cypress type command with option {delay:0}, such that it enters the text all at once     instead of letter by letter.
- To fill in the patient/user details for the question **'Who's getting therapy?'**, made use of the static data from the fixture user.json. Javascript function Math.random() is used to make the username and email values fetch the random values and faker api is used inorder to get the dynamic data.
- Cypress Steps Plugin is installed to enhance the readability of the test spec.
- Custom commands are used wherever necessary, to extend the functionality of Cypress.
- Aliases are used to store what commands yield.
- Note: **Find a Therapist** questionnaire is not automated till the end, as the motto of this automation project is just to create a Test case using Cypress but not to really Find a Therapist.