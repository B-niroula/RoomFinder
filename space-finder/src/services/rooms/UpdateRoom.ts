import { DynamoDBClient, GetItemCommand, UpdateItemCommand } from "@aws-sdk/client-dynamodb";
import { APIGatewayProxyEvent, APIGatewayProxyResult } from "aws-lambda";
import { getUserInfo, hasAdminGroup } from "../shared/Utils";
import { marshall, unmarshall } from "@aws-sdk/util-dynamodb";
import { notifyRoomEvent } from "../shared/notifications";



export async function updateRoom(event: APIGatewayProxyEvent, ddbClient: DynamoDBClient): Promise<APIGatewayProxyResult> {


    if(event.queryStringParameters && ('id' in event.queryStringParameters) && event.body) {

        const parsedBody = JSON.parse(event.body);
        const spaceId = event.queryStringParameters['id'];

        const existing = await ddbClient.send(new GetItemCommand({
            TableName: process.env.TABLE_NAME,
            Key: { 'id': {S: spaceId} }
        }));

        if (!existing.Item) {
            return { statusCode: 404, body: JSON.stringify(`Room with id ${spaceId} not found`) };
        }

        const currentItem = unmarshall(existing.Item);
        const { userId } = getUserInfo(event);
        const isAdmin = hasAdminGroup(event);
        if (!userId) {
            return { statusCode: 401, body: JSON.stringify('Unauthorized') };
        }
        if (!isAdmin && currentItem.ownerId !== userId) {
            return { statusCode: 403, body: JSON.stringify('You can only edit your own listings') };
        }

        const allowedFields = ['title','address','description','rent','bedrooms','bathrooms','squareFeet','amenities','availableDate','contactEmail','contactPhone','photoUrl','isAvailable'];
        const keys = Object.keys(parsedBody).filter(k => allowedFields.includes(k));
        if (keys.length === 0) {
            return { statusCode: 400, body: JSON.stringify('No updatable fields provided') };
        }

        if (parsedBody.contactEmail) {
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if (!emailRegex.test(parsedBody.contactEmail)) {
                return { statusCode: 400, body: JSON.stringify('Invalid email format') };
            }
        }
        if (parsedBody.contactPhone) {
            const phoneRegex = /^\+[1-9]\d{7,14}$/;
            if (!phoneRegex.test(parsedBody.contactPhone)) {
                return { statusCode: 400, body: JSON.stringify('Invalid phone format, use E.164 like +15551234567') };
            }
        }

        const expressionNames: Record<string,string> = {};
        const expressionValues: Record<string,any> = {};
        const setStatements: string[] = [];

        keys.forEach((key, idx) => {
            const nameKey = `#f${idx}`;
            const valueKey = `:v${idx}`;
            expressionNames[nameKey] = key;
            expressionValues[valueKey] = parsedBody[key];
            setStatements.push(`${nameKey} = ${valueKey}`);
        });

        const marshalledValues = marshall(expressionValues, {removeUndefinedValues: true});

        const updateResult = await ddbClient.send(new UpdateItemCommand({
            TableName: process.env.TABLE_NAME,
            Key: {
                'id': {S: spaceId}
            },
            UpdateExpression: `set ${setStatements.join(', ')}`,
            ExpressionAttributeValues: marshalledValues,
            ExpressionAttributeNames: expressionNames,
            ReturnValues: 'ALL_NEW'
        }));

        await notifyRoomEvent({
            type: 'updated',
            roomId: spaceId,
            title: parsedBody.title || currentItem.title,
            ownerName: currentItem.ownerName || 'owner',
            ownerEmail: currentItem.contactEmail
        });

        return {
            statusCode: 200,
            body: JSON.stringify(updateResult.Attributes ? unmarshall(updateResult.Attributes) : {})
        }

    }
    return {
        statusCode: 400,
        body: JSON.stringify('Please provide right args!!')
    }

}
