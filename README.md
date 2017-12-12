# webpack-md5-manifest-plugin #

Generate JSON manifest based on the MD5 of files.

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
