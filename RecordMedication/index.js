const AWS = require('aws-sdk');
const dotenv = require('dotenv');
const TelegramBot = require('node-telegram-bot-api');

dotenv.config();

const dynamoDb = new AWS.DynamoDB.DocumentClient({
  region: 'us-east-2'
});

const bot = new TelegramBot(process.env.TELEGRAM_BOT_TOKEN, { polling: false });

exports.handler = async (event) => {
  const body = JSON.parse(body);

  try {
	const chatId = body?.message?.chat?.id?.toString()
             || event.queryStringParameters?.chatId;

    if (!chatId) {
      console.error('No chatId found in payload');
      return { statusCode: 400, body: 'chatId required' };
    }
    if (chatId !== 1397659260) {
      console.error('Unauthorized chatId:', chatId);
      return { statusCode: 401, body: 'unauthorized' };
    }

    const now = new Date();
    const eastern = new Date(
      now.toLocaleString('en-US', { timeZone: 'America/New_York' })
    );
    const iso = eastern.toISOString();

    const params = {
      TableName: 'Medicine',
      Key: { chatId },
      UpdateExpression: 'SET lastMedicatedTime = :t',
      ExpressionAttributeValues: {
        ':t': iso
      }
    };
    await dynamoDb.update(params).promise();

    const timeStr = eastern.toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true
    });
    await bot.sendMessage(chatId, `Medication recorded at ${timeStr}`);

    return {
      statusCode: 200,
      body: 'OK'
    };
  } catch (error) {
    console.error('Error recording medication:', error);
    return {
      statusCode: 500,
      body: 'internal error'
    };
  }
};
