const fs = require('fs')
const path = require('path')
const { exec } = require('child_process')

const webpack = require('webpack')
const del = require('del')

const webpackConfig = require('./webpack.config')

const distFolder = path.join(__dirname, '../test/dist')

function getHash (filename, type = 'md5') {
  const filePath = path.join(distFolder, filename)
  return new Promise((resolve, reject) => {
    exec(`${type}sum ${filePath} | cut -d ' ' -f 1`, (err, stdout) => {
      if (err) {
        reject(err)
        return
      }
      resolve(stdout.trim())
    })
  })
}

function readManifestFile (filename) {
  const manifestPath = path.join(distFolder, filename)

  return new Promise((resolve, reject) => {
    fs.readFile(manifestPath, 'utf-8', (err, data) => {
      if (err) {
        reject(err)
        return
      }
      resolve(JSON.parse(data))
    })
  })
}

function compile (opts) {
  const options = Object.assign({}, webpackConfig, opts)
  return new Promise((resolve, reject) => {
    webpack(options, (err, stats) => {
      if (err) {
        reject(err)
        return
      }
      const errors = stats.toJson().errors
      if (errors.length > 0) {
        reject(new Error(errors[0]))
        return
      }

      resolve(stats)
    })
  })
}

function cleanup () {
  return del(distFolder)
}

module.exports = {
  getHash,
  readManifestFile,
  compile,
  cleanup
}
