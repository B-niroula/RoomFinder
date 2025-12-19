import { Stack, StackProps } from 'aws-cdk-lib';
import { LambdaIntegration } from 'aws-cdk-lib/aws-apigateway';
import { ITable } from 'aws-cdk-lib/aws-dynamodb';
import { Effect, PolicyStatement } from 'aws-cdk-lib/aws-iam';
import { Runtime } from 'aws-cdk-lib/aws-lambda';
import { NodejsFunction } from 'aws-cdk-lib/aws-lambda-nodejs';
import { Construct } from 'constructs';
import { join } from 'path';
import { ITopic } from 'aws-cdk-lib/aws-sns';

interface LambdaStackProps extends StackProps {
    spacesTable: ITable;
    notificationsTopic: ITopic;
}

export class LambdaStack extends Stack {

    public readonly spacesLambdaIntegration: LambdaIntegration;

    constructor(scope: Construct, id: string, props: LambdaStackProps) {
        super(scope, id, props);

        const spacesLambda = new NodejsFunction(this, 'SpacesLambda', {
            runtime: Runtime.NODEJS_18_X,
            handler: 'handler',
            entry: (join(__dirname, '..','..','services','rooms','handler.ts')),
            environment: {
                TABLE_NAME: props.spacesTable.tableName,
                NOTIFICATIONS_TOPIC_ARN: props.notificationsTopic.topicArn
            }
        });

        spacesLambda.addToRolePolicy(new PolicyStatement({
            effect: Effect.ALLOW,
            resources: [props.spacesTable.tableArn],
            actions:[
                'dynamodb:PutItem',
                'dynamodb:Scan',
                'dynamodb:GetItem',
                'dynamodb:UpdateItem',
                'dynamodb:DeleteItem'
            ]
        }))

        spacesLambda.addToRolePolicy(new PolicyStatement({
            effect: Effect.ALLOW,
            resources: [props.notificationsTopic.topicArn],
            actions: [
                'sns:Publish'
            ]
        }));
        spacesLambda.addToRolePolicy(new PolicyStatement({
            effect: Effect.ALLOW,
            resources: ['*'],
            actions: [
                'sns:Publish'
            ]
        }));

        this.spacesLambdaIntegration = new LambdaIntegration(spacesLambda);
    }
}
