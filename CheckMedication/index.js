const AWS = require('aws-sdk');
const dotenv = require('dotenv');
const TelegramBot = require('node-telegram-bot-api');

dotenv.config();

const dynamoDb = new AWS.DynamoDB.DocumentClient({
	region: 'us-east-2'
});

const bot = new TelegramBot(process.env.TELEGRAM_BOT_TOKEN);

function isBeforeNineAM(timestamp) {
  const date = new Date(timestamp);
  const easternDate = new Date(date.toLocaleString('en-US', { timeZone: 'America/New_York' }));
  return easternDate.getHours() < 9;
}

exports.handler = async () => {
	console.log('Checking medication...');
  try {
    const params = {
      TableName: 'Medicine',
    };

    const data = await dynamoDb.scan(params).promise();
	console.log('Data:', data);

    for (const item of data.Items) {
      if (isBeforeNineAM(item.lastMedicatedTime)) {
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
