import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import { DynamoDBDocumentClient } from '@aws-sdk/lib-dynamodb';
import axios from 'axios';
import { zonedTimeToUtc, utcToZonedTime } from 'date-fns-tz';
import { format } from 'date-fns';

const dynamoClient = new DynamoDBClient({});
export const docClient = DynamoDBDocumentClient.from(dynamoClient);

export const TELEGRAM_BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN;
export const TABLE_NAME = 'Medicine';

export interface MedicineRecord {
  chatId: string;
  username: string;
  lastMedicationTime: string;
}

export async function sendTelegramMessage(chatId: string, message: string): Promise<void> {
  if (!TELEGRAM_BOT_TOKEN) {
    throw new Error('TELEGRAM_BOT_TOKEN environment variable is not set');
  }

  const url = `https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage`;
  await axios.post(url, {
    chat_id: chatId,
    text: message
  });
}

export function getCurrentEasternTime(): Date {
  const utcDate = new Date();
  return utcToZonedTime(utcDate, 'America/New_York');
}

export function getEasternTimeNineAM(): Date {
  const easternDate = getCurrentEasternTime();
  easternDate.setHours(9, 0, 0, 0);
  return easternDate;
} 