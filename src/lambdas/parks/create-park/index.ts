import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import { DynamoDBDocumentClient, PutCommand } from '@aws-sdk/lib-dynamodb';
import { APIGatewayProxyEvent, APIGatewayProxyHandler, APIGatewayProxyResult } from 'aws-lambda';
import Joi from 'joi';
import { handleError, handleResponse } from '../../common/utils';

// Initialize DynamoDB client
const client: DynamoDBClient = new DynamoDBClient({});
const ddbDocClient: DynamoDBDocumentClient = DynamoDBDocumentClient.from(client);

// Environment variable for the DynamoDB table name
const tableName = process.env.DYNAMO_TABLE_NAME!;

// Defines the acceptable JSON schema for the request payload
const schema = Joi.object({
  description: Joi.string().required(),
  designation: Joi.string().required(),
  directionsInfo: Joi.string().required(),
  directionsUrl: Joi.string().uri().required(),
  email: Joi.string().email().required(),
  ext: Joi.string().allow(''),
  fullName: Joi.string().required(),
  id: Joi.string().guid({ version: ['uuidv4'] }).required(),
  latitude: Joi.number().required(),
  longitude: Joi.number().required(),
  name: Joi.string().required(),
  parkCode: Joi.string().required(),
  phoneNumber: Joi.string().pattern(/^[0-9]{10,15}$/).required(),
  url: Joi.string().uri().required(),
  weatherInfo: Joi.string().required(),
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
      pk: 'PARK',
      sk: `PARK#${body.parkCode}`,
      description: body.description,
      designation: body.designation,
      directionsInfo: body.directionsInfo,
      directionsUrl: body.directionsUrl,
      email: body.email,
      ext: body.ext,
      fullName: body.fullName,
      id: body.id,
      latitude: body.latitude,
      longitude: body.longitude,
      name: body.name,
      parkCode: body.parkCode,
      phoneNumber: body.phoneNumber,
      url: body.url,
      weatherInfo: body.weatherInfo,
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
