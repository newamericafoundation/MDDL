import * as Knex from 'knex'

export async function up(knex: Knex): Promise<void> {
  return knex.schema
    .alterTable('documents', (t) => {
      t.string('name', 255).notNullable().alter()
      t.string('createdBy', 255).notNullable()
      t.string('updatedBy', 255).notNullable()
      t.dropColumns(
        'filePath',
        'fileContentType',
        'fileChecksum',
        'fileReceived',
      )
    })
    .createTable('files', (t) => {
      t.string('id', 40).primary()
      t.string('documentId', 40).references('id').inTable('documents')
      t.integer('order').defaultTo(0)
      t.string('name', 255).notNullable()
      t.string('path', 500).notNullable().unique()
      t.boolean('received').defaultTo(false)
      t.string('contentType', 255).notNullable()
      t.integer('contentLength').unsigned().notNullable()
      t.string('sha256Checksum', 255).notNullable()
      t.timestamp('createdAt').defaultTo(knex.fn.now())
      t.string('createdBy', 255).notNullable()
    })
}

export async function down(knex: Knex): Promise<void> {
  return knex.schema
    .alterTable('documents', (t) => {
      t.string('name', 255).nullable().alter()
      t.dropColumns('createdBy', 'updatedBy')
      t.string('filePath', 255).notNullable()
      t.string('fileContentType', 255).notNullable()
      t.string('fileChecksum', 255).notNullable()
      t.boolean('fileReceived').defaultTo(false)
    })
    .dropTable('files')
}
