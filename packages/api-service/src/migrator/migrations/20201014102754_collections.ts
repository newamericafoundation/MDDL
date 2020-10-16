import * as Knex from 'knex'

export async function up(knex: Knex): Promise<void> {
  return knex.schema
    .createTable('collections', (t) => {
      t.string('id', 40).primary()
      t.string('name', 255).nullable()
      t.string('ownerId', 255).index().notNullable()
      t.string('createdBy', 255).notNullable()
      t.timestamp('createdAt').defaultTo(knex.fn.now())
      t.string('updatedBy', 255).notNullable()
      t.timestamp('updatedAt').defaultTo(knex.fn.now())
    })
    .createTable('collections_documents', (t) => {
      t.string('collectionId', 40)
      t.string('documentId', 40)
      t.string('createdBy', 255).notNullable()
      t.timestamp('createdAt').defaultTo(knex.fn.now())
      t.primary(['collectionId', 'documentId'])
      t.foreign('collectionId').references('id').inTable('collections')
      t.foreign('documentId').references('id').inTable('documents')
    })
    .createTable('collections_grants', (t) => {
      t.string('id', 40).primary()
      t.string('collectionId', 40).references('id').inTable('collections')
      t.string('requirementType', 255).notNullable()
      t.string('requirementValue', 255).notNullable()
      t.string('createdBy', 255).notNullable()
      t.timestamp('createdAt').defaultTo(knex.fn.now())
    })
    .createTable('agencies', (t) => {
      t.string('id', 40).primary()
      t.string('name', 255).nullable()
      t.string('createdBy', 255).notNullable()
      t.timestamp('createdAt').defaultTo(knex.fn.now())
    })
    .createTable('agencies_grants', (t) => {
      t.string('id', 40).primary()
      t.string('agencyId', 40).references('id').inTable('agencies')
      t.string('requirementType', 255).notNullable()
      t.string('requirementValue', 255).notNullable()
      t.string('createdBy', 255).notNullable()
      t.timestamp('createdAt').defaultTo(knex.fn.now())
    })
}

export async function down(knex: Knex): Promise<void> {
  return knex.schema
    .dropTable('collections_documents')
    .dropTable('collections_grants')
    .dropTable('collections')
    .dropTable('agencies_grants')
    .dropTable('agencies')
}
