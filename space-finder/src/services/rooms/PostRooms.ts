import { DynamoDBClient, PutItemCommand } from "@aws-sdk/client-dynamodb";
import { APIGatewayProxyEvent, APIGatewayProxyResult } from "aws-lambda";
import { validateAsRoomEntry } from "../shared/Validator";
import { marshall } from "@aws-sdk/util-dynamodb";
import { createRandomId, parseJSON, getUserInfo } from "../shared/Utils";
import { notifyRoomEvent } from "../shared/notifications";

export async function postRooms(event: APIGatewayProxyEvent, ddbClient: DynamoDBClient): Promise<APIGatewayProxyResult> {

    const randomId = createRandomId();
    const item = parseJSON(event.body);
    item.id = randomId;
    const { userId, userName } = getUserInfo(event);
    if (!userId) {
        return {
            statusCode: 401,
            body: JSON.stringify('Unauthorized')
        }
    }
    item.ownerId = userId;
    item.ownerName = userName || 'owner';
    validateAsRoomEntry(item);

    await ddbClient.send(new PutItemCommand({
        TableName: process.env.TABLE_NAME,
        Item: marshall(item)
    }));

    await notifyRoomEvent({
        type: 'created',
        roomId: randomId,
        title: item.title,
        ownerName: userName || 'owner',
        ownerEmail: item.contactEmail
    });

    return {
        statusCode: 201,
        body: JSON.stringify({id: randomId})
    }
}
