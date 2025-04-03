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
		const chatId = event.queryStringParameters?.chatId;
		if (!chatId) {
			return {
				statusCode: 400,
				body: JSON.stringify({ message: 'chatId is required' })
			};
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

		return {
			statusCode: 200,
			body: JSON.stringify({ message: 'Medication recorded successfully' })
		};
	} catch (error) {
		console.error('Error recording medication:', error);
		return {
			statusCode: 500,
			body: JSON.stringify({ message: 'Internal server error', error: error.message })
		};
	}
};
