const buildStep = require('n3h-step-builder')
const Joi = require('joi')
const buildValidator = require('n3h-joi-validator')

module.exports = {
  need: ['natsEx', 'coll/ad'],
  build: ({natsEx, 'coll/ad': adColl}) => buildStep({
    natsEx,
    serviceName: 'main',
    flowName: 'busy-sitter',
    stepName: 'update-ad-spend',
    follow: {
      step: 'query-ad-spend',
      case: 'ok'
    },
    validator: buildValidator({
      sitter: {
        adId: Joi.string()
      },
      spend: Joi.number()
    }),
    async handler ({sitter, spend}) {
      const {adId} = sitter
      await adColl.updateOne({_id: adId}, {$set: {spend}})
      this.emit.ok()
    }
  })
}
