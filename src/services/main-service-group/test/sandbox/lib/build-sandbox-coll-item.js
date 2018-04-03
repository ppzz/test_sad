/*
build a sandbox coll item definition
 */

const uuid = require('uuid')

module.exports = function (name) {
  return {
    name: name,
    need: ['mongodb'],
    build: async ({mongodb}) => {
      const collName = `sandbox_${name}_${uuid.v4()}`
      return {
        item: mongodb.collection(collName),
        destroy: async () => {
          try {
            await mongodb.dropCollection(collName)
          } catch (err) {
            // if collection does not exist, it will complain this err, but it's fine
            if (err.message !== 'ns not found') throw err
          }
        }
      }
    }
  }
}
