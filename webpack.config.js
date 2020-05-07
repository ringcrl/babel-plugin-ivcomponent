const path = require('path');

module.exports = {
  mode: 'development',
  devtool: 'inline',
  entry: './src/index.js',
  output: {
    path: path.resolve(__dirname, 'dist'),
    filename: 'index.js'
  },
  module: {
    rules: [
      {
        test: /\.js$/,
        exclude: /node_modules/,
        use: {
          loader: 'babel-loader',
          options: {
            plugins: ['./lib/babel-plugin-ivcomponent.js']
            // presets: ['@babel/preset-env'],
          }
        }
      }
    ]
  }
};