// Import necessary packages
const AWS = require('aws-sdk');
const dotenv = require('dotenv');
const TelegramBot = require('node-telegram-bot-api');

// Load environment variables
dotenv.config();

// Initialize DynamoDB
const dynamoDb = new AWS.DynamoDB.DocumentClient();

// Initialize Telegram Bot
const bot = new TelegramBot(process.env.TELEGRAM_BOT_TOKEN);

exports.handler = async (event) => {
  try {
    // Get chatId from query string
    const chatId = event.queryStringParameters.chatId;
    if (!chatId) {
      return {
        statusCode: 400,
        body: JSON.stringify({ message: 'chatId is required' })
      };
    }

    // Get current timestamp
    const currentTime = new Date().toISOString();

    // Update the lastMedicationTime in DynamoDB
    const params = {
      TableName: 'Medicine',
      Key: { chatId },
      UpdateExpression: 'SET lastMedicationTime = :time',
      ExpressionAttributeValues: {
        ':time': currentTime
      }
    };

    await dynamoDb.update(params).promise();

    // Send confirmation message to the user
    await bot.sendMessage(chatId, `Medication recorded at ${currentTime}`);

    return {
      statusCode: 200,
      body: JSON.stringify({ message: 'Medication recorded successfully' })
    };
  } catch (error) {
    console.error('Error recording medication:', error);
    return {
      statusCode: 500,
      body: JSON.stringify({ message: 'Internal server error' })
    };
  }
};
