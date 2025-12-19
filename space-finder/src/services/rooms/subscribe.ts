import { APIGatewayProxyEvent, APIGatewayProxyResult } from "aws-lambda";
import { SNSClient, SubscribeCommand } from "@aws-sdk/client-sns";

const snsClient = new SNSClient({});
const topicArn = process.env.NOTIFICATIONS_TOPIC_ARN;

export async function subscribeToRoom(event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> {
    if (!topicArn) {
        return { statusCode: 500, body: JSON.stringify('Notifications topic not configured') };
    }
    if (!event.body) {
        return { statusCode: 400, body: JSON.stringify('Missing body') };
    }
    const body = JSON.parse(event.body);
    const { roomId, protocol, endpoint } = body;
    if (!roomId || !protocol || !endpoint) {
        return { statusCode: 400, body: JSON.stringify('roomId, protocol, and endpoint are required') };
    }
    if (!['email', 'sms'].includes(protocol)) {
        return { statusCode: 400, body: JSON.stringify('protocol must be email or sms') };
    }

    if (protocol === 'email') {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(endpoint)) {
            return { statusCode: 400, body: JSON.stringify('Invalid email format') };
        }
    } else {
        const phoneRegex = /^\+[1-9]\d{7,14}$/;
        if (!phoneRegex.test(endpoint)) {
            return { statusCode: 400, body: JSON.stringify('Invalid phone format, use E.164 like +15551234567') };
        }
    }

    await snsClient.send(new SubscribeCommand({
        TopicArn: topicArn,
        Protocol: protocol,
        Endpoint: endpoint,
        Attributes: {
            FilterPolicy: JSON.stringify({ roomId: [roomId] })
        }
    }));

    return {
        statusCode: 200,
        body: JSON.stringify('Subscription requested. Please confirm if required.')
    }
}
