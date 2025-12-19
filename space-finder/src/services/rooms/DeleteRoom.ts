import { DeleteItemCommand, DynamoDBClient, GetItemCommand } from "@aws-sdk/client-dynamodb";
import { APIGatewayProxyEvent, APIGatewayProxyResult } from "aws-lambda";
import { getUserInfo, hasAdminGroup } from "../shared/Utils";
import { unmarshall } from "@aws-sdk/util-dynamodb";
import { notifyRoomEvent } from "../shared/notifications";



export async function deleteRoom(event: APIGatewayProxyEvent, ddbClient: DynamoDBClient): Promise<APIGatewayProxyResult> {
    const { userId } = getUserInfo(event);
    const isAdmin = hasAdminGroup(event);

    if(event.queryStringParameters && ('id' in event.queryStringParameters)) {

        const spaceId = event.queryStringParameters['id'];

        const existing = await ddbClient.send(new GetItemCommand({
            TableName: process.env.TABLE_NAME,
            Key: { 'id': {S: spaceId} }
        }));

        if (!existing.Item) {
            return {
                statusCode: 404,
                body: JSON.stringify(`Room with id ${spaceId} not found`)
            }
        }

        const currentItem = unmarshall(existing.Item);
        if (!userId) {
            return {
                statusCode: 401,
                body: JSON.stringify('Unauthorized')
            }
        }
        if (!isAdmin && currentItem.ownerId !== userId) {
            return {
                statusCode: 403,
                body: JSON.stringify('You can only delete your own listings')
            }
        }

        await ddbClient.send(new DeleteItemCommand({
            TableName: process.env.TABLE_NAME,
            Key: {
                'id': {S: spaceId}
            }
        }));

        await notifyRoomEvent({
            type: 'deleted',
            roomId: spaceId,
            title: currentItem.title,
            ownerName: currentItem.ownerName || 'owner',
            ownerEmail: currentItem.contactEmail
        });

        return {
            statusCode: 200,
            body: JSON.stringify(`Deleted room with id ${spaceId}`)
        }

    }
    return {
        statusCode: 400,
        body: JSON.stringify('Please provide right args!!')
    }

}
