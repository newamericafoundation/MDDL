import * as Knex from 'knex'

export async function up(knex: Knex): Promise<void> {
  return knex.schema.createTable('account_delegates', (t) => {
    t.string('id', 40).primary()
    t.string('accountId', 40).index().notNullable()
    t.string('delegateEmail', 255).index().notNullable()
    t.string('status', 255).index().notNullable()
    t.dateTime('inviteValidUntil').notNullable()
    t.string('createdBy', 255).notNullable()
    t.timestamp('createdAt').defaultTo(knex.fn.now())
    t.string('updatedBy', 255).notNullable()
    t.timestamp('updatedAt').defaultTo(knex.fn.now())
  })
}

export async function down(knex: Knex): Promise<void> {
  return knex.schema.dropTable('account_delegates')
}
