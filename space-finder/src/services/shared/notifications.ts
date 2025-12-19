import { SNSClient, PublishCommand } from "@aws-sdk/client-sns";

const snsClient = new SNSClient({});
const topicArn = process.env.NOTIFICATIONS_TOPIC_ARN;

type RoomEvent = {
    type: 'created' | 'updated' | 'deleted';
    roomId: string;
    title: string;
    ownerName?: string;
    ownerEmail?: string;
};

export async function notifyRoomEvent(event: RoomEvent) {
    if (!topicArn) {
        console.warn('Notifications topic not configured; skipping notification');
        return;
    }
    const subjectMap = {
        created: 'New room listing created',
        updated: 'Room listing updated',
        deleted: 'Room listing deleted',
    };
    const message = {
        ...event,
        message: subjectMap[event.type],
        timestamp: new Date().toISOString(),
    };
    await snsClient.send(new PublishCommand({
        TopicArn: topicArn,
        Subject: subjectMap[event.type],
        Message: JSON.stringify(message),
        MessageAttributes: {
            roomId: {
                DataType: 'String',
                StringValue: event.roomId
            }
        }
    }));
}
