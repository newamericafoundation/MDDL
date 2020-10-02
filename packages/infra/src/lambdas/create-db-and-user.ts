import mysql from 'mysql2/promise'
import SecretsManager from 'aws-sdk/clients/secretsmanager'

const sm = new SecretsManager()

interface Event {
  readonly RequestType: 'Create' | 'Update' | 'Delete'
  readonly ResourceProperties?: { [key: string]: any }
  readonly OldResourceProperties?: { [key: string]: any }
  readonly PhysicalResourceId?: string
}

interface Response {
  readonly PhysicalResourceId?: string
  readonly Data?: { [name: string]: any }
}

export type EventHandler = (event: Event) => Promise<Response | undefined>

export const handler: EventHandler = async (event: Event) => {
  console.log('Received:\n', event)
  if (!event.ResourceProperties) {
    throw new Error('ResourceProperties not found')
  }
  if (!event.ResourceProperties.NewUserSecretId) {
    throw new Error('NewUserSecretId property not found')
  }
  const secretId = event.ResourceProperties.NewUserSecretId

  if (event.RequestType == 'Delete') {
    // skip delete events
    console.log('Skipping delete event.')
    return {
      PhysicalResourceId: 'db-config:' + secretId
    }
  }

  if (event.RequestType == 'Update') {
    if (
      event.OldResourceProperties &&
      event.OldResourceProperties.NewUserSecretId == secretId
    ) {
      // skip update if secret is the same
      console.log('Skipping update event for same secret ID.')
      return {
        PhysicalResourceId: 'db-config:' + secretId
      }
    }
    throw new Error(
      'Update is not supported for this resource. Create a new resource with the updated secret ID.'
    )
  }

  const newUserInformation = await sm
    .getSecretValue({
      SecretId: secretId
    })
    .promise()

  if (!newUserInformation.SecretString) {
    throw new Error('Secret could not be read')
  }

  const { username, password } = JSON.parse(
    newUserInformation.SecretString
  ) as {
    username: string
    password: string
  }

  // create the connection to database
  const connection = await mysql.createConnection({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_DEFAULT_DATABASE
  })
  const stmts = [
    `CREATE DATABASE IF NOT EXISTS ${connection.escapeId(username)}`,
    `CREATE USER ${connection.escapeId(
      username
    )}@'%' IDENTIFIED BY ${connection.escape(password)}`,
    `GRANT ALL PRIVILEGES ON ${connection.escapeId(
      username
    )}.* TO ${connection.escapeId(username)}@'%'`
  ]
  stmts.forEach(async (stmt) => {
    const [rows, fields] = await connection.query(stmt)
    console.log('Rows: ', rows)
    console.log('Fields: ', fields)
  })
  connection.end()

  return {
    PhysicalResourceId: 'db-config:' + secretId
  }
}
