const path = require('path');
const fs = require('fs');
const glob = require('glob');
const CopyWebpackPlugin = require('copy-webpack-plugin');
const HTMLWebpackPlugin = require('html-webpack-plugin');
const ImageMinimizerPlugin = require('image-minimizer-webpack-plugin');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const { CleanWebpackPlugin } = require('clean-webpack-plugin');
const { PurgeCSSPlugin } = require("purgecss-webpack-plugin");

const templateFiles = fs.readdirSync(path.resolve(__dirname, 'src'))
    .filter((file) => ['.html', '.ejs'].includes(path.extname(file).toLowerCase())).map((filename) => ({
      input: filename,
      output: filename.replace(/\.ejs$/, '.html'),
    }));

const htmlPluginEntries = templateFiles.map((template) => new HTMLWebpackPlugin({
  inject: !template.output.includes('bg'),
  hash: false,
  filename: template.output,
  template: path.resolve(path.resolve(__dirname, 'src'), template.input),
}));

module.exports = {
  entry: {
    app: path.resolve(path.resolve(__dirname, 'src'), 'js', 'main.js'),
  },
  output: {
    filename: 'js/[name].js',
    path: path.resolve(__dirname, 'dist'),
  },
  module: {
    rules: [
      {
        test: /.s?css$/,
        use: [MiniCssExtractPlugin.loader, 'css-loader'],
      },
      {
        test: /\.js$/,
        exclude: /node_modules/,
        use: ['babel-loader'],
      },
      {
        test: /modernizr/,
        use: [ 'script-loader']
      },
      {
        test: /\.(png|gif|jpe?g|svg|webp)$/i,
        type: 'asset',
        parser: {
          dataUrlCondition: {
            maxSize: 8192,
          },
        },
        generator: {
          filename: 'assets/[name].[hash:6][ext]',
        },
      },
      {
        test: /\.(eot|ttf|woff|woff2)$/,
        type: 'asset',
        parser: {
          dataUrlCondition: {
            maxSize: 8192,
          },
        },
        generator: {
          filename: 'assets/[name].[hash:6][ext]',
        },
      },
      {
        test: /helvetiker/,
        type: 'asset',
        parser: {
          dataUrlCondition: {
            maxSize: 8192,
          },
        },
        generator: {
          filename: 'assets/[name].[hash:6][ext]',
        },
      },
    ],
  },
  optimization: {
    minimizer: [
      '...',
      new ImageMinimizerPlugin({
        minimizer: {
          implementation: ImageMinimizerPlugin.imageminMinify,
          options: {
            plugins: [
              ['gifsicle', { interlaced: true }],
              ['jpegtran', { progressive: true }],
              ['optipng', { optimizationLevel: 5 }],
              [
                'svgo',
                {
                  plugins: [
                    {
                      name: 'removeViewBox',
                      active: false,
                    },
                  ],
                },
              ],
            ],
          },
        },
      }),
    ],
  },
  plugins: [
    new MiniCssExtractPlugin({
      filename: 'css/[name].css',
    }),
    new CleanWebpackPlugin({
      verbose: true,
      cleanOnceBeforeBuildPatterns: ['**/*', '!stats.json'],
    }),
    new CopyWebpackPlugin({
      patterns: [
        {
          from: path.resolve(path.resolve(__dirname, 'src'), 'assets', 'projects-section-images'),
          to: path.resolve(path.resolve(__dirname, 'dist'), 'assets'),
          toType: 'dir',
        },
        {
          from: path.resolve(path.resolve(__dirname, 'src'), 'assets', 'resume-section-files'),
          to: path.resolve(path.resolve(__dirname, 'dist'), 'assets'),
          toType: 'dir',
        }
      ],
    }),
    new PurgeCSSPlugin({
      paths: glob.sync(`${path.join(__dirname, 'src')}/**/*`, { nodir: true }),
    }),
  ].concat(htmlPluginEntries),
  target: 'web',
};
