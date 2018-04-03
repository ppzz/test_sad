/*
query the spend of an ad
 */

const buildAction = require('n3h-action-builder')
const requestFacebook = require('request-facebook')
const Joi = require('joi')
const buildValidator = require('n3h-joi-validator')
const _ = require('lodash')

const apiVersion = 'v2.12'

module.exports = {
  need: ['natsEx', 'config', 'logger'],
  build: ({natsEx, config}) => buildAction({
    natsEx,
    serviceName: 'fb-ad-account',
    actionName: 'query-ad-spend',
    validator: buildValidator({
      adId: Joi.string()
    }),
    async handler ({adId}) {
      const {
        facebookAccessToken
      } = config

      const response = await requestFacebook({
        apiVersion,
        accessToken: facebookAccessToken,
        method: 'GET',
        path: `${adId}/insights`,
        query: {
          fields: 'spend',
          date_preset: 'lifetime'
        }
      })

      return _.get(response, 'data.0.spend', 0)
    }
  })
}
