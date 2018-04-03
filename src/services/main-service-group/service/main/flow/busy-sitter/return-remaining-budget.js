const {ObjectID} = require('mongodb')
const buildStep = require('n3h-step-builder')
const Joi = require('joi')
const buildValidator = require('n3h-joi-validator')

module.exports = {
  need: ['natsEx', 'coll/father'],
  build: ({natsEx, 'coll/father': fatherColl}) => buildStep({
    natsEx,
    serviceName: 'main',
    flowName: 'busy-sitter',
    stepName: 'return-remaining-budget',
    follow: {
      step: 'check-ad-spend',
      case: 'ok.overspend'
    },
    validator: buildValidator({
      sitter: {
        fatherId: Joi.string(),
        budget: Joi.number()
      },
      spend: Joi.number()
    }),
    async handler ({sitter, spend}) {
      const {fatherId, budget} = sitter
      const remainingBudget = budget - spend
      await fatherColl.updateOne({
        _id: ObjectID(fatherId)
      }, {
        $inc: {budget: remainingBudget}
      })
      this.emit.ok({sitter, returnedAmount: remainingBudget})
    }
  })
}
