const fs = require('fs')
const path = require('path')
const crypto = require('crypto')

function isJsFile (name) {
  return path.extname(name) === '.js'
}

class MD5Plugin {
  constructor (options) {
    this.options = Object.assign({}, {
      name: 'manifest.json'
    }, options)
  }

  md5File (filePath) {
    return new Promise((resolve, reject) => {
      fs.readFile(filePath, 'utf-8', (err, data) => {
        if (err) {
          reject(err)
        }
        const filename = path.basename(filePath)
        const hash = crypto.createHash('md5').update(data).digest('hex')
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
        resolve(files.filter(isJsFile))
      })
    })
  }

  outputManifest (fileList, outputPath) {
    const manifest = {}

    fileList.forEach((item) => {
      manifest[item.filename] = item.hash
    })

    const self = this

    const manifestPath = path.join(outputPath, this.options.name)

    return new Promise((resolve) => {
      fs.writeFile(manifestPath, JSON.stringify(manifest, null, 2), (err) => {
        if (err) {
          reject(err)
        }
        resolve()
      })
    })
  }

  apply (compiler) {
    const moduleAssets = {}

    const self = this

    compiler.plugin('done', function (stats) {
      const dir = stats.compilation.compiler.outputPath

      self.listDirFiles(stats.compilation.compiler.outputPath).then((files) => {
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
