# webpack-md5-manifest-plugin #

Generate JSON manifest based on the MD5 of files.

[![Build Status](https://travis-ci.org/sdvcrx/webpack-md5-manifest-plugin.svg?branch=master)](https://travis-ci.org/sdvcrx/webpack-md5-manifest-plugin)
[![npm package](https://img.shields.io/npm/v/webpack-md5-manifest-plugin.svg)](https://www.npmjs.com/package/webpack-md5-manifest-plugin)

## Usage ##

In your `webpack.config.js`:

```javascript
const MD5Plugin = require('webpack-md5-manifest-plugin');

module.exports = {
    // ...

    plugins: [
      // ...
      new MD5Plugin()
    ]
}
```

## Options ##

```javascript
// webpack.config.js

module.exports = {
  output: {
    path: path.resolve(__dirname, 'dist')
  },
  plugins: [
    new MD5Plugin(options)
  ]
}
```

### `options.name` ###

Type: `String`

Default: `manifest.json`

The output manifest filename.

### `options.algorithm` ###

Type: `String`

Default: `md5`

The hash algorithm.
