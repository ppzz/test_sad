const buildStep = require('n3h-step-builder')
const Joi = require('joi')
const buildValidator = require('n3h-joi-validator')

const topics = {
  queryAdFields: 'action.fb-ad-account.query-ad-fields',
  deleteCampaign: 'action.fb-ad-account.delete-campaign'
}

module.exports = {
  need: ['natsEx', 'coll/ad'],
  build: ({natsEx, 'coll/ad': adColl}) => buildStep({
    natsEx,
    serviceName: 'main',
    flowName: 'busy-sitter',
    stepName: 'delete-campaign',
    follow: {
      step: 'check-ad-spend',
      case: 'ok.overspend'
    },
    validator: buildValidator({
      sitter: {
        adId: Joi.string()
      }
    }),
    async handler ({sitter}, message) {
      const {adId} = sitter
      const ad = await adColl.findOne({_id: adId})
      const success = await message.call(topics.deleteCampaign, {campaignId: ad.campaignId})
      if (success) {
        const fbAd = await message.call(topics.queryAdFields, {adId, fields: ['effective_status']})
        await adColl.updateOne({_id: adId}, {$set: {effectiveStatus: fbAd.effective_status}})
        this.emit.ok({sitter})
      } else this.emit.failed({sitter})
    }
  })
}
