import { Duration } from 'aws-cdk-lib';
import { HttpApi, HttpMethod, HttpNoneAuthorizer } from 'aws-cdk-lib/aws-apigatewayv2';
import { HttpLambdaIntegration } from 'aws-cdk-lib/aws-apigatewayv2-integrations';
import { ITableV2 } from 'aws-cdk-lib/aws-dynamodb';
import { Runtime } from 'aws-cdk-lib/aws-lambda';
import { NodejsFunction } from 'aws-cdk-lib/aws-lambda-nodejs';
import { LogGroup, RetentionDays } from 'aws-cdk-lib/aws-logs';
import { Construct } from 'constructs';

interface CustomLambdaProps {
  functionName: string;
  description: string;
  localPath: string;
  memorySize?: number;
  handler?: string;
  logRetention?: RetentionDays;
  runtime?: Runtime;
  timeout?: Duration;
  dynamoTable?: ITableV2;
  dynamoDbPermissions?: 'read' | 'write' | 'readwrite';
  api?: {
    routePath: string;
    methods: HttpMethod[];
    httpApi: HttpApi;
  };
  isPublicRoute?: boolean;
}

export class CustomLambda extends Construct {
  public readonly lambda: NodejsFunction;

  constructor(scope: Construct, id: string, props: CustomLambdaProps) {
    super(scope, id);

    // Create a log group for this lambda
    const logGroup = new LogGroup(this, `${props.functionName}_LogGroup`, {
      retention: props.logRetention ?? RetentionDays.TWO_WEEKS,
    });

    // Create the lambda function
    this.lambda = new NodejsFunction(this, `${props.functionName}_Lambda`, {
      description: props.description,
      memorySize: props.memorySize ?? 512,
      functionName: props.functionName,
      handler: props.handler ?? 'handler',
      entry: props.localPath,
      runtime: props.runtime ?? Runtime.NODEJS_20_X,
      timeout: props.timeout ?? Duration.seconds(30),
      logGroup,
      environment: {
        DYNAMO_TABLE_NAME: props.dynamoTable?.tableName ?? '',
      },
    });

    // If we have an API, configure the routes
    if (props.api) {
      // All routes are protected by default. If we have a public route, attach the "no authorizer"
      // to this end point to make it public.
      const noAuthorizer: HttpNoneAuthorizer | undefined =
        props.isPublicRoute ? new HttpNoneAuthorizer() : undefined;

      // Add our routes.
      props.api.httpApi.addRoutes({
        path: props.api.routePath,
        integration: new HttpLambdaIntegration(`${props.functionName}_RouteIntegration`, this.lambda),
        methods: props.api.methods,
        authorizer: noAuthorizer,
      });
    }

    // Do we need to connect to Dynamo?
    if (props.dynamoTable && props.dynamoDbPermissions) {
      // Allow read only access
      if (props?.dynamoDbPermissions === 'read') {
        props.dynamoTable.grantReadData(this.lambda);
      }

      // Allow write-only access
      if (props?.dynamoDbPermissions === 'write') {
        props.dynamoTable.grantWriteData(this.lambda);
      }

      // Allow read-write access
      if (props?.dynamoDbPermissions === 'readwrite') {
        props.dynamoTable.grantReadWriteData(this.lambda);
      }
    }
  }
}