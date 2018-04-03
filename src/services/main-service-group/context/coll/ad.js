module.exports = {
  need: ['config', 'mongodb'],
  build: async ({config, mongodb}) => {
    return {
      item: mongodb.collection(config.mongoCollAd)
    }
  }
}
