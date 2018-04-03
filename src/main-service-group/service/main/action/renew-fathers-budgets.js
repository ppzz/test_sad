/**
 * renew all fathers budgets
 */

const buildAction = require('n3h-action-builder')

module.exports = {
  need: ['natsEx', 'coll/father'],
  build: ({natsEx, 'coll/father': fatherColl}) => buildAction({
    natsEx,
    serviceName: 'main',
    actionName: 'renew-fathers-budgets',
    async handler () {
      const fathers = await fatherColl.find({}).toArray()
      const operations = fathers.map(father => ({
        updateOne: {
          filter: {_id: father._id},
          update: {$set: {budget: father.newBudget}}
        }
      }))
      if (fathers.length > 0) await fatherColl.bulkWrite(operations, {order: false})
    }
  })
}
