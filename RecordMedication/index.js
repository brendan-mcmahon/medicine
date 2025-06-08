const AWS = require('aws-sdk');
const dotenv = require('dotenv');
const TelegramBot = require('node-telegram-bot-api');

dotenv.config();

const dynamoDb = new AWS.DynamoDB.DocumentClient({
  region: 'us-east-2'
});

const bot = new TelegramBot(process.env.TELEGRAM_BOT_TOKEN, { polling: false });

exports.handler = async (event) => {
  const body = JSON.parse(event.body);

	console.log(body);

  try {
	const chatId = String(body?.message?.chat?.id);

    if (!chatId) {
      console.error('No chatId found in payload');
      return { statusCode: 400, body: 'chatId required' };
    }
    if (chatId !== 1397659260) {
      console.error('Unauthorized chatId:', chatId);
      return { statusCode: 401, body: 'unauthorized' };
    }

	const currentTime = new Date();
	const easternTime = new Date(currentTime.toLocaleString('en-US', { timeZone: 'America/New_York' }));
	
	const params = {
		TableName: 'Medicine',
		Key: {
			chatId
		},
		UpdateExpression: 'SET lastMedicatedTime = :time',
		ExpressionAttributeValues: {
			':time': easternTime.toISOString()
		}
	};

	await dynamoDb.update(params).promise();

	await bot.sendMessage(chatId, `Medication recorded at ${easternTime.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true })}`);

	return { statusCode: 200 };
  } catch (error) {
    console.error('Error recording medication:', error);
    return {
      statusCode: 500,
      body: 'internal error'
    };
  }
};
