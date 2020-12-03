/* eslint-disable @typescript-eslint/no-var-requires */
import path from 'path'
import ZipPlugin from 'zip-webpack-plugin'
import { TsconfigPathsPlugin } from 'tsconfig-paths-webpack-plugin'
import entrypoints from './entrypoints.json'

const SRC_DIR = path.resolve(__dirname, 'src')
const OUT_DIR = path.resolve(__dirname, 'build')
const sourcePath = (name: string) => path.resolve(SRC_DIR, 'lambdas', name)
const directory = (filePath: string) =>
  filePath.split('/').slice(0, -1).join('/')

const lambdas: { [index: string]: string } = {}
for (const d of entrypoints) {
  lambdas[d.entrypoint] = sourcePath(d.entrypoint + '.ts')
}

const config = {
  entry: lambdas,
  module: {
    rules: [
      {
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
  externals: ['aws-sdk', 'mysql2'],
  output: {
    path: OUT_DIR,
    filename: '[name]/index.js',
    libraryTarget: 'commonjs',
  },
  target: 'node',
  plugins: [
    ...Object.keys(lambdas).map((filePath) => {
      return new ZipPlugin({
        filename: filePath.split('/').pop(),
        path: path.join(OUT_DIR, directory(filePath)),
        extension: 'zip',
        include: filePath,
        pathMapper: (assetPath: string) => {
          const match = filePath + '/'
          if (assetPath.startsWith(match)) {
            return assetPath.replace(match, '')
          }
          return assetPath
        },
      })
    }),
  ],
}

export default config
