/*
request an amount of budget to father
 */

const {ObjectID} = require('mongodb')
const Joi = require('joi')
const buildValidator = require('n3h-joi-validator')
const buildAction = require('n3h-action-builder')

module.exports = {
  need: ['natsEx', 'coll/father'],
  build: ({natsEx, 'coll/father': fatherColl}) => buildAction({
    natsEx,
    serviceName: 'main',
    actionName: 'request-budget',
    validator: buildValidator({
      fatherId: Joi.string(),
      amount: Joi.number().min(0)
    }),
    async handler ({fatherId, amount}) {
      fatherId = ObjectID(fatherId)
      const father = await fatherColl.findOne({_id: fatherId})
      const {budget} = father
      const allocation = Math.min(budget, amount)
      await fatherColl.updateOne({_id: fatherId}, {$inc: {budget: -allocation}})
      return allocation
    }
  })
}
