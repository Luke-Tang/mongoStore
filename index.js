'use strict'

const Hp = require('hemera-plugin')
const Mongodb = require('mongodb')
const MongoStore = require('./lib/store')


exports.plugin = Hp(function hemeraMongo(options, next) {
    const hemera = this
    Mongodb.MongoClient.connect(options.mongo.url, options.mongos.options, function (err, db) {
        if (err) {
            return hemera.emit('error', err)
        }

        const mongoStore = new MongoStore(db, options)

        hemera.expose('$mongoStore', mongoStore)

        // Gracefully shutdown
        hemera.ext('onClose', (ctx, done) => {
            hemera.log.debug('Mongodb connection closed!')
            db.close(done)
        })

        hemera.log.debug('DB connected!')
        next()
    })
})

exports.options = {
    payloadValidator: 'hemera-joi',
    mongos: {},
    // serializeResult: false,
    mongo: {
        url: 'mongodb://localhost:27017/'
    },
    store: {
        create: {},
        update: {},
        updateById: {},
        find: {},
        findById: {},
        remove: {},
        removeById: {},
        replace: { upsert: true },
        replaceById: {}
    }
}

exports.attributes = {
    pkg: require('./package.json')
}
