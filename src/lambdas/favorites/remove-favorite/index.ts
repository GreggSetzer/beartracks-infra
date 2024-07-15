import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import { DeleteCommand, DynamoDBDocumentClient } from '@aws-sdk/lib-dynamodb';
import { APIGatewayProxyEvent, APIGatewayProxyHandler, APIGatewayProxyResult } from 'aws-lambda';
import Joi from 'joi';
import xss from 'xss';
import { handleError, handleResponse } from '../../common/utils';

// Initialize DynamoDB client
const client: DynamoDBClient = new DynamoDBClient({});
const ddbDocClient: DynamoDBDocumentClient = DynamoDBDocumentClient.from(client);

// Environment variable for the DynamoDB table name
const tableName = process.env.DYNAMO_TABLE_NAME!;

// Defines the acceptable JSON schema for the request payload
const schema = Joi.object({
  campgroundId: Joi.string().guid({ version: ['uuidv4'] }).required(),
  userId: Joi.string().required(),
});

// Handler function
export const handler: APIGatewayProxyHandler = async (event: APIGatewayProxyEvent) => {
  console.log(event);
  const body = event.body ? JSON.parse(event.body) : {};
  const { error } = schema.validate(body);

  if (error) {
    return handleError(`Validation error: ${error.message}`, 400);
  }

  return handlePost(body);
};

// Function to handle POST requests
const handlePost = async (body: any): Promise<APIGatewayProxyResult> => {
  const deleteParams = {
    TableName: tableName,
    Key: {
      pk: `USER#${xss(body.userId)}`,
      sk: `FAV_SITE#${xss(body.campgroundId)}`,
    },
  };

  try {
    await ddbDocClient.send(new DeleteCommand(deleteParams));
    return handleResponse({ message: 'Success' });
  } catch (error: unknown) {
    const message = (error instanceof Error) ? error.message : String(error);

    return handleError(message);
  }
};
