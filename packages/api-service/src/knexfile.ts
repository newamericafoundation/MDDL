const migrations = {
  tableName: 'knex_migrations',
  directory: `${__dirname}/migrator/migrations`,
}

const config: { [index: string]: any } = {
  development: {
    client: 'mysql2',
    connection: {
      database: 'db',
      user: 'root',
      password: 'Lock3r', // defined in docker-compose.yaml
    },
    migrations,
  },

  production: {
    client: 'mysql2',
    connection: {
      host: process.env.DB_HOST,
      database: process.env.DB_NAME,
      user: process.env.DB_USER,
      password: process.env.DB_PASSWORD,
    },
    migrations,
  },
}

export default config
