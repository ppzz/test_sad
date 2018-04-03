const {MongoClient} = require('mongodb')

module.exports = {
  need: 'config',
  build: async ({config}) => {
    const {
      mongoUrl,
      mongoDb
    } = config

    const client = await MongoClient.connect(mongoUrl)
    const db = client.db(mongoDb)

    return {
      item: db,
      destroy: () => client.close(true)
    }
  }
}
