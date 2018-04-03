const {ObjectID} = require('mongodb')
const buildStep = require('n3h-step-builder')
const Joi = require('joi')
const buildValidator = require('n3h-joi-validator')

module.exports = {
  need: ['natsEx', 'coll/sitter'],
  build: ({natsEx, 'coll/sitter': sitterColl}) => buildStep({
    natsEx,
    serviceName: 'main',
    flowName: 'busy-sitter',
    stepName: 'update-sitter-status-to-idle',
    follow: {
      step: 'check-ad-spend',
      case: 'ok.overspend'
    },
    validator: buildValidator({
      sitter: {
        _id: Joi.string()
      }
    }),
    async handler ({sitter}) {
      const {_id} = sitter
      await sitterColl.updateOne({_id: ObjectID(_id)}, {
        $set: {status: 'idle'},
        $unset: {
          budget: true,
          adId: true
        }
      })
      this.emit.ok({sitter})
    }
  })
}
