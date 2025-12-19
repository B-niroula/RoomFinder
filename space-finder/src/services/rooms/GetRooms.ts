import { DynamoDBClient, GetItemCommand, ScanCommand } from "@aws-sdk/client-dynamodb";
import { unmarshall } from "@aws-sdk/util-dynamodb";
import { APIGatewayProxyEvent, APIGatewayProxyResult } from "aws-lambda";



export async function getRooms(event: APIGatewayProxyEvent, ddbClient: DynamoDBClient): Promise<APIGatewayProxyResult> {

    if(event.queryStringParameters) {
        if ('id' in event.queryStringParameters) {
            const spaceId = event.queryStringParameters['id'];
            const getItemResponse = await ddbClient.send(new GetItemCommand({
                TableName: process.env.TABLE_NAME,
                Key: {
                    'id': {S: spaceId}
                }
            }))
            if (getItemResponse.Item) {
                //must unmashall so the react app can receive the correct date, otherwise error will occour when rendering
                const unmashalledItem = unmarshall(getItemResponse.Item);
                // Ensure amenities is always an array
                if (!unmashalledItem.amenities || !Array.isArray(unmashalledItem.amenities)) {
                    unmashalledItem.amenities = [];
                }
                console.log(unmashalledItem);
                return {
                    statusCode: 200,
                    body: JSON.stringify(unmashalledItem)
                }
            } else {
                return {
                    statusCode: 404,
                    body: JSON.stringify(`Room with id ${spaceId} not found!`)
                }
            }
        } else {
            return {
                statusCode: 400,
                body: JSON.stringify('Id required!')
            }
        }
    }



    const result = await ddbClient.send(new ScanCommand({
        TableName: process.env.TABLE_NAME,
    }));
    
    //must unmashall so the react app can receive the correct date, otherwise error will occour when rendering
    const unmashalledItems = result.Items?.map(item => {
        const unmarshalled = unmarshall(item);
        // Ensure amenities is always an array
        if (!unmarshalled.amenities || !Array.isArray(unmarshalled.amenities)) {
            unmarshalled.amenities = [];
        }
        return unmarshalled;
    });
    console.log(unmashalledItems);

    return {
        statusCode: 200,
        body: JSON.stringify(unmashalledItems)
    }
}