const AWS = require('aws-sdk');
const dotenv = require('dotenv');
const TelegramBot = require('node-telegram-bot-api');

// Load environment variables
dotenv.config();

// Initialize DynamoDB
const dynamoDb = new AWS.DynamoDB.DocumentClient();

// Initialize Telegram Bot
const bot = new TelegramBot(process.env.TELEGRAM_BOT_TOKEN);

// Utility function to check if time is before 9 AM Eastern
function isBeforeNineAM(timestamp) {
  const date = new Date(timestamp);
  const easternDate = new Date(date.toLocaleString('en-US', { timeZone: 'America/New_York' }));
  return easternDate.getHours() < 9;
}

exports.handler = async () => {
  try {
    // Scan the Medicine table to get all records
    const params = {
      TableName: 'Medicine',
    };

    const data = await dynamoDb.scan(params).promise();

    for (const item of data.Items) {
      if (isBeforeNineAM(item.lastMedicatedTime)) {
        await bot.sendMessage(item.chatId, 'Reminder: You have not taken your medication today.');
      }
    }

    return {
      statusCode: 200,
      body: JSON.stringify({ message: 'Medication check completed' })
    };
  } catch (error) {
    console.error('Error checking medication:', error);
    return {
      statusCode: 500,
      body: JSON.stringify({ message: 'Internal server error' })
    };
  }
};
