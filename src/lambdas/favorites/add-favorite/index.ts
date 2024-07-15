import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import { DynamoDBDocumentClient, PutCommand } from '@aws-sdk/lib-dynamodb';
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
  userId: Joi.string().required(),
  campgroundId: Joi.string().guid({ version: ['uuidv4'] }).required(),
  parkId: Joi.string().required(),
  campgroundName: Joi.string().required(),
  campgroundImageAltText: Joi.string().allow(''),
  campgroundImageUrl: Joi.string().allow(''),
  campgroundUrl: Joi.string().allow(''),
  parkName: Joi.string().required(),
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
  const putParams = {
    TableName: tableName,
    Item: {
      pk: `USER#${xss(body.userId)}`,
      sk: `FAV_SITE#${xss(body.campgroundId)}`,
      campgroundName: xss(body.campgroundName),
      campgroundId: xss(body.campgroundId),
      campgroundUrl: xss(body.url),
      campgroundImageAltText: xss(body.campgroundImageAltText),
      campgroundImageUrl: xss(body.campgroundImageUrl),
      parkName: xss(body.parkName),
      parkId: xss(body.parkId),
      userId: xss(body.userId),
    },
  };

  try {
    await ddbDocClient.send(new PutCommand(putParams));
    return handleResponse({ message: 'Success' });
  } catch (error: unknown) {
    const message = (error instanceof Error) ? error.message : String(error);

    return handleError(message);
  }
};
