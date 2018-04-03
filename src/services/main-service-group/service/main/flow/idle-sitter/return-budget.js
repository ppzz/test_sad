const Joi = require('joi')
const buildValidator = require('n3h-joi-validator')
const buildStep = require('n3h-step-builder')

module.exports = {
  need: ['natsEx'],
  build: ({natsEx}) => buildStep({
    natsEx,
    serviceName: 'main',
    flowName: 'idle-sitter',
    stepName: 'return-budget',
    follow: {
      step: 'request-ad',
      case: 'failed'
    },
    validator: buildValidator({
      sitter: {
        fatherId: Joi.string()
      },
      budget: Joi.number()
    }),
    async handler ({sitter, budget}, message) {
      await message.call('action.main.return-budget', {fatherId: sitter.fatherId, amount: budget})
      this.emit.ok({sitter})
    }
  })
}
