"use strict"

const Hemera = require("nats-hemera")
const hemeraMongo = require("../index")
const Nats = require("hemera-testsuite/natsStub")
const assert = require("chai").assert

// prevent warning message of too much listeners
process.setMaxListeners(0)

describe("hemera-mongo", function() {
  let hemera
  let mongoStore

  before(function(done) {
    const nats = new Nats()
    hemera = new Hemera(nats, {logLevel: "info"})
    hemera.use(hemeraMongo, {
      mongo: {
        url: "mongodb://localhost:27017/test",
      },
    })
    hemera.ready(() => {
      mongoStore = hemera.exposition.hemeramongo.$mongoStore
      done()
    })
  })

  after(function() {
    hemera.close()
  })

  it("drop", function(done) {
    mongoStore.dropCollection({
      collection: "test"
    }, function(err) {
      assert.notExists(err)

      mongoStore._driver.listCollections().toArray(function(err, replies) {

        var found = false
        replies.forEach(function(document) {
          if (document.name == "test") {
            found = true
            return
          }
        })
        assert.equal(false, found)
      })
      done()
    })
  })

  it("create", function(done) {
    mongoStore.create({
      collection: "test",
      data: {
        name: "peter",
      }
    }, function(err, resp) {
      assert.notExists(err)
      assert.isObject(resp)
      assert.exists(resp._id)
      done()
    })
  })

  it("create multiple documents", function (done) {
    mongoStore.create({
      collection: "test",
      data: [
        { name: "peter" }, { name: "parker" }
      ]
    }, function (err, resp) {
      assert.notExists(err)
      assert.isObject(resp)
      assert.isArray(resp._ids)
      assert.lengthOf(resp._ids, 2)
      done()
    })
  })

  it("update", function (done) {
    mongoStore.create({
      collection: "test",
      data: {
        name: "peter"
      }
    }, function (err, resp) {
      assert.notExists(err)
      assert.isObject(resp)

      mongoStore.update({
        collection: "test",
        data: {
          $set: {
            name: "nadja"
          }
        },
        query: {
          name: "peter"
        }
      }, function (err, resp) {
        assert.notExists(err)
        assert.isObject(resp)
        assert.exists(resp._id)
        assert.exists(resp.name)
        done()
      })
    })
  })

  it("updatebyId", function (done) {
    mongoStore.create({
      collection: "test",
      data: {
        name: "peter"
      }
    }, function (err, resp) {
      assert.notExists(err)
      assert.isObject(resp)

      mongoStore.updateById({
        collection: "test",
        data: {
          $set: {
            name: "nadja"
          }
        },
        id: resp._id
      }, function (err, resp) {
        assert.notExists(err)
        assert.isObject(resp)
        assert.exists(resp._id)
        assert.exists(resp.name)

        done()
      })
    })
  })

  it("remove", function (done) {
    mongoStore.create({
      collection: "test",
      data: {
        name: "olaf"
      }
    }, function (err, resp) {
      assert.notExists(err)
      assert.isObject(resp)

      mongoStore.remove({
        collection: "test",
        query: {
          name: "olaf"
        }
      }, function (err, resp) {
        assert.notExists(err)
        assert.isObject(resp)
        assert.equal(resp.deletedCount, 1)
        done()
      })
    })
  })

  it("removeById", function (done) {
    mongoStore.create({
      collection: "test",
      data: {
        name: "olaf"
      }
    }, function (err, resp) {
      assert.notExists(err)
      assert.isObject(resp)

      mongoStore.removeById({
        collection: "test",
        id: resp._id
      }, function (err, resp) {
        assert.notExists(err)
        assert.exists(resp._id)
        assert.exists(resp.name)

        done()
      })
    })
  })

  it("findById", function (done) {
    mongoStore.create({
      collection: "test",
      data: {
        name: "jens"
      }
    }, function (err, resp) {
      assert.notExists(err)
      assert.isObject(resp)

      mongoStore.findById({
        collection: "test",
        id: resp._id
      }, function (err, resp) {
        assert.notExists(err)
        assert.exists(resp._id)
        assert.exists(resp.name)

        done()
      })
    })
  })

  it("find", function (done) {
    mongoStore.create({
      collection: "test",
      data: {
        name: "jens"
      }
    }, function (err, resp) {
      assert.notExists(err)
      assert.isObject(resp)

      mongoStore.find({
        collection: "test",
        query: {}
      }, function (err, resp) {
        assert.notExists(err)
        assert.isArray(resp.result)
        assert.exists(resp.result[0]._id)
        assert.exists(resp.result[0].name)
        done()
      })
    })
  })

  it("find with pagination", function (done) {
    mongoStore.create({
      collection: "test",
      data: {
        name: "jens"
      }
    }, function (err, resp) {
      assert.notExists(err)
      assert.isObject(resp)

      mongoStore.find({
        collection: "test",
        query: {},
      }, {
        limit: 10,
        offset: 2
      }, function (err, resp) {
        assert.notExists(err)
        assert.isArray(resp.result)
        assert.exists(resp.result[0]._id)
        assert.exists(resp.result[0].name)
        assert.equal(resp.limit, 10)
        assert.equal(resp.offset, 2)
        done()
      })
    })
  })

  it("replace", function (done) {
    mongoStore.create({
      collection: "test",
      data: {
        name: "nadine"
      }
    }, function (err, resp) {
      assert.notExists(err)
      assert.isObject(resp)

      mongoStore.replace({
        collection: "test",
        data: {
          $set: {
            name: "nadja"
          }
        },
        query: {}
      }, function (err, resp) {
        assert.notExists(err)
        assert.isObject(resp)
        assert.exists(resp.matchedCount)
        assert.exists(resp.modifiedCount)
        assert.exists(resp.upsertedCount)
        done()
      })
    })
  })

  it("replaceById", function (done) {
    mongoStore.create({
      collection: "test",
      data: {
        name: "nadja"
      }
    }, function (err, resp) {
      assert.notExists(err)
      assert.isObject(resp)

      mongoStore.replaceById({
        collection: "test",
        data: {
          name: "nadja"
        },
        id: resp._id
      }, function (err, resp) {
        assert.notExists(err)
        assert.exists(resp._id)
        assert.exists(resp.name)
        done()
      })
    })
  })


})
