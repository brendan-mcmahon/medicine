import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda';
import { UpdateCommand } from '@aws-sdk/lib-dynamodb';
import { docClient, TABLE_NAME, sendTelegramMessage } from '../utils';

export const handler = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
  try {
    const chatId = event.queryStringParameters?.chatId;
    
    if (!chatId) {
      return {
        statusCode: 400,
        body: JSON.stringify({ message: 'chatId is required' })
      };
    }

    // Update the lastMedicationTime in DynamoDB
    const updateCommand = new UpdateCommand({
      TableName: TABLE_NAME,
      Key: { chatId },
      UpdateExpression: 'SET lastMedicationTime = :time',
      ExpressionAttributeValues: {
        ':time': new Date().toISOString()
      },
      ReturnValues: 'ALL_NEW'
    });

    const result = await docClient.send(updateCommand);
    const updatedRecord = result.Attributes;

    if (!updatedRecord) {
      return {
        statusCode: 404,
        body: JSON.stringify({ message: 'Chat ID not found' })
      };
    }

    // Send Telegram message
    await sendTelegramMessage(chatId, `${updatedRecord.username} has taken meds!`);

    return {
      statusCode: 200,
      body: JSON.stringify({ message: 'Medication time updated successfully' })
    };

  } catch (error) {
    console.error('Error:', error);
    return {
      statusCode: 500,
      body: JSON.stringify({ message: 'Internal server error' })
    };
  }
}; 