# API Service

## Database Migrations

This project uses [Knex](http://knexjs.org) for database migrations.

For a full reference of knex commands, please see http://knexjs.org/#Migrations-CLI

To create a new migration, from the root directory, run:

```bash
yarn api knex migrate:make migration_name -x ts
```
