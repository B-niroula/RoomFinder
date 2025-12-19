import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { APIGatewayProxyEvent, APIGatewayProxyResult, Context } from "aws-lambda";
import { postRooms } from "./PostRooms";
import { getRooms } from "./GetRooms";
import { updateRoom } from "./UpdateRoom";
import { deleteRoom } from "./DeleteRoom";
import { JsonError, MissingFieldError, ValidationError } from "../shared/Validator";
import { addCorsHeader } from "../shared/Utils";
import { subscribeToRoom } from "./subscribe";
import { contactOwner } from "./contactOwner";


const ddbClient = new DynamoDBClient({});

async function handler(event: APIGatewayProxyEvent, context: Context): Promise<APIGatewayProxyResult> {

    let response: APIGatewayProxyResult;

    try {
        const path = event.resource || event.path;
        if (path.endsWith('/subscribe')) {
            if (event.httpMethod !== 'POST') throw new Error('Method not allowed');
            response = await subscribeToRoom(event);
        } else if (path.endsWith('/contact')) {
            if (event.httpMethod !== 'POST') throw new Error('Method not allowed');
            response = await contactOwner(event, ddbClient);
        } else {
            switch (event.httpMethod) {
                case 'GET':
                    response = await getRooms(event, ddbClient);
                    break;
                case 'POST':
                    response = await postRooms(event, ddbClient);
                    break;
                case 'PUT':
                    response = await updateRoom(event, ddbClient);
                    break;
                case 'DELETE':
                    response = await deleteRoom(event, ddbClient);
                    break;
                default:
                    throw new Error('Unsupported route');
            }
        }
    } catch (error) {
        if (error instanceof MissingFieldError) {
            return {
                statusCode: 400,
                body: error.message
            }
        }
        if (error instanceof JsonError) {
            return {
                statusCode: 400,
                body: error.message
            }
        }
        if (error instanceof ValidationError) {
            return {
                statusCode: 400,
                body: error.message
            }
        }
        return {
            statusCode: 500,
            body: error.message
        }
    }

    addCorsHeader(response);

    return response;
}

export { handler }
