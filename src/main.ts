import { App } from 'aws-cdk-lib';
import {
  API_URL,
  APP_NAME,
  APP_URL,
  AUTH0_AUDIENCE,
  AUTH0_ISSUER,
  CORS_ORIGINS,
  DEV_ENV,
  DNS_RECORD_NAME,
  HOSTED_ZONE_ID,
  HOSTED_ZONE_NAME,
} from './constants';
import { ApiStack } from './stacks/ApiStack';
import { InfrastructureStack } from './stacks/InfrastructureStack';
import { S3WebsiteStack } from './stacks/S3WebsiteStack';

const app = new App();

const infraStack = new InfrastructureStack(app, 'BearTracksInfra', {
  env: DEV_ENV,
  apiUrl: API_URL,
  appName: APP_NAME,
  appUrl: APP_URL,
  hostedZoneId: HOSTED_ZONE_ID,
  hostedZoneName: HOSTED_ZONE_NAME,
});

new ApiStack(app, 'BearTracksApi', {
  env: DEV_ENV,
  envName: 'dev',
  appName: APP_NAME,
  domainName: infraStack.domainName,
  dynamoTable: infraStack.dynamoTable,
  hostedZoneId: HOSTED_ZONE_ID,
  hostedZoneName: HOSTED_ZONE_NAME,
  dnsRecordName: DNS_RECORD_NAME,
  corsOrigins: CORS_ORIGINS,
  audience: AUTH0_AUDIENCE,
  issuer: AUTH0_ISSUER,
});

new S3WebsiteStack(app, 'BearTracksFrontEnd', {
  env: DEV_ENV,
  certificate: infraStack.certificate,
  hostedZoneId: HOSTED_ZONE_ID,
  hostedZoneName: HOSTED_ZONE_NAME,
  appUrl: APP_URL,
});

app.synth();