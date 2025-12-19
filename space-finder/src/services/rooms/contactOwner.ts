import { APIGatewayProxyEvent, APIGatewayProxyResult } from "aws-lambda";
import { DynamoDBClient, GetItemCommand } from "@aws-sdk/client-dynamodb";
import { unmarshall } from "@aws-sdk/util-dynamodb";
import { SNSClient, PublishCommand } from "@aws-sdk/client-sns";

const snsClient = new SNSClient({});

export async function contactOwner(event: APIGatewayProxyEvent, ddbClient: DynamoDBClient): Promise<APIGatewayProxyResult> {
    if (!event.body) {
        return { statusCode: 400, body: JSON.stringify('Missing body') };
    }
    const body = JSON.parse(event.body);
    const { roomId, message, fromEmail } = body;
    if (!roomId || !message) {
        return { statusCode: 400, body: JSON.stringify('roomId and message are required') };
    }
    if (fromEmail) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(fromEmail)) {
            return { statusCode: 400, body: JSON.stringify('Invalid email format') };
        }
    }

    const item = await ddbClient.send(new GetItemCommand({
        TableName: process.env.TABLE_NAME,
        Key: { id: { S: roomId } }
    }));
    if (!item.Item) {
        return { statusCode: 404, body: JSON.stringify('Room not found') };
    }
    const room = unmarshall(item.Item);
    if (!room.contactPhone) {
        return { statusCode: 400, body: JSON.stringify('Owner has no phone number set') };
    }

    const text = `Inquiry for "${room.title || 'your listing'}": ${message}${fromEmail ? ` (reply: ${fromEmail})` : ''}`;
    await snsClient.send(new PublishCommand({
        PhoneNumber: room.contactPhone,
        Message: text
    }));

    return {
        statusCode: 200,
        body: JSON.stringify('Message sent to owner')
    }
}
