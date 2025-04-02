# Database
## DynamodB Table Schema (`Medicine`)
* `chatId`: string (this is an id that refers to the chat id for a telegram bot conversation
* `name`: string (the user's name)
* `lastMedicationTime`: string (a timestamp showing when the user last confirmed they took their medication.

# Lambda Functions
## Check Medication
### Description
This lambda function will scan the `Medicine` table and check if the `lastMedicationTime` is before 9 AM Eastern Time. If it is, the function will send a message to the user via telegram.
### Steps
1. Scan the `Medicine` table
2. Check if the `lastMedicationTime` is before 9 AM Eastern Time
3. If it is, send a message to the user via telegram
4. If it is not, do nothing
5. Return a success message
### Requirements
* The lambda function needs to be written in node (vanilla js)
* The lambda function needs to use the `aws-sdk` package
* The lambda function needs to use the `dotenv` package to load environment variables
* The lambda function needs to use the `node-telegram-bot-api` package to send messages to the user via telegram
* The lambda function will be triggered by an EventBridge rule that runs every 30 minutes

## Record Medication
### Description
This lambda function will record the time that the user confirms they took their medication.
### Steps
1. The lambda function will be triggered by a GET request (from a Shortcut Automation on an iOS device)
2. The lambda function will record the time that the user confirmed they took their medication in the `Medicine` table
3. The lambda function will send a message to the user via telegram confirming that their medication was recorded
### Requirements
* The lambda function needs to be written in node (vanilla js)
* The lambda function needs to use the `aws-sdk` package
* The lambda function needs to use the `dotenv` package to load environment variables
* The lambda function needs to use the `node-telegram-bot-api` package to send messages to the user via telegram
* The lambda function needs a function URL that takes a `chatId` as a query string parameter

## Environment Variables
* `TELEGRAM_BOT_TOKEN`: The token for the telegram bot

## Notes
* The lambda functions need to be deployed to AWS Lambda
* The lambda functions need to be deployed to the `us-east-2` region
* The lambda functions need to be deployed to the `Prod` environment
* The lambda functions need to be deployed to the `main` branch

# Project Structure
* `src/`: The source code for the lambda functions
  * `src/CheckMedication/`: The source code for the `CheckMedication` lambda function
  * `src/CheckMedication/index.js`: The entry point for the `CheckMedication` lambda function
  * `src/RecordMedication/`: The source code for the `RecordMedication` lambda function
  * `src/RecordMedication/index.js`: The entry point for the `RecordMedication` lambda function
  * `src/package.json`: The package.json file for the lambda functions
  * `src/package-lock.json`: The package-lock.json file for the lambda functions
* `README.md`: The README file for the project
* `.github/workflows/deploy-check-medication.yml`: The workflow file for the `CheckMedication` lambda function
* `.github/workflows/deploy-record-medication.yml`: The workflow file for the `RecordMedication` lambda function
