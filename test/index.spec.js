/* eslint-env mocha */
/* eslint-disable no-unused-expressions */
const fs = require('fs')
const path = require('path')
const { exec } = require('child_process')

const del = require('del')
const chai = require('chai')
const chaiAsPromised = require('chai-as-promised')
chai.use(chaiAsPromised)
chai.should()

const webpack = require('webpack')

const webpackOptions = require('./webpack.config')

const distFolder = path.join(__dirname, '../test/dist')

function getHash(filename, type = 'md5') {
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

describe('MD5Plugin', function () {
  let stats = null

  before(function (done) {
    webpack(webpackOptions, (err, _stats) => {
      if (err) {
        done(err)
      }
      stats = _stats
      done()
    })
  })

  after(function () {
    return del(distFolder)
  })

  it('expect generate md5 manifest to manifest.json', () => {
    return readManifestFile('manifest.json').then((obj) => {
      return Promise.all(
        Object.keys(obj).map((filename) => {
          const hash = obj[filename]

          return getHash(filename).should.eventually.equal(hash)
        })
      )
    })
  })
})
