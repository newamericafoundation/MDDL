/* eslint-disable @typescript-eslint/no-var-requires */
const path = require('path')
const ZipPlugin = require('zip-webpack-plugin')
const BundleAnalyzerPlugin = require('webpack-bundle-analyzer')
  .BundleAnalyzerPlugin
const TsconfigPathsPlugin = require('tsconfig-paths-webpack-plugin')
  .TsconfigPathsPlugin
const CopyPlugin = require('copy-webpack-plugin')
const entrypoints = require('./entrypoints.json')

const SRC_DIR = path.resolve(__dirname, 'src')
const OUT_DIR = path.resolve(__dirname, 'build')
const sourcePath = (name) => path.resolve(SRC_DIR, 'services', name)
const directory = (filePath) => filePath.split('/').slice(0, -1).join('/')

const lambdas = {}
entrypoints.forEach((d) => {
  lambdas[d.entrypoint] = sourcePath(d.entrypoint + '.ts')
})

const copyPatterns = [].concat(
  ...entrypoints
  .filter((e) => e.include && e.include.length)
  .map((e) =>
    e.include.map((fromPath) => ({
      from: sourcePath(path.join(directory(e.entrypoint), fromPath)),
      to: path.join(e.entrypoint, fromPath),
    })),
  ),
)

const config = {
  entry: lambdas,
  module: {
    rules: [{
        test: /\.ts$/,
        loader: 'ts-loader',
        exclude: /node_modules/,
      },
      {
        test: /\.mustache$/i,
        use: 'raw-loader',
      },
    ],
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
    new CopyPlugin({
      patterns: copyPatterns,
    }),
    ...Object.keys(lambdas).map((filePath) => {
      return new ZipPlugin({
        filename: filePath.split('/').pop(),
        path: path.join(OUT_DIR, directory(filePath)),
        extension: 'zip',
        include: filePath,
        pathMapper: (assetPath) => {
          const match = filePath + '/'
          if (assetPath.startsWith(match)) {
            return assetPath.replace(match, '', 1)
          }
        },
      })
    }),
  ],
}

module.exports = config
