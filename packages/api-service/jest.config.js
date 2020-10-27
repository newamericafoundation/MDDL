module.exports = {
  moduleNameMapper: {
    '\\.(mustache)$': '<rootDir>/fileStub.js',
    '^@/(.*)$': '<rootDir>/src/$1',
  },
  roots: ['<rootDir>/src/'],
  testMatch: ['**/*.test.ts'],
  transform: {
    '^.+\\.tsx?$': 'ts-jest',
  },
  modulePathIgnorePatterns: ['<rootDir>/.*/__mocks__'],
}
