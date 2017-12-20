/* eslint-env mocha */
/* eslint-disable no-unused-expressions */
const path = require('path')

const chai = require('chai')
const chaiAsPromised = require('chai-as-promised')
chai.use(chaiAsPromised)
chai.should()

const utils = require('./utils')
const MD5Plugin = require('../')

describe('MD5Plugin', function () {
  describe('#md5', function () {
    before(function () {
      return utils.compile({
        plugins: [new MD5Plugin()]
      })
    })

    after(function () {
      return utils.cleanup()
    })

    it('expect generate md5 manifest to manifest.json', () => {
      return utils.readManifestFile('manifest.json').then((obj) => {
        return Promise.all(
          Object.keys(obj).map((filename) => {
            const hash = obj[filename]

            return utils.getHash(filename).should.eventually.equal(hash)
          })
        )
      })
    })
  })

  describe('#sha1', function () {
    before(function () {
      return utils.compile({
        plugins: [
          new MD5Plugin({
            algorithm: 'sha1'
          })
        ]
      })
    })

    after(function () {
      return utils.cleanup()
    })

    it('expect generate sha1 manifest to manifest.json', () => {
      return utils.readManifestFile('manifest.json').then((obj) => {
        return Promise.all(
          Object.keys(obj).map((filename) => {
            const hash = obj[filename]

            return utils.getHash(filename, 'sha1').should.eventually.equal(hash)
          })
        )
      })
    })
  })

  describe('#filename', function () {
    before(function () {
      return utils.compile({
        plugins: [
          new MD5Plugin({
            name: 'test.json'
          })
        ]
      })
    })

    after(function () {
      return utils.cleanup()
    })

    it('expect generate md5 manifest to test.json', () => {
      return utils.readManifestFile('test.json').then((obj) => {
        return Promise.all(
          Object.keys(obj).map((filename) => {
            const hash = obj[filename]

            return utils.getHash(filename).should.eventually.equal(hash)
          })
        )
      })
    })
  })

  describe('#multi-level', function () {
    before(function () {
      return utils.compile({
        output: {
          filename: 'js/[name].bundle.js',
          path: path.resolve(__dirname, 'dist')
        }
      })
    })

    after(function () {
      return utils.cleanup()
    })

    it('expect generate md5 manifest to multi-level', () => {
      return utils.readManifestFile('manifest.json').then((obj) => {
        return Promise.all(
          Object.keys(obj).map((filename) => {
            const hash = obj[filename]

            return utils.getHash(filename).should.eventually.equal(hash)
          })
        )
      })
    })
  })
})
