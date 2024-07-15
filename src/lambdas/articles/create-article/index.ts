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
  parkCode: Joi.string().required(),
  id: Joi.string().guid({ version: ['uuidv4'] }).required(),
  url: Joi.string().uri().required(),
  title: Joi.string().required(),
  listingDescription: Joi.string().required(),
  listingImageUrl: Joi.string().allow(''),
  altText: Joi.string().when('listingImageUrl', {
    is: Joi.exist(),
    then: Joi.required(),
    otherwise: Joi.optional(),
  }),
  latitude: Joi.number().allow(''),
  longitude: Joi.number().allow(''),
  tags: Joi.array().items(Joi.string().required()).optional(),
  credit: Joi.string().allow(''),
});

// Handler function
export const handler: APIGatewayProxyHandler = async (event: APIGatewayProxyEvent) => {
  console.log(event);
  const body = event.body ? JSON.parse(event.body) : {};
  const { error, value } = schema.validate(body);

  if (error) {
    return handleError(`Validation error: ${error.message}`, 400);
  }

  return handlePost(value);
};

// Function to handle POST requests
const handlePost = async (data: any): Promise<APIGatewayProxyResult> => {
  const putParams = {
    TableName: tableName,
    Item: {
      pk: `PARK#${xss(data.parkCode)}`,
      sk: `ARTICLE#${xss(data.id)}`,
      parkCode: xss(data.parkCode),
      id: xss(data.id),
      url: xss(data.url),
      title: xss(data.title),
      listingDescription: xss(data.listingDescription),
      listingImageUrl: xss(data.listingImageUrl),
      altText: xss(data.altText),
      latitude: xss(data.latitude).toString(),
      longitude: xss(data.longitude).toString(),
      tags: data.tags.map((tag: string) => xss(tag)),
      credit: xss(data.credit),
      entity: 'article',
    },
  };

  try {
    await ddbDocClient.send(new PutCommand(putParams));
    return handleResponse({ message: 'Success' }, 'POST');
  } catch (error: unknown) {
    const message = (error instanceof Error) ? error.message : String(error);

    return handleError(message);
  }
};
