# BearTracks Infrastructure

BearTracks Infrastructure is a TypeScript-based AWS CDK (Cloud Development Kit) project that sets up the backend infrastructure for the BearTracks application. This project includes stacks for API Gateway, Lambda functions, DynamoDB, S3, CloudFront, and Route 53 to provide a robust and scalable infrastructure as code (IaC) solution.

## Project Overview

The BearTracks Infrastructure project is designed to deploy and manage the backend services required for the BearTracks application. By leveraging AWS services and the AWS CDK, we ensure that our infrastructure is easily reproducible, maintainable, and scalable.

### Key Components

1. **Infrastructure Stack**: Sets up the foundational resources such as DynamoDB, API Gateway domain names, and SSL certificates.
2. **API Stack**: Configures API Gateway, Lambda functions, and necessary integrations for handling application logic.
3. **S3 Website Stack**: Manages the S3 bucket, CloudFront distribution, and Route 53 records for serving the front-end application.

## Getting Started

### Prerequisites

- AWS CLI configured with appropriate credentials.
- Node.js and npm installed.
- AWS CDK installed globally (`npm install -g aws-cdk`).

### Setting Up the Project

1. **Clone the repository:**
   ```bash
   git clone https://github.com/your-repo/beartracks-infra.git
   cd beartracks-infra
   ```
2 **Install dependencies**
   ```bash
   yarn
   ```
3 **Bootstrap the CDK environment:**
   ```bash
   yarn cdk bootstrap
   ```

3 **Deploy the stacks:**
   ```bash
   # List the stacks
   cdk ls
   
   # Deploy in this order:
   yarn cdk deploy BearTracksInfra
   yarn cdk deploy BearTracksApi
   yarn cdk deploy BearTracksFrontEnd
   ```

## Key Files and Directories

- **main.ts:** Entry point for defining and synthesizing the CDK app.
- **constants.ts:** Contains constant values used across the stacks.
- **projenrc.js:** Configuration file for Projen, used to manage project setup and dependencies.
- **stacks/:** Contains the CDK stack definitions and constructs.
- **lambdas/:** Contains the lambdas for the serverless APIs.
- **constructs/:** Contains custom constructs such as the CustomLambda construct.

## Using Projen

Projen is a tool that helps to manage JavaScript projects by generating and maintaining 
configuration files and dependencies. In this project, Projen is used to set up and 
maintain the CDK project configuration.

Learn more at [projen.io](https://www.projen.io)

## Infrastructure Details
### Infrastructure Stack
The InfrastructureStack defines the foundational resources required for the BearTracks 
application, including:

- **DynamoDB Table:** Stores application data.
- **SSL Certificate:** Used for securing the API and front-end with HTTPS.
- **API Gateway Domain Name:** Custom domain for the API Gateway.

### API Stack

The ApiStack sets up the API Gateway and Lambda functions that handle the application logic. Key 
components include:

- **JWT Authorizer:** Authenticates requests using Auth0 from OKTA.
- **Custom Lambdas:** Lambda functions for various application endpoints (e.g., parks, articles, campsites, favorites).

### S3 Website Stack

The S3WebsiteStack configures the resources for serving the front-end application:

- **S3 Bucket:** Stores the front-end assets.
- **CloudFront Distribution:** Distributes the front-end assets globally with low latency.
- **Route 53 Records:** Configures DNS records for the custom domain.

### Application Constants

The project relies on several configuration variables defined in the constants.ts file. 
Make sure to update the constants.ts file and fill in the required values.

### Conclusion

The BearTracks Infrastructure project shows how you can use the AWS CDK and Projen, to 
ensure a scalable, maintainable, and reproducible infrastructure setup. For more detailed 
information, refer to the AWS CDK documentation and the inline comments in the code.