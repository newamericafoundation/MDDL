# API Service

## Local development flow

If a new API is to be introduced, first make changes to [the API spec (docs/api.yaml)](./../../docs/api.yaml).
From there, you should regenerate the API Client as that provides the underlying types we will write API contracts to. Details on how to regenerate this client are in the top level readme for this repository.

Locally, all execution is done via jest testing. Tests sit alongside each entrypoint and contain tests specific to that.
There are pros and cons to this approach. You don't get a full local setup to test API's end to end, but automated testing is increased and the code is more specific to it's execution environment (AWS Lambda). This means we process API Gateway events (defined by @types/lambda) rather than by locally proxying requests with a framework such as Express.js or Koa.js. Development for lambdas processing events from other services, e.g. S3, can then be developed in the same way with much change to the approach.

### Running the local database

For integration testing with the database, a local MYSQL instance is ran in docker. You can start this database and migrate it with the following command:

```bash
yarn api start
```

### Watching and running tests locally

To run jest tests in watch mode, including integration tests with the database, run the following command

```bash
yarn api test:watch
```

_note_ the local database should be started before the `test:watch` command is ran.
_note_ the `yarn api test` command will only run unit tests that do not require the database. This is used by CI/CD tools such as GitHub Actions.

## Database Migrations

This project uses [Knex](http://knexjs.org) for database migrations.

For a full reference of knex commands, please see http://knexjs.org/#Migrations-CLI

To create a new migration, from the root directory, run:

```bash
yarn api knex migrate:make migration_name -x ts
```

## File conversion testing

To run tests that involve using `GraphicsMagick`, and for PDF reading, `ghostscript`, you will need to install it on your machine. For mac:

```bash
brew install graphicsmagick
brew install ghostscript
```

Alternatively, you could run these in docker.

## Sample files

A number of sample files are located in services/documents/fileSamples. These have been sourced from pexels.com and do not require attribution, but please see https://www.pexels.com/license/ for license details.

## Environment Variables

The following environment variables are used within the service code:

1. `NODE_ENV`: The current node environment. Will be set to `production` for all deployed code, regardless of environment.
1. `DB_HOST`, `DB_NAME`, `DB_USER`, `DB_PASSWORD`: Contains details on how to connect to the database.
1. `DOCUMENTS_BUCKET`: This is the name of the S3 bucket which files for documents are stored.
1. `USERINFO_ENDPOINT`: This is the HTTP endpoint to call with a Authorization token to get user information of the caller.
1. `WEB_APP_DOMAIN`: The domain of the web app, for use in direct links to pages, e.g. for emails.
1. `EMAIL_SENDER`: The email address and name to be used for sending emails, e.g. `Data Locker <noreply@mydomain.com>`
1. `AGENCY_EMAIL_DOMAINS_WHITELIST`: The comma separated list of domains to whitelist agency access. Restricts email addresses that collections can be shared to and accessed from. If an explicit match is required, include the '@' at the start of the entry. For example, if the list is `@myspecificdomain.com,partialdomain.net` it will match `name@myspecificdomain.com`, `name@partialdomain.com`, `name@mypartialdomain.com`, `name@my.partialdomain.com` but not match `name@sub.myspecificdomain.com`
