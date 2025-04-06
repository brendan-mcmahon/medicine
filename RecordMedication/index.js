const AWS = require('aws-sdk');
const dotenv = require('dotenv');
const TelegramBot = require('node-telegram-bot-api');

dotenv.config();

const dynamoDb = new AWS.DynamoDB.DocumentClient({
	region: 'us-east-2'
});

const bot = new TelegramBot(process.env.TELEGRAM_BOT_TOKEN);

exports.handler = async (event) => {
	try {
		// Determine event type and extract chatId
		let chatId;
		
		// Check if this is a Telegram message event
		if (event.message && event.message.chat && event.message.chat.id) {
			chatId = event.message.chat.id.toString();
		} 
		// Otherwise, assume it's an HTTP request
		else {
			chatId = event.queryStringParameters?.chatId;
		}
		
		if (!chatId) {
			// Return minimal response if chatId is missing
			return { statusCode: 400 };
		}

		const currentTime = new Date();

		const params = {
			TableName: 'Medicine',
			Key: {
			  chatId
			},
			UpdateExpression: 'SET lastMedicatedTime = :time',
			ExpressionAttributeValues: {
			  ':time': currentTime.toISOString()
			}
		};

		await dynamoDb.update(params).promise();

		await bot.sendMessage(chatId, `Medication recorded at ${currentTime.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true })}`);

		// Simple success response for both HTTP and Telegram events
		return { statusCode: 200 };
	} catch (error) {
		console.error('Error recording medication:', error);
		return { statusCode: 500 };
	}
};
