import * as Knex from 'knex'

export async function up(knex: Knex): Promise<void> {
  return knex.schema.createTable('users', (t) => {
    t.string('id', 40).primary()
    t.string('givenName', 255).nullable()
    t.string('familyName', 255).nullable()
    t.string('email', 255).nullable()
    t.string('syncTimestamp', 255).nullable()
    t.json('attributes').nullable()
  })
}

export async function down(knex: Knex): Promise<void> {
  return knex.schema.dropTable('users')
}
