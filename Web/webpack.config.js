require('dotenv').config();
const path = require('path');
const webpack = require('webpack');
const Dotenv = require('dotenv-webpack');
const BabiliPlugin = require('babili-webpack-plugin');
const ProgressBarPlugin = require('progress-bar-webpack-plugin');
const constants = require('./internals/constants');

const production = process.env.NODE_ENV === 'production';

let plugins = production
  ? [new webpack.optimize.OccurrenceOrderPlugin(), new BabiliPlugin()]
  : [];

plugins = plugins.concat([
  new Dotenv({
    path: './.env'
  }),
  new ProgressBarPlugin(),
  new webpack.optimize.CommonsChunkPlugin({
    children: true,
    minChunks: 2,
    async: true
  }),
  new webpack.DefinePlugin({
    'process.env': {
      DEV: !production,
      BASE_URL: JSON.stringify(process.env.BASE_URL)
    }
  })
]);

module.exports = {
  entry: path.join(__dirname, 'src/js/index'),
  devtool: production ? '' : 'source-map',
  output: {
    path: path.join(__dirname, constants.BUILD),
    publicPath: process.env.BASE_URL || '/',
    filename: production
      ? `${constants.ASSETS}/${constants.JS}/[name].[chunkhash].js`
      : `${constants.ASSETS}/${constants.JS}/[name].js`,
    chunkFilename: `${constants.ASSETS}/${constants.JS}/[name].[chunkhash].chunk.js`
  },
  module: {
    loaders: [
      {
        test: /\.pug$/,
        loader: 'pug-loader'
      },
      {
        test: /\.js$/,
        exclude: /node_modules/,
        loader: 'babel-loader',
        query: {
          presets: ['es2015', 'stage-0']
        }
      }
    ]
  },
  stats: 'minimal',
  plugins
};
