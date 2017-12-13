const path = require('path')

const MD5Plugin = require('../')

function getWebpackConfiguration (algorithm) {
  return {
  }
}

module.exports = {
  entry: {
    app: path.join(__dirname, './src/index.js')
  },
  output: {
    filename: '[name].bundle.js',
    path: path.resolve(__dirname, 'dist')
  },
  plugins: [
    new MD5Plugin()
  ]
}