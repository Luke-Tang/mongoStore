/**
 * Created by tangkun on 2017/8/9.
 */
const Store = require("hemera-store")
const ObjectID = require("mongodb").ObjectID
const _ = require("lodash")

class MongoStore extends Store {

  /**
   * Creates an instance of MonogStore
   * @param driver {Object} instance of the connected mongodb database
   * @param options {any}
   */
  constructor(driver, options = {}) {
    options.mongo = {}
    super(driver, options)
  }

  create(req, cb) {
    const collection = this._driver.collection(req.collection)
    if (req.data instanceof Array) {
      collection.insertMany(req.data, this.options.store.create,
        function(err, resp) {
          if (err) {
            return cb(err)
          }
          const result = {
            _ids: resp.insertedIds,
          }
          cb(err, result)
        })
    } else if (req.data instanceof Object) {
      collection.insertOne(req.data, this.options.store.create,
        function(err, resp) {
          if (err) {
            return cb(err)
          }
          const result = {
            _id: resp.insertedId.toString(),
          }
          cb(err, result)
        })
    }
  }

  remove(req, cb) {
    const collection = this._driver.collection(req.collection)
    collection.deleteMany(req.query, this.options.store.remove,
      function(err, resp) {
        if (err) {
          return cb(err)
        }
        const result = {
          deletedCount: resp.deletedCount,
        }
        cb(err, result)
      })
  }

  removeById(req, cb) {
    const collection = this._driver.collection(req.collection)
    collection.findOneAndDelete({
      _id: ObjectID(req.id),
    }, this.options.store.removeById, function(err, resp) {
      if (err) {
        return cb(err)
      }
      const result = resp.value
      cb(err, result)
    })
  }

  update(req, cb) {
    const collection = this._driver.collection(req.collection)
    collection.findOneAndUpdate(req.query, req.data, this.options.store.update,
      function(err, resp) {
        if (err) {
          return cb(err)
        }
        const result = resp.value
        cb(err, result)
      })
  }

  updateById(req, cb) {
    const collection = this._driver.collection(req.collection)
    collection.findOneAndUpdate({
      _id: ObjectID(req.id),
    }, req.data, this.options.store.updateById, function(err, resp) {
      if (err) {
        return cb(err)
      }
      const result = resp.value
      cb(err, result)
    })
  }

  find(req, options, cb) {
    const collection = this._driver.collection(req.collection)
    let cursor = collection.find(req.query, this.options.store.find)

    if (_.isFunction(options)) {
      cb = options
    } else if (options) {
      if (options.limit) {
        cursor = cursor.limit(options.limit)
      }
      if (options.offset) {
        cursor = cursor.skip(options.offset)
      }
      if (options.fields) {
        cursor = cursor.project(options.fields)
      }
      if (options.orderBy) {
        cursor = cursor.sort(options.orderBy)
      }
    }
    cursor.toArray(function(err, resp) {
      if (err) {
        return cb(err)
      }
      const result = Object.assign({
        result: resp,
      }, options)
      cb(err, result)
    })
  }

  findById(req, cb) {
    const collection = this._driver.collection(req.collection)
    collection.findOne({
      _id: ObjectID(req.id),
    }, this.options.store.findById, function(err, resp) {
      cb(err, resp)
    })
  }

  replace(req, cb) {
    const collection = this._driver.collection(req.collection)
    collection.updateMany(req.query, req.data, this.options.store.replace,
      function(err, resp) {
        if (err) {
          return cb(err)
        }
        const result = {
          matchedCount: resp.matchedCount,
          modifiedCount: resp.modifiedCount,
          upsertedCount: resp.upsertedCount,
          upsertedId: resp.upsertedId,
        }
        cb(err, result)
      })
  }

  replaceById(req, cb) {
    const collection = this._driver.collection(req.collection)
    collection.findOneAndReplace({
      _id: ObjectID(req.id),
    }, req.data, this.options.store.replaceById, function(err, resp) {
      if (err) {
        return cb(err)
      }
      const result = resp.value
      cb(err, result)
    })
  }

  dropCollection(req, cb) {
    const collection = this._driver.collection(req.collection)
    collection.drop(cb)
  }
}

module.exports = MongoStore