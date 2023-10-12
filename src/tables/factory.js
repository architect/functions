let { getAwsClient, getPorts } = require('../lib')
let paginate = true

/**
 * returns a data client
 */
module.exports = function reflectFactory (tables, callback) {
  let { ARC_ENV, AWS_REGION } = process.env
  let local = ARC_ENV === 'testing'

  getPorts((err, ports) => {
    if (err) callback(err)
    else {
      let port = ports.tables
      if (!port) {
        return callback(ReferenceError('Sandbox tables port not found'))
      }
      let config = {
        host: `localhost`,
        port,
        protocol: 'http',
        region: AWS_REGION || 'us-west-2',
        plugins: [ '@aws-lite/dynamodb' ],
      }
      getAwsClient(config, (err, aws) => {
        if (err) callback(err)
        else {
          let data = Object.keys(tables)
            .filter(name => {
              if (local && !name.includes('-production-')) return name
              return name
            })
            .reduce((client, fullName) => {
              let name = local ? fullName.replace(/.+-staging-/, '') : fullName
              client[name] = factory(tables[name])
              return client
            }, {})

          data.reflect = async () => tables
          let _name = name => tables[name]
          data.name = _name
          data._name = _name

          function go (method, params, callback) {
            if (callback) method(params)
              .then(result => callback(null, result))
              .catch(err => callback(err))
            else return method(params)
          }

          function factory (TableName) {
            return {
              delete (Key, callback) {
                if (callback) aws.dynamodb.DeleteItem({ TableName, Key })
                  .then(result => callback(null, result))
                  .catch(err => callback(err))

                else return new Promise((res, rej) => {
                  aws.dynamodb.DeleteItem({ TableName, Key })
                    .then(result => res(result))
                    .catch(rej)
                })
              },

              get (Key, callback) {
                if (callback) aws.dynamodb.GetItem({ TableName, Key })
                  .then(({ Item }) => callback(null, Item))
                  .catch(err => callback(err))

                else return new Promise((res, rej) => {
                  aws.dynamodb.GetItem({ TableName, Key })
                    .then(({ Item }) => res(Item))
                    .catch(rej)
                })
              },

              put (Item, callback) {
                return go(aws.dynamodb.PutItem, { TableName, Item }, callback)
              },

              query (params = {}, callback) {
                return go(aws.dynamodb.Query, { ...params, TableName }, callback)
              },

              scan (params = {}, callback) {
                return go(aws.dynamodb.Scan, { ...params, TableName }, callback)
              },

              scanAll (params = {}, callback) {
                if (callback) aws.dynamodb.Scan({ ...params, TableName, paginate })
                  .then(({ Items }) => callback(null, Items))
                  .catch(err => callback(err))

                else return new Promise((res, rej) => {
                  aws.dynamodb.Scan({ ...params, TableName, paginate })
                    .then(({ Items }) => res(Items))
                    .catch(rej)
                })
              },

              update (params, callback) {
                return go(aws.dynamodb.UpdateItem, { ...params, TableName }, callback)
              }
            }
          }
          callback(null, data)
        }
      })
    }
  })
}
