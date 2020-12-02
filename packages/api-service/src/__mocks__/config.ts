const config = jest.requireActual('@/config')

export const EnvironmentVariable = config.EnvironmentVariable

export const getConfiguration = jest
  .fn()
  .mockImplementation((item) =>
    item != EnvironmentVariable.SENTRY_DSN ? item : undefined,
  )

export const isProduction = jest.fn().mockImplementation(() => false)

export const requireConfiguration = jest.fn().mockImplementation((item) => item)
