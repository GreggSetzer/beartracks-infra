import { Duration, Stack, StackProps } from 'aws-cdk-lib';
import { ApiMapping, CorsHttpMethod, HttpApi, HttpMethod, IDomainName } from 'aws-cdk-lib/aws-apigatewayv2';
import { HttpJwtAuthorizer } from 'aws-cdk-lib/aws-apigatewayv2-authorizers';
import { HttpLambdaIntegration } from 'aws-cdk-lib/aws-apigatewayv2-integrations';
import { ITableV2 } from 'aws-cdk-lib/aws-dynamodb';
import { ARecord, HostedZone, IHostedZone, RecordTarget } from 'aws-cdk-lib/aws-route53';
import { ApiGatewayv2DomainProperties } from 'aws-cdk-lib/aws-route53-targets';
import { Construct } from 'constructs';
import path from 'path';
import { CustomLambda } from '../constructs/CustomLambda';

export interface ApiStackProps extends StackProps {
  envName: 'dev' | 'prod';
  appName: string;
  domainName: IDomainName;
  issuer: string;
  audience: string;
  hostedZoneId: string;
  hostedZoneName: string;
  dnsRecordName: string;
  dynamoTable: ITableV2;
  corsOrigins?: string[];
}

export class ApiStack extends Stack {
  constructor(scope: Construct, id: string, props: ApiStackProps) {
    super(scope, id, props);

    // Define a default lambda used for any invalid requests.
    const defaultLambda: CustomLambda = new CustomLambda(this, 'DefaultLambda', {
      functionName: 'Default',
      description: 'Used as the default fallback lambda for all invalid requests.',
      localPath: path.join(__dirname, '..', 'lambdas', 'default', 'index.ts'),
    });

    // Define a JWT authorizer. Auth0 - OKTA
    const jwtAuthorizer = new HttpJwtAuthorizer('Authorizer', props.issuer, {
      jwtAudience: [props.audience],
    });

    // Create our API Gateway API - http api
    const httpApi: HttpApi = new HttpApi(this, 'HttpApi', {
      apiName: `${props.appName} API`,
      description: `API for ${props.appName}`,
      defaultIntegration: new HttpLambdaIntegration('DefaultIntegration', defaultLambda.lambda),
      disableExecuteApiEndpoint: true,
      defaultAuthorizer: jwtAuthorizer,
      corsPreflight: {
        allowHeaders: ['Content-Type', 'Authorization'],
        allowMethods: [
          CorsHttpMethod.OPTIONS,
          CorsHttpMethod.GET,
          CorsHttpMethod.POST,
          CorsHttpMethod.HEAD,
          CorsHttpMethod.DELETE,
        ],
        allowOrigins: props.corsOrigins ?? ['*'],
        maxAge: Duration.days(10),
      },
    });

    // Create an API GW stage
    httpApi.addStage(`ApiGatewayStage_${props.envName}`, {
      stageName: props.envName,
      autoDeploy: props.envName === 'dev',
      domainMapping: {
        domainName: props.domainName,
        mappingKey: props.envName,
      },
      throttle: {
        rateLimit: 5,
        burstLimit: 5,
      },
    });

    // We'll need to associate the Http API to the custom domain. This is how we
    // get the API end points loading through the domain.
    new ApiMapping(this, 'ApiMapping', {
      api: httpApi,
      domainName: props.domainName,
      stage: httpApi.defaultStage,
    });

    // Get a reference to the hosted zone.
    const hostedZone: IHostedZone = HostedZone.fromHostedZoneAttributes(this, 'HostedZone', {
      hostedZoneId: props.hostedZoneId,
      zoneName: props.hostedZoneName,
    });

    // We'll need to configure a "target", used with Route53. This helps to associate
    // our API GW with our hosted zone in Route 53.
    const { regionalDomainName, regionalHostedZoneId } = props.domainName;
    const target = RecordTarget.fromAlias(
      new ApiGatewayv2DomainProperties(regionalDomainName, regionalHostedZoneId),
    );

    // Associate the API Gateway to our hosted zone in Route 53.
    new ARecord(this, 'ARecord', {
      zone: hostedZone,
      target,
      recordName: props.dnsRecordName,
      deleteExisting: true,
    });

    // We'll create a bunch of lambdas.

    // Get All Parks lambda
    new CustomLambda(this, 'GetAllParksLambda', {
      functionName: 'GetAllParks',
      description: 'Retrieves all national parks from our database',
      localPath: path.join(__dirname, '..', 'lambdas', 'parks', 'get-parks', 'index.ts'),
      api: {
        routePath: '/parks',
        methods: [HttpMethod.GET],
        httpApi,
      },
      dynamoDbPermissions: 'read',
      dynamoTable: props.dynamoTable,
      isPublicRoute: true,
    });

    // Create a new national park item
    new CustomLambda(this, 'CreateParkLambda', {
      functionName: 'CreatePark',
      description: 'Create a new national park in our database',
      localPath: path.join(__dirname, '..', 'lambdas', 'parks', 'create-park', 'index.ts'),
      api: {
        routePath: '/parks',
        methods: [HttpMethod.POST],
        httpApi,
      },
      dynamoDbPermissions: 'write',
      dynamoTable: props.dynamoTable,
    });

    // Get All Articles lambda
    new CustomLambda(this, 'GetAllArticlesLambda', {
      functionName: 'GetAllArticles',
      description: 'Retrieves all articles from our database',
      localPath: path.join(__dirname, '..', 'lambdas', 'articles', 'get-articles', 'index.ts'),
      api: {
        routePath: '/articles',
        methods: [HttpMethod.GET],
        httpApi,
      },
      dynamoDbPermissions: 'read',
      dynamoTable: props.dynamoTable,
      isPublicRoute: true,
    });

    // Create a new article item
    new CustomLambda(this, 'CreateArticleLambda', {
      functionName: 'CreateArticle',
      description: 'Create a new article in our database',
      localPath: path.join(__dirname, '..', 'lambdas', 'articles', 'create-article', 'index.ts'),
      api: {
        routePath: '/articles',
        methods: [HttpMethod.POST],
        httpApi,
      },
      dynamoDbPermissions: 'write',
      dynamoTable: props.dynamoTable,
    });

    // Get Featured Park Lambda
    new CustomLambda(this, 'FeaturedLambda', {
      functionName: 'Featured',
      description: 'Retrieves all data to be used on the home page for a given park code.',
      localPath: path.join(__dirname, '..', 'lambdas', 'features', 'featured', 'index.ts'),
      api: {
        routePath: '/featured',
        methods: [HttpMethod.GET],
        httpApi,
      },
      dynamoDbPermissions: 'read',
      dynamoTable: props.dynamoTable,
      isPublicRoute: true,
    });

    // Create Campsite lambda
    new CustomLambda(this, 'CreateCampsiteLambda', {
      functionName: 'CreateCampsite',
      description: 'Creates a new campsite item.',
      localPath: path.join(__dirname, '..', 'lambdas', 'campsites', 'create-campsite', 'index.ts'),
      api: {
        routePath: '/campsites',
        methods: [HttpMethod.POST],
        httpApi,
      },
      dynamoDbPermissions: 'write',
      dynamoTable: props.dynamoTable,
    });

    // Get Campsites lambda
    new CustomLambda(this, 'GetCampsitesLambda', {
      functionName: 'GetCampsite',
      description: 'Retrieves a list of campsites for a given park code.',
      localPath: path.join(__dirname, '..', 'lambdas', 'campsites', 'get-campsites', 'index.ts'),
      api: {
        routePath: '/campsites',
        methods: [HttpMethod.GET],
        httpApi,
      },
      dynamoDbPermissions: 'read',
      dynamoTable: props.dynamoTable,
      isPublicRoute: true,
    });

    // Add favorite lambda
    new CustomLambda(this, 'AddFavoriteLambda', {
      functionName: 'AddFavorite',
      description: 'Creates a favorite campsite for a user.',
      localPath: path.join(__dirname, '..', 'lambdas', 'favorites', 'add-favorite', 'index.ts'),
      api: {
        routePath: '/favorites',
        methods: [HttpMethod.POST],
        httpApi,
      },
      dynamoDbPermissions: 'write',
      dynamoTable: props.dynamoTable,
    });

    // Remove favorite lambda
    new CustomLambda(this, 'RemoveFavoriteLambda', {
      functionName: 'RemoveFavorite',
      description: 'Removes a favorite campsite for a user.',
      localPath: path.join(__dirname, '..', 'lambdas', 'favorites', 'remove-favorite', 'index.ts'),
      api: {
        routePath: '/favorites',
        methods: [HttpMethod.DELETE],
        httpApi,
      },
      dynamoDbPermissions: 'write',
      dynamoTable: props.dynamoTable,
    });

    // Get Favorites lambda
    new CustomLambda(this, 'GetFavoritesLambda', {
      functionName: 'GetFavorites',
      description: 'Retrieves all favorite campsites for a user.',
      localPath: path.join(__dirname, '..', 'lambdas', 'favorites', 'get-favorites', 'index.ts'),
      api: {
        routePath: '/favorites',
        methods: [HttpMethod.GET],
        httpApi,
      },
      dynamoDbPermissions: 'read',
      dynamoTable: props.dynamoTable,
    });

    // Finally, we'll create a special lambda for working with CORS and OPTIONS.
    new CustomLambda(this, 'OptionsLambda', {
      functionName: 'Options',
      description: 'CORS lambda for options preflight requests.',
      localPath: path.join(__dirname, '..', 'lambdas', 'options', 'index.ts'),
      api: {
        routePath: '/{proxy+}',
        methods: [HttpMethod.OPTIONS],
        httpApi,
      },
      isPublicRoute: true,
    });
  }
}