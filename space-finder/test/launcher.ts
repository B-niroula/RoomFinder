import { handler } from "../src/services/spaces/handler";


process.env.AWS_REGION = "us-west-1";
process.env.TABLE_NAME = 'SpacesTable-0230718136b5'

handler({
    httpMethod: 'PUT',
    queryStringParameters: {
        id: 'fbe76aea-5aff-434e-85f6-e8f5fc1647ec'
    },
    body: JSON.stringify({
        location: 'Best location 2'
    })
} as any , {} as any).then(result =>{
    console.log(result)
});