const Joi = require('joi')
const buildValidator = require('n3h-joi-validator')
const buildStep = require('n3h-step-builder')

module.exports = {
  need: ['natsEx'],
  build: ({natsEx}) => buildStep({
    natsEx,
    serviceName: 'main',
    flowName: 'idle-sitter',
    stepName: 'request-ad',
    follow: {
      step: 'request-budget',
      case: 'ok'
    },
    validator: buildValidator({
      sitter: {
        motherId: Joi.string()
      },
      budget: Joi.number()
    }),
    async handler ({sitter, budget}, message) {
      try {
        const adId = await message.call('action.main.request-ad', {motherId: sitter.motherId})
        if (!adId) this.emit.failed({sitter, budget})
        else this.emit.ok({sitter, budget, adId})
      } catch (err) {
        this.emit.failed({sitter, budget})
        throw err
      }
    }
  })
}
