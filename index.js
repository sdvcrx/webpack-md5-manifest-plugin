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

    return new Promise((resolve, reject) => {
      fs.writeFile(manifestPath, JSON.stringify(manifest, null, 2), (err) => {
        if (err) {
          reject(err)
        }
        resolve()
      })
    })
  }

  apply (compiler) {
    const self = this

    compiler.plugin('done', function (stats) {
      const dir = stats.compilation.compiler.outputPath

      self.listDir(stats.compilation.compiler.outputPath).then((files) => {
        return Promise.all(files.map((file) => {
          const filePath = path.join(dir, file)
          return self.md5File(filePath)
        }))
      }).then((fileList) => {
        return self.outputManifest(fileList, dir)
      })
    })
  }
}

module.exports = MD5Plugin
