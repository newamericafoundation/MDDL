import * as Knex from 'knex'

export async function up(knex: Knex): Promise<void> {
  return knex.schema.alterTable('collections_grants', (t) => {
    t.index(['requirementType', 'requirementValue'])
  })
}

export async function down(knex: Knex): Promise<void> {
  return knex.schema.alterTable('collections_grants', (t) => {
    t.dropIndex(['requirementType', 'requirementValue'])
  })
}
