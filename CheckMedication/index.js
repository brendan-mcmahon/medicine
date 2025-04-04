const AWS = require('aws-sdk');
const dotenv = require('dotenv');
const TelegramBot = require('node-telegram-bot-api');

dotenv.config();

const dynamoDb = new AWS.DynamoDB.DocumentClient({
	region: 'us-east-2'
});

const bot = new TelegramBot(process.env.TELEGRAM_BOT_TOKEN);

function isBeforeNineAM(date) {
	const easternTime = new Date(date.toLocaleString('en-US', { 
		timeZone: 'America/New_York',
		hour12: false
	}));
	
	return easternTime.getHours() < 9;
}

exports.handler = async () => {
	try {
		if (isBeforeNineAM(new Date())) {
			console.log('Not 9am, returning');
			return {
				statusCode: 200,
				body: JSON.stringify({ message: 'Not 9am, returning' })
			};
		}

		const params = {
			TableName: 'Medicine',
		};

		const data = await dynamoDb.scan(params).promise();

		for (const item of data.Items) {
			const lastMedicatedTime = new Date(item.lastMedicatedTime);
			if (lastMedicatedTime.toDateString() !== new Date().toDateString()) {
				await bot.sendMessage(item.chatId, 'Reminder: You have not taken your medication today.');
				console.log('Sent message to:', item.chatId);
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
