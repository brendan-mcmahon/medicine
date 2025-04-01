# Medicine Reminder System

This system helps track medication intake using AWS Lambda functions and Telegram notifications.

## Prerequisites

- Node.js 20.x or later
- AWS CLI configured with appropriate credentials
- Terraform installed
- A Telegram bot token (obtain from [@BotFather](https://t.me/botfather))

## Setup

1. Install dependencies:
   ```bash
   npm install
   ```

2. Build the TypeScript code:
   ```bash
   npm run build
   ```

3. Create Lambda deployment packages:
   ```bash
   cd dist
   zip -r lambda1.zip lambda1/
   zip -r lambda2.zip lambda2/
   cd ..
   ```

4. Deploy infrastructure:
   ```bash
   cd infrastructure
   terraform init
   terraform apply
   ```
   When prompted, enter your Telegram bot token.

## Usage

### Recording Medication Taken

Use the Lambda function URL (output after terraform apply) with a GET request:

```
https://<function-url>?chatId=<telegram-chat-id>
```

### Automated Checks

The system automatically checks at 9 AM Eastern Time if users have taken their medication and sends notifications via Telegram if they haven't.

## DynamoDB Schema

The DynamoDB table "Medicine" has the following schema:
- `chatId` (String) - Primary key, the Telegram chat ID
- `username` (String) - The user's name for notifications
- `lastMedicationTime` (String) - ISO timestamp of last medication taken

## Environment Variables

- `TELEGRAM_BOT_TOKEN` - Your Telegram bot's API token

## Security Notes

- The Lambda function URL is public and should be protected in a production environment
- The Telegram bot token is stored as a sensitive variable in Terraform
- Consider adding authentication to the Lambda function URL in production 