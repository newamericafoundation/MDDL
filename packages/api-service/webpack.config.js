/* eslint-disable @typescript-eslint/no-var-requires */
const path = require('path')
const ZipPlugin = require('zip-webpack-plugin')
const BundleAnalyzerPlugin = require('webpack-bundle-analyzer')
  .BundleAnalyzerPlugin
const TsconfigPathsPlugin = require('tsconfig-paths-webpack-plugin')
  .TsconfigPathsPlugin

const SRC_DIR = path.resolve(__dirname, 'src')
const OUT_DIR = path.resolve(__dirname, 'build')
const lambdaPath = (name) => path.resolve(SRC_DIR, 'lambdas', name)

const lambdas = {
  documents_createDocumentForUser: lambdaPath(
    'documents/createDocumentForUser.ts',
  ),
  documents_getById: lambdaPath('documents/getById.ts'),
  documents_getByUserId: lambdaPath('documents/getByUserId.ts'),
  documents_markFileReceived: lambdaPath('documents/markFileReceived.ts'),
}

const config = {
  entry: lambdas,
  module: {
    rules: [{
      test: /\.ts$/,
      use: 'ts-loader',
      exclude: /node_modules/,
    }, ],
  },
  resolve: {
    extensions: ['.ts', '.tsx', '.js'],
    plugins: [new TsconfigPathsPlugin()],
  },
  // aws-sdk is already available in the Node.js Lambda environment
  //  so it should not be included in function bundles
  externals: ['aws-sdk', 'knex', 'mysql2'],
  output: {
    path: OUT_DIR,
    filename: '[name]/index.js',
    libraryTarget: 'commonjs',
  },
  target: 'node',
  plugins: [
    // new BundleAnalyzerPlugin(),
    ...Object.keys(lambdas).map((entryName) => {
      const filePath = entryName.replace('_', '/')
      const directory = filePath.split('/').slice(0, -1).join('/')
      return new ZipPlugin({
        filename: filePath.split('/').pop(),
        path: path.join(OUT_DIR, directory),
        extension: 'zip',
        include: entryName,
        pathMapper: (assetPath) => {
          const match = entryName + '/'
          if (assetPath.startsWith(match)) {
            return assetPath.replace(match, '', 1)
          }
        },
      })
    }),
  ],
}

module.exports = config
