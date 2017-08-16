require('dotenv').config();
const fs = require('fs');
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

function isDir(dir) {
  return fs.statSync(path.join('./src/js/demos', dir)).isDirectory();
}
const dirs = fs.readdirSync('./src/js/demos').filter(isDir);

const entries = {};

// To make developing an example faster
// set the env variable EXAMPLE e.g:
// EXAMPLE=linegeometry npm run start
const demoDir = process.env.DEMO;

if (demoDir !== undefined) {
  entries[demoDir] = `./src/js/demos/${demoDir}/index.js`;
} else {
  dirs.forEach(dir => {
    entries[dir] = `./src/js/demos/${dir}/index.js`;
  });
}

module.exports = {
  entry: entries,
  devtool: production ? '' : 'source-map',
  output: {
    path: path.join(__dirname, constants.BUILD),
    publicPath: process.env.BASE_URL || '/',
    filename: `${constants.ASSETS}/${constants.JS}/[name].js`,
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
