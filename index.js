const fs = require('fs')
const path = require('path')
const crypto = require('crypto')

class MD5Plugin {
  constructor (options) {
    this.options = Object.assign({}, {
      name: 'manifest.json',
      algorithm: 'md5'
    }, options)

    this._outputPath = ''
  }

  _exlcudeSelf (name) {
    return name !== this.options.name
  }

  md5File (filePath) {
    return new Promise((resolve, reject) => {
      fs.readFile(filePath, 'utf-8', (err, data) => {
        if (err) {
          reject(err)
          return
        }
        const filename = path.relative(this._outputPath, filePath)
        const hash = crypto.createHash(this.options.algorithm).update(data).digest('hex')
        resolve({
          filename,
          hash
        })
      })
    })
  }

  listDir (dirPath) {
    return new Promise((resolve, reject) => {
      fs.readdir(dirPath, (err, files) => {
        if (err) {
          reject(err)
          return
        }
        resolve(files.filter(this._exlcudeSelf, this))
      })
    })
  }

  outputManifest (fileList) {
    const manifest = {}

    fileList.forEach((item) => {
      manifest[item.filename] = item.hash
    })

    const manifestPath = path.join(this._outputPath, this.options.name)

    const fileContent = JSON.stringify(manifest, null, 2)

    return new Promise((resolve, reject) => {
      fs.writeFile(manifestPath, fileContent, (err) => {
        if (err) {
          reject(err)
        }
        resolve(fileContent)
      })
    })
  }

  apply (compiler) {
    const self = this

    compiler.plugin('after-emit', function (compilation, compileCallback) {
      self._outputPath = compilation.compiler.outputPath

      const fullPathAssetsPromises = Object.keys(compilation.assets)
        .map(key => compilation.assets[key])
        .map(file => file.existsAt)
        .map(self.md5File, self)

      Promise.all(fullPathAssetsPromises)
        .then((fileList) => {
          return self.outputManifest(fileList, this._outputPath)
        }).then((content) => {
          compilation.assets[self.options.name] = {
            source: function () {
              return content
            },
            size: function () {
              return content.length
            }
          }
          compilation.applyPluginsAsync('webpack-md5-manifest-plugin-after-emit', content, compileCallback)
        }).catch(console.error)
    })
  }
}

module.exports = MD5Plugin
