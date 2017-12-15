const path = require('path')

const MD5Plugin = require('../')

module.exports = {
  entry: {
    app: path.join(__dirname, './src/index.js'),
    lib: path.join(__dirname, './src/lib.js')
  },
  output: {
    filename: '[name].bundle.js',
    path: path.resolve(__dirname, 'dist')
  },
  plugins: [
    new MD5Plugin()
  ]
}
