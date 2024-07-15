import { Duration, RemovalPolicy, Stack, StackProps } from 'aws-cdk-lib';
import { ICertificate } from 'aws-cdk-lib/aws-certificatemanager';
import { AllowedMethods, Distribution, HttpVersion, IDistribution, OriginAccessIdentity, ViewerProtocolPolicy } from 'aws-cdk-lib/aws-cloudfront';
import { S3Origin } from 'aws-cdk-lib/aws-cloudfront-origins';
import { ARecord, CnameRecord, HostedZone, IHostedZone, RecordTarget } from 'aws-cdk-lib/aws-route53';
import { CloudFrontTarget } from 'aws-cdk-lib/aws-route53-targets';
import { BlockPublicAccess, Bucket, IBucket } from 'aws-cdk-lib/aws-s3';
import { Construct } from 'constructs';

export interface S3WebsiteStackProps extends StackProps {
  appUrl: string;
  certificate: ICertificate;
  hostedZoneId: string;
  hostedZoneName: string;
}

export class S3WebsiteStack extends Stack {
  constructor(scope: Construct, id: string, props: S3WebsiteStackProps) {
    super(scope, id, props);

    // Obtain a reference to the hosted zone.
    const hostedZone: IHostedZone = HostedZone.fromHostedZoneAttributes(this, 'HostedZone', {
      hostedZoneId: props.hostedZoneId,
      zoneName: props.hostedZoneName,
    });

    // Create an S3 bucket (website contents).
    const bucket: IBucket = new Bucket(this, 'FrontEndWebsiteBucket', {
      blockPublicAccess: BlockPublicAccess.BLOCK_ALL,
      removalPolicy: RemovalPolicy.DESTROY,
      autoDeleteObjects: true,
    });

    // Create an Origin Access Identity (OAI).
    const originAccessIdentity = new OriginAccessIdentity(this, 'OAI', {
      comment: 'OAI for S3 website',
    });

    // Grant read permissions to the OAI
    bucket.grantRead(originAccessIdentity);

    // Create a Cloudfront Distribution
    const distribution: IDistribution = new Distribution(this, 'FrontEndWebsiteDistribution', {
      comment: `Distribution for the ${props.appUrl} website`,
      defaultBehavior: {
        origin: new S3Origin(bucket, {
          originAccessIdentity,
        }),
        allowedMethods: AllowedMethods.ALLOW_ALL,
        viewerProtocolPolicy: ViewerProtocolPolicy.REDIRECT_TO_HTTPS,
      },
      errorResponses: [
        {
          httpStatus: 404,
          responseHttpStatus: 200,
          responsePagePath: '/index.html',
          ttl: Duration.days(30),
        },
      ],
      domainNames: [
        props.appUrl,
        `www.${props.appUrl}`,
      ],
      certificate: props.certificate,
      httpVersion: HttpVersion.HTTP2,
      defaultRootObject: 'index.html',
    });

    // Create an A record in Route53
    new ARecord(this, 'FrontEndWebsiteApexRecord', {
      zone: hostedZone,
      target: RecordTarget.fromAlias(new CloudFrontTarget(distribution)),
      recordName: props.appUrl,
    });

    // Redirect www to apex.
    new CnameRecord(this, 'FrontEndWebsiteCnameRecord', {
      zone: hostedZone,
      recordName: `www.${props.appUrl}`,
      domainName: distribution.distributionDomainName,
    });
  }
}