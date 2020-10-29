# API Service

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
