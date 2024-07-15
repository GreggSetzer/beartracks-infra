import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import { DynamoDBDocumentClient, PutCommand } from '@aws-sdk/lib-dynamodb';
import { APIGatewayProxyEvent, APIGatewayProxyHandler, APIGatewayProxyResult } from 'aws-lambda';
import xss from 'xss';
import { schema } from './schema';
import { handleError, handleResponse, sanitizeObject } from '../../common/utils';

// Initialize DynamoDB client
const client: DynamoDBClient = new DynamoDBClient({});
const ddbDocClient: DynamoDBDocumentClient = DynamoDBDocumentClient.from(client);

// Environment variable for the DynamoDB table name
const tableName = process.env.DYNAMO_TABLE_NAME!;

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
const handlePost = async (data: any): Promise<APIGatewayProxyResult> => {
  const sanitizeWithXss = sanitizeObject(xss);

  const putParams = {
    TableName: tableName,
    Item: {
      pk: `PARK#${xss(data.parkCode)}`,
      sk: `CAMPSITE#${xss(data.id)}`,
      id: xss(data.id),
      url: xss(data.url),
      name: xss(data.name),
      parkCode: xss(data.parkCode),
      description: xss(data.description),
      latitude: xss(data.latitude),
      longitude: xss(data.longitude),
      reservationInfo: xss(data.reservationInfo),
      reservationUrl: xss(data.reservationUrl),
      regulationsUrl: xss(data.regulationsurl),
      regulationsOverview: xss(data.regulationsOverview),
      directionsOverview: xss(data.directionsOverview),
      directionsUrl: xss(data.directionsUrl),
      weatherOverview: xss(data.weatherOverview),
      numberOfSitesReservable: xss(data.numberOfSitesReservable),
      numberOfSitesFirstComeFirstServe: xss(data.numberOfSitesFirstComeFirstServe),
      designation: xss(data.designation),
      directionsInfo: xss(data.directionsInfo),
      ext: xss(data.ext),
      fullName: xss(data.fullName),
      phoneNumber: xss(data.phoneNumber),
      weatherInfo: xss(data.weatherInfo),
      entity: 'campsite',
      images: sanitizeWithXss(data.images),
      amenities: sanitizeWithXss(data.amenities),
      contacts: sanitizeWithXss(data.contacts),
      fees: sanitizeWithXss(data.fees),
      operatingHours: sanitizeWithXss(data.operatingHours),
      addresses: sanitizeWithXss(data.addresses),
      campsites: sanitizeWithXss(data.campsites),
      accessibility: sanitizeWithXss(data.accessibility),
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
