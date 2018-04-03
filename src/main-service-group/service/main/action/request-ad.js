/*
request an ad from one mother
 */
const Chance = require('chance')
const moment = require('moment')
const _ = require('lodash')
const {ObjectID} = require('mongodb')
const Joi = require('joi')
const buildValidator = require('n3h-joi-validator')
const buildObjectGenerator = require('random-object-language')
const buildAction = require('n3h-action-builder')

const chance = new Chance()
const topics = {
  createAd: 'action.fb-ad-account.create-ad',
  queryAdFields: 'action.fb-ad-account.query-ad-fields'
}

module.exports = {
  need: ['natsEx', 'coll/mother', 'coll/ad'],
  build: ({natsEx, 'coll/mother': motherColl, 'coll/ad': adColl}) => {
    buildAction({
      natsEx,
      serviceName: 'main',
      actionName: 'request-ad',
      validator: buildValidator({
        motherId: Joi.string()
      }),
      async handler ({motherId}, message) {
        motherId = ObjectID(motherId)
        const mother = await motherColl.findOne({_id: motherId})
        let {fpt} = mother
        if (typeof fpt === 'string') fpt = JSON.parse(fpt)
        const pt = await buildObjectGenerator(fpt)()
        const paths = ['name', 'adset_spec.name', 'adset_spec.campaign_spec.name']
        const randomName = `SAD4_${moment().format('YYYY-MM-DD HH:mm:ss')}_${chance.first()}`
        paths.forEach(path => {
          _.set(pt, path, randomName)
        })
        const adId = await message.call(topics.createAd, {params: pt})
        const fbAd = await message.call(topics.queryAdFields, {adId, fields: ['adset_id', 'campaign_id', 'effective_status']})
        await adColl.insertOne({
          _id: adId,
          adsetId: fbAd.adset_id,
          campaignId: fbAd.campaign_id,
          effectiveStatus: fbAd.effective_status
        })
        return adId
      }
    })
  }
}
