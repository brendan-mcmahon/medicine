const AWS = require('aws-sdk');
import { docClient, TABLE_NAME, sendTelegramMessage, getEasternTimeNineAM } from '../utils';

export const handler = async () => {
  try {

	const result = await docClient.scan({ TableName: TABLE_NAME }).promise();

    const records = result.Items;

    if (!records) {
      console.log('No records found');
      return;
    }

    const nineAM = getEasternTimeNineAM();

    for (const record of records) {
      const lastMedTime = new Date(record.lastMedicationTime);
      
      if (lastMedTime < nineAM) {
        await sendTelegramMessage(
          record.chatId,
          `${record.username} has not taken meds today`
        );
      }
    }

  } catch (error) {
    console.error('Error:', error);
    throw error;
  }
}; 