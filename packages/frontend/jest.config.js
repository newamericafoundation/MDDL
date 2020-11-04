module.exports = {
  verbose: true,
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/$1',
    '^~/(.*)$': '<rootDir>/$1',
    '^vue$': 'vue/dist/vue.common.js',
  },
  moduleFileExtensions: ['ts', 'js', 'vue', 'json'],
  transform: {
    '^.+\\.ts$': 'ts-jest',
    '^.+\\.js$': 'babel-jest',
    '^.+\\.vue$': 'vue-jest',
    '^.+\\.svg$': '<rootDir>/assets/js/svgTransform.js',
  },
  transformIgnorePatterns: ['node_modules/vuetify/src/locale/.*'],
  collectCoverage: true,
  collectCoverageFrom: [
    '<rootDir>/components/**/*.vue',
    '<rootDir>/pages/**/*.vue',
  ],
  setupFilesAfterEnv: ['./assets/js/jest.setup.js'],
  // snapshotSerializers: ["<rootDir>/node_modules/jest-serializer-vue"],
}
