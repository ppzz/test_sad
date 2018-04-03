const buildStep = require('n3h-step-builder')
const Joi = require('joi')
const buildValidator = require('n3h-joi-validator')

module.exports = {
  need: ['natsEx'],
  build: ({natsEx}) => buildStep({
    natsEx,
    serviceName: 'main',
    flowName: 'busy-sitter',
    stepName: 'check-ad-spend',
    follow: {
      step: 'query-ad-spend',
      case: 'ok'
    },
    validator: buildValidator({
      sitter: {
        budget: Joi.number(),
        closeBudgetRate: Joi.number()
      },
      spend: Joi.number()
    }),
    async handler ({sitter, spend}) {
      const {budget, closeBudgetRate} = sitter
      const overspend = spend > (budget * closeBudgetRate)
      if (overspend) {
        this.emit.okCase('overspend', {sitter, spend})
      } else {
        this.emit.ok({sitter, spend})
      }
    }
  })
}
