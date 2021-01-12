# Civifile

Civifile is designed to help families who are seeking permanent supportive housing. Civifile facilitates the storage and sharing of personal documents with case managers and relevant City agencies in a way that is both easy and secure.

## Getting Started

This repository uses yarn and yarn workspaces.

Follow [instructions here](https://classic.yarnpkg.com/en/docs/install/) to install yarn on your system

Install all local dependencies via

```bash
yarn
```

Run tests for all packages

```bash
yarn test
```

Build all packages

```bash
yarn build
```

## Creating a new Package (i.e. adding to the packages/ directory)

Create the new folder and move to it

```bash
mkdir -p packages/hello-world-lambda && cd packages/hello-world-lambda
```

Initialise the package

```bash
yarn init
```

and follow the prompts.

If you're using tools such as vue cli to bootstrap a project, after project set up you will need to execute the yarn commands manually to add all the packages required from the root.

### All packages MUST have

- A package.json file
- A registered `build` script in packages.json, if it needs to be built
- A registered `test` script in packages.json, if no tests a justification is required
- All dependencies added through root workspace so they are added to the lockfile

### All packages SHOULD have

- A README.md outlining any non-standard commands and how to work with the package.
- A `src` directory for all application code
- Test files are preferably adjacent to the code file they are testing, e.g `src/myModule/index.test.ts`

## Local development

### Frontend

Start the nuxt development server with `yarn fe dev`. You should be able to open the app on `http://localhost:3000/`.

> Note: `fe` is a shorthand to run yarn scripts in the frontend workspace from the root workspace

For more info see the [frontend readme](./packages/frontend/README.md)

### Storybook

Storybook helps you document components for reuse and automatically visually test your components to prevent bugs. Run storybook with `yarn storybook`. You can access the storybook by navigating to `http://localhost:3003/` in your browser. For more information see the [storybook docs](https://storybook.js.org/docs/vue/get-started/introduction).

### Mock API

Install [docker engine](https://docs.docker.com/docker-for-mac/install/).

Installing the docker engine desktop app also installs [docker compose](https://docs.docker.com/compose/install/#install-compose-on-macos), which is required.

> Note: Installing docker via homebrew proved to be a pain to get working. Not recommended.

If you have followed the steps correctly, `yarn mockapi` will start a mock api on port 8080, which you can verify by navigating to `http://localhost:8080/v1/documents/1` in your browser. You should get a response similar to:

```json
{
  "createdDate": "1835-05-28T14:19:46Z",
  "description": "Non. Est dicta tenetur voluptatem.",
  "expiryDate": "1994-08-29T05:29:01Z",
  "format": "JPEG",
  "id": "Earum. Perferendis quia. Et enim magnam eum. Dolor soluta suscipit.",
  "links": {},
  "source": "PHOTO",
  "type": "PROOF_OF_INCOME"
}
```

## Regenerating the API Client

After changing `docs/api.yaml`, you can use the [OpenAPI Generator](https://github.com/OpenAPITools/openapi-generator#table-of-contents) docker image to regenerate the `api-client` (packages/api-client) with the following command:

```bash
docker run --rm -v "${PWD}:/local" openapitools/openapi-generator-cli:latest-release generate \
    -i /local/docs/api.yaml \
    -g typescript-axios \
    -o /local/packages/api-client
```

> note: run this from the root directory

## Infrastructure

Please see the [infrastructure readme](packages/infra/README.md) for details on developing the infrastructure.

## Backend/API

Please see the [API Service readme](packages/api-service/README.md) for details on developing the API and other application specific cloud processing.

## Architecture

High level infrastructure:

![AWS Architecture](docs/aws_architecture.png)

### Key concepts

#### Data Encryption

Encryption at rest is applied to the following storage mechanisms:

1. S3 Buckets
2. Database drives

Encryption in-transit is applied via HTTPS between clients and API Gateway.

#### Serverless compute

Scalable and serverless compute powered by AWS Lambda

#### Isolated multi-tenancy

If a City is configured in a multi-tenant manner, documents are encrypted with a city-specific KMS key.

A City stack will provision its own database and credentials on creation so it is fully isolated from other City data.

## Security

### Information Classification

[Please find a detailed information classification here.](docs/information_classification.md)

### Robots.txt

A [robots.txt](packages/frontend/static/robots.txt) file has been configured for the frontend to disallow all web crawlers from scanning the site. This can be configured manually if you fork this repository, or can also be configured on a per-tenant basis using the static assets feature of the CI/CD Pipeline.

### Security Controls

This section outlines the security controls in place for the code base and suggested tools to be used when hosting the solution on AWS.

#### Code Repository

The GitHub repository has [Dependabot](https://dependabot.com/) enabled. As almost all code in this repository is Javascript/Typescript and uses NPM for dependencies, Dependabot provides security advisories to repository administrators for any known issues detected with package dependencies.

Dependabot can also automatically raise PRs with updated dependencies to make sure the code base stays up to date. Read more about [Dependabot's features here](https://dependabot.com/#features)

#### Frontend Application and Hosting

Hosting for the Single Page App (SPA) frontend uses AWS CloudFront as a CDN. This means there are no application servers running to provide this content and significantly reduces the security controls needed around it. The CDN layer protects the underlying S3 bucket and distributes content to edge locations to make it faster for viewers to access the application.
Cloudfront uses an Origin Access Identity to securely access the S3 bucket, so no content in the S3 bucket needs to be publicly available.

We have also applied the following to our frontend application/hosting:

1. A custom viewer certificate with a TLSv1.2 (2019) minimum.
1. [Sentry.IO](https://sentry.io) optionally enabled for error logging.
1. A [Content Security Policy (CSP)](https://developer.mozilla.org/en-US/docs/Web/HTTP/CSP) which informs browsers as to what traffic and sources the web application is allowed to communicate with.

#### API Application and Gateway

As HTTP traffic is processed by AWS API Gateway before being passed along to a Lambda function to fulfill, a lot of common concerns when dealing with web traffic have been handled. Some examples of these include:

1. Restricting which ports traffic is allowed on - all traffic to API Gateway is over HTTP/S on port 443
1. Restricting the transport protocol to HTTP
1. Enforcing a maximum request and response size

We have also applied the following API Gateway security features:

1. All API endpoints have an AWS API Gateway Authorizer attached to ensure a known user is accessing the API with time-limited credentials.
1. Throttling has been configured for all API routes to reduce impact to downstream services in the event of a surge. A multiplier can be set in configuration to easily ramp this up or down.

At the application layer, AWS Lambda is used as the execution environment which gives the following advantages:

1. Reduced area of impact should an execution environment be affected, as each lambda processes one request at a time and each lambda is single purpose in its business function.
1. Short time frame that a lambda is active, as they are cycled out of service periodically and replaced with fresh instances.
1. Limited access to underlying OS and file system.
1. AWS defined request and response sizes, as well as maximum function timeouts. A default timeout has been set of 60 seconds for all API lambdas.
1. Principle of least privilege can be applied to AWS Lambda IAM roles, meaning each lambda is only given permissions to access services and actions within those services that have been explicitly specified.

We have also implemented the following to assist with observability:

1. AWS XRAY enabled and all AWS clients wrapped.
1. [Sentry.IO](https://sentry.io) optionally enabled, wrapping all Lambda handlers, and error logging. This has been applied in an abstracted way so that other tools may be implemented as well.

#### AWS Account Monitoring

If you are to host this solution yourself, we recommend the following practises and tools are in place to safegaurd your AWS accounts:

1. For any direct access to AWS accounts, time limits to the access should be imposed. For example, try not to use IAM Users with explicit access tokens that do not expire. Instead, use IAM roles with SAML or AWS Single Sign On to reduce the time these credentials are valid.
1. All employees should only get the level of access needed to perform their roles. If people are only viewing data in an account, give read only access rather than adminstrative access. Upgrade where necessary for short periods of time.
1. If possible, use a separate production AWS account than where your development/staging environments are hosted. This means that separate access policies and levels of controls can be applied to the production account only and access control is clearer for this environment.
1. Enable AWS CloudTrail to log all AWS activity.
1. Enable AWS Guard Duty and configure it to notify your operations team for any unexpected/suspicios activity on your production account
1. Enable AWS Config [with rules or conformance packs](https://docs.aws.amazon.com/config/latest/developerguide/conformance-packs.html) to confirm all AWS resources have been configured in the expected manner (e.g. no public S3 buckets!)

This list is not meant to be definitive or exhaustive. There are a number of AWS Best Practise articles to help guide what is best for your hosting requirements and security posture.
