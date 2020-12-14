import * as Knex from 'knex'

export async function up(knex: Knex): Promise<void> {
  return knex.schema
    .alterTable('collections_grants', (t) => {
      t.string('ownerId', 255).index().nullable()
    })
    .raw(
      'UPDATE collections_grants cg INNER JOIN collections c ON cg.collectionId = c.id SET cg.ownerId = c.ownerId',
    )
}

export async function down(knex: Knex): Promise<void> {
  return knex.schema.alterTable('collections_grants', (t) => {
    t.dropColumn('ownerId')
  })
}
