import * as Knex from 'knex'

export async function up(knex: Knex): Promise<void> {
  return knex.schema.createTable('documents', (t) => {
    t.string('id', 40).primary()
    t.string('name', 255).nullable()
    t.string('ownerId', 255).index().notNullable()
    t.string('source', 255).nullable()
    t.string('format', 255).nullable()
    t.string('type', 255).nullable()
    t.date('expiryDate').nullable()
    t.string('filePath', 255).notNullable()
    t.string('fileContentType', 255).notNullable()
    t.string('fileChecksum', 255).notNullable()
    t.boolean('fileReceived').defaultTo(false)
    t.timestamp('createdAt').defaultTo(knex.fn.now())
    t.timestamp('updatedAt').defaultTo(knex.fn.now())
  })
}

export async function down(knex: Knex): Promise<void> {
  return knex.schema.dropTable('documents')
}
