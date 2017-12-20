const path = require('path')

const MD5Plugin = require('../')

module.exports = {
  entry: {
    app: path.join(__dirname, './src/index.js'),
    lib: path.join(__dirname, './src/lib.js')
  },
  module: {
    rules: [{
      test: /\.(png|jpe?g|gif)$/,
      use: [{
        loader: 'file-loader',
        options: {
          name: '[name].[ext]'
        }
      }]
    }]
  },
  output: {
    filename: '[name].bundle.js',
    path: path.resolve(__dirname, 'dist')
  },
  plugins: [
    new MD5Plugin()
  ]
}
