const AWS = require('aws-sdk');
const dotenv = require('dotenv');
const TelegramBot = require('node-telegram-bot-api');

dotenv.config();

const dynamoDb = new AWS.DynamoDB.DocumentClient({
	region: 'us-east-2'
});

const bot = new TelegramBot(process.env.TELEGRAM_BOT_TOKEN);

exports.handler = async (event) => {
	console.log(event)
	try {
		let chatId;
		
		if (event.message && event.message.chat && event.message.chat.id) {
			chatId = event.message.chat.id.toString();
		} 
		else {
			chatId = event.queryStringParameters?.chatId;
		}
		
		if (!chatId) {
			return { statusCode: 400 };
		}

		if (chatId !== "1397659260") {
			return { statusCode: 401 }
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
		return { statusCode: 500 };
	}
};
