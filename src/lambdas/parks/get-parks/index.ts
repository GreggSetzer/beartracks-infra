import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import { DynamoDBDocumentClient, paginateQuery } from '@aws-sdk/lib-dynamodb';
import { APIGatewayProxyHandler, APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda';
import { handleError, handleResponse } from '../../common/utils';

// Initialize DynamoDB client
const client: DynamoDBClient = new DynamoDBClient({});
const ddbDocClient: DynamoDBDocumentClient = DynamoDBDocumentClient.from(client);

// Environment variable for the DynamoDB table name
const tableName = process.env.DYNAMO_TABLE_NAME!;

// Handler function
export const handler: APIGatewayProxyHandler = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
  console.log(event);

  return getAllParks();
};

// Function to get all parks
const getAllParks = async (): Promise<APIGatewayProxyResult> => {
  const queryParams = {
    TableName: tableName,
    KeyConditionExpression: '#pk = :pkValue AND begins_with(#sk, :skPrefix)',
    ExpressionAttributeNames: {
      '#pk': 'pk',
      '#sk': 'sk',
    },
    ExpressionAttributeValues: {
      ':pkValue': 'PARK',
      ':skPrefix': 'DETAILS#',
    },
  };

  try {
    const paginatorConfig = {
      client: ddbDocClient,
      pageSize: 50,
    };

    const paginator = paginateQuery(paginatorConfig, queryParams);

    let items: any[] = [];
    for await (const page of paginator) {
      items = items.concat(page.Items);
    }

    items.sort((a, b) => a.name.localeCompare(b.name));

    return handleResponse({ items });
  } catch (error: unknown) {
    const message = (error instanceof Error) ? error.message : String(error);

    return handleError(message);
  }
};
