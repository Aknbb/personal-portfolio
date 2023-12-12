/* eslint-disable import/no-extraneous-dependencies */
const { merge } = require('webpack-merge');
const path = require('path');
const webpackConfiguration = require('../webpack.config');

module.exports = merge(webpackConfiguration, {
  mode: 'development',
  devtool: 'eval-source-map',
  devServer: {
    static: {
      directory: path.resolve(__dirname, '../dist/'),
      publicPath: '/',
      watch: true,
    },
    client: {
      overlay: true,
    },
    open: true,
    compress: true,
    hot: false,
    host: 'localhost',
    port: 8080
  },
  watchOptions: {
    aggregateTimeout: 300,
    poll: 300,
    ignored: /node_modules/,
  },
  plugins: [],
});
