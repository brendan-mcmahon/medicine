# Medicine Reminder System

This system helps track medication intake using AWS Lambda functions and Telegram notifications.

## Prerequisites

- Node.js 20.x or later
- AWS CLI configured with appropriate credentials
- A Telegram bot token (obtain from [@BotFather](https://t.me/botfather))

## AWS Setup (Manual)

1. Create DynamoDB Table:
   - Table name: `Medicine`
   - Partition key: `chatId` (String)
   - Add fields:
     - `username` (String)
     - `lastMedicationTime` (String)

2. Create Lambda Functions:
   - Function 1:
     - Name: `record_medication`
     - Runtime: Node.js 20.x
     - Handler: `lambda1/index.handler`
     - Environment variable: `TELEGRAM_BOT_TOKEN`
     - Create function URL (CORS disabled)
   
   - Function 2:
     - Name: `check_medication`
     - Runtime: Node.js 20.x
     - Handler: `lambda2/index.handler`
     - Environment variable: `TELEGRAM_BOT_TOKEN`

3. Create EventBridge Rule:
   - Schedule: `0/30 * * * ? *` (every 30 minutes)
   - Target: `check_medication` Lambda function
   - Note: The Lambda function internally checks if it's after 9 AM Eastern before sending notifications

4. Set up IAM permissions:
   - Lambda functions need DynamoDB access
   - EventBridge needs Lambda invoke permissions

## GitHub Actions Setup

1. Create AWS access keys for deployment
2. Add repository secrets:
   - `AWS_ACCESS_KEY_ID`
   - `AWS_SECRET_ACCESS_KEY`
   - `TELEGRAM_BOT_TOKEN`

3. Push code to trigger deployment

## Usage

### Recording Medication Taken

Use the Lambda function URL with a GET request:

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
- Store sensitive credentials securely
- Consider adding authentication to the Lambda function URL in production 