import { ScanCommand } from '@aws-sdk/lib-dynamodb';
import { docClient, TABLE_NAME, sendTelegramMessage, getEasternTimeNineAM } from '../utils';

export const handler = async () => {
  try {
    // Scan the DynamoDB table for all records
    const scanCommand = new ScanCommand({
      TableName: TABLE_NAME
    });

    const result = await docClient.send(scanCommand);
    const records = result.Items;

    if (!records) {
      console.log('No records found');
      return;
    }

    const nineAM = getEasternTimeNineAM();

    // Check each record and send notifications if needed
    for (const record of records) {
      const lastMedTime = new Date(record.lastMedicationTime);
      
      // If the last medication time is before 9 AM today
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