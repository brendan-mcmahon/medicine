const AWS = require('aws-sdk');
const dotenv = require('dotenv');
const TelegramBot = require('node-telegram-bot-api');

dotenv.config();

const dynamoDb = new AWS.DynamoDB.DocumentClient({
	region: 'us-east-2'
});

const bot = new TelegramBot(process.env.TELEGRAM_BOT_TOKEN);

function getEasternTime() {
	const easternTime = new Date().toLocaleString('en-US', {
		timeZone: 'America/New_York',
		hour12: false
	});

	return easternTime;
}

function isBeforeNineAM() {
	const easternTime = getEasternTime();

	return new Date(easternTime).getHours() < 9;
}

function getDateWithoutTime(date) {
	return new Date(date.getFullYear(), date.getMonth(), date.getDate());
}

exports.handler = async () => {
	try {
		if (isBeforeNineAM()) {
			return {
				statusCode: 200,
				body: JSON.stringify({ message: 'Not 9am, returning' })
			};
		}

		const params = {
			TableName: 'Medicine',
		};

		const data = await dynamoDb.scan(params).promise();
		console.log(data);

		const item = data.Items.filter(i => i.chatId === '1397659260')[0];
		const lastMedicatedTime = getDateWithoutTime(new Date(item.lastMedicatedTime));
		const now = getDateWithoutTime(new Date(getEasternTime()));
		if (lastMedicatedTime.toISOString() !== now.toISOString()) {
			await bot.sendMessage(item.chatId, 'Reminder: You have not taken your medication today.');
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
