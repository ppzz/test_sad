/*
return an amount of budget to father
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
    actionName: 'return-budget',
    validator: buildValidator({
      fatherId: Joi.string(),
      amount: Joi.number()
    }),
    async handler ({fatherId, amount}) {
      fatherId = ObjectID(fatherId)
      await fatherColl.updateOne({_id: fatherId}, {$inc: {budget: amount}})
    }
  })
}
