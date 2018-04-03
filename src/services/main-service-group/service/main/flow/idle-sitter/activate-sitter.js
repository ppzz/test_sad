const {ObjectID} = require('mongodb')
const Joi = require('joi')
const buildValidator = require('n3h-joi-validator')
const buildStep = require('n3h-step-builder')

module.exports = {
  need: ['natsEx', 'coll/sitter'],
  build: ({natsEx, 'coll/sitter': sitterColl}) => buildStep({
    natsEx,
    serviceName: 'main',
    flowName: 'idle-sitter',
    stepName: 'activate-sitter',
    follow: {
      step: 'request-ad',
      case: 'ok'
    },
    validator: buildValidator({
      sitter: {
        _id: Joi.string()
      },
      budget: Joi.number(),
      adId: Joi.string()
    }),
    async handler ({sitter, budget, adId}) {
      await sitterColl.updateOne(
        {_id: ObjectID(sitter._id)},
        {$set: {status: 'busy', adId: adId, budget: budget}}
      )
      this.emit.ok({sitter})
    }
  })
}
