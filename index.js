const fs = require('fs')
const path = require('path')
const crypto = require('crypto')

class MD5Plugin {
  constructor (options) {
    this.options = Object.assign({}, {
      name: 'manifest.json',
      algorithm: 'md5'
    }, options)
  }

  _exlcudeSelf (name) {
    return name !== this.options.name
  }

  md5File (filePath) {
    return new Promise((resolve, reject) => {
      fs.readFile(filePath, 'utf-8', (err, data) => {
        if (err) {
          reject(err)
        }
        const filename = path.basename(filePath)
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
        }
        resolve(files.filter(this._exlcudeSelf, this))
      })
    })
  }

  outputManifest (fileList, outputPath) {
    const manifest = {}

    fileList.forEach((item) => {
      manifest[item.filename] = item.hash
    })

    const manifestPath = path.join(outputPath, this.options.name)

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
      const dir = compilation.compiler.outputPath

      self.listDir(dir).then((files) => {
        return Promise.all(files.map((file) => {
          const filePath = path.join(dir, file)
          return self.md5File(filePath)
        }))
      }).then((fileList) => {
        return self.outputManifest(fileList, dir)
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
      })
    })
  }
}

module.exports = MD5Plugin
