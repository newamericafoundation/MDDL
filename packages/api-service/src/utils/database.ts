import { Model } from 'objection'
import Knex from 'knex'
import knexConfig from '../knexfile'

export const connectDatabase = (config?: string) => {
  config = process.env.NODE_ENV || 'development'
  const knex = Knex(knexConfig[config])
  Model.knex(knex)
  return knex
}
