# mongoStore

This is a plugin to use Mongodb with Hemera. All CURD is directly manipulate the database driver

# Prerequisites

1. [Install and run NATS Server](http://nats.io/documentation/tutorials/gnatsd-install/)

2. Start mongodb


# Example

```js
'use strict'

const Hemera = require('nats-hemera')
const hemeraMongo = require('hemeramongo')
const nats = require('nats').connect()

const hemera = new Hemera(nats, {
  logLevel: 'info'
})

hemera.use(hemeraMongo, {
  mongo: {
    url: "mongodb://localhost:27017/test",
  },
})
    

hemera.ready(() => {
  const mongoStore = hemera.exposition.hemeramongo.$mongoStore
  mongoStore.create({
    collection: "test",
    data: {
      name: "peter",
    }
  }, function(err, resp) {
    hemera.log.info(resp, 'Query result')
  })
})

```

# Test

```
npm run test
```

# Code coverage

```
npm run coverage
```

# Linting

```
npm run lint
```
