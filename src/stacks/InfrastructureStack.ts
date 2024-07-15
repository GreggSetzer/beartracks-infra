import { RemovalPolicy, Stack, StackProps } from 'aws-cdk-lib';
import { DomainName, IDomainName } from 'aws-cdk-lib/aws-apigatewayv2';
import { Certificate, CertificateValidation, ICertificate } from 'aws-cdk-lib/aws-certificatemanager';
import { AttributeType, ITableV2, TableV2 } from 'aws-cdk-lib/aws-dynamodb';
import { HostedZone, IHostedZone } from 'aws-cdk-lib/aws-route53';
import { Construct } from 'constructs';

export interface InfrastructureStackProps extends StackProps {
  hostedZoneId: string;
  hostedZoneName: string;
  appName: string;
  appUrl: string;
  apiUrl: string;
  dynamoTableName?: string;
}

export class InfrastructureStack extends Stack {
  public readonly domainName: IDomainName;
  public readonly dynamoTable: ITableV2;
  public readonly certificate: ICertificate;

  constructor(scope: Construct, id: string, props: InfrastructureStackProps) {
    super(scope, id, props);

    // Obtain a reference to the hosted zone.
    const hostedZone: IHostedZone = HostedZone.fromHostedZoneAttributes(this, 'HostedZone', {
      hostedZoneId: props.hostedZoneId,
      zoneName: props.hostedZoneName,
    });

    // Create an SSL Certificate
    this.certificate = new Certificate(this, 'Certificate', {
      domainName: props.hostedZoneName,
      certificateName: `${props.appName} App`,
      validation: CertificateValidation.fromDns(hostedZone),
      subjectAlternativeNames: [
        props.apiUrl,
        props.appUrl,
        `www.${props.appUrl}`,
      ],
    });

    // Define the API Gateway Domain Name
    this.domainName = new DomainName(this, 'DomainName', {
      domainName: props.apiUrl,
      certificate: this.certificate,
    });

    // Define the DynamoDB table.
    this.dynamoTable = new TableV2(this, 'Table', {
      tableName: props.dynamoTableName ?? 'beartracks',
      partitionKey: { name: 'pk', type: AttributeType.STRING },
      sortKey: { name: 'sk', type: AttributeType.STRING },
      deletionProtection: false,
      removalPolicy: RemovalPolicy.DESTROY,
    });
  }
}