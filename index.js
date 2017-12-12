const fs = require('fs')
const path = require('path')
const crypto = require('crypto')

function isJsFile (name) {
  return path.extname(name) === '.js'
}

function MD5Plugin (options) {
  this.options = Object.assign({}, {
    name: 'manifest.json'
  }, options)
}

MD5Plugin.prototype.md5File = function (filePath) {
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

MD5Plugin.prototype.listDirFiles = function (outputPath) {
  return new Promise((resolve, reject) => {
    fs.readdir(outputPath, (err, files) => {
      if (err) {
        reject(err)
      }
      resolve(files.filter(isJsFile))
    })
  })
}

MD5Plugin.prototype.outputManifest = function (fileList, outputPath) {
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

MD5Plugin.prototype.apply = function (compiler) {
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

module.exports = MD5Plugin
