const AWS = require('aws-sdk');
const dotenv = require('dotenv');
const TelegramBot = require('node-telegram-bot-api');

dotenv.config();

const dynamoDb = new AWS.DynamoDB.DocumentClient();

const bot = new TelegramBot(process.env.TELEGRAM_BOT_TOKEN);

exports.handler = async (event) => {
	console.log(event);
	try {
		const chatId = event.queryStringParameters.chatId;
		console.log("Chat Id:", chatId);
		if (!chatId) {
			console.error('chatId is required');
			return {
				statusCode: 400,
				body: JSON.stringify({ message: 'chatId is required' })
			};
		}

		const currentTime = new Date().toISOString();

		const params = {
			TableName: 'Medicine',
			Key: { chatId },
			UpdateExpression: 'SET lastMedicationTime = :time',
			ExpressionAttributeValues: {
				':time': currentTime
			}
		};

		await dynamoDb.update(params).promise();

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
