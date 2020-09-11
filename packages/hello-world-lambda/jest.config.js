module.exports = {
  roots: ['<rootDir>/src/__tests__'],
  testMatch: ['**/*.test.ts'],
  transform: {
    '^.+\\.tsx?$': 'ts-jest'
  }
};