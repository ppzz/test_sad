const buildAction = require('n3h-action-builder')
const requestFacebook = require('request-facebook')
const Joi = require('joi')
const buildValidator = require('n3h-joi-validator')

const apiVersion = 'v2.12'

module.exports = {
  need: ['natsEx', 'config', 'logger'],
  build: ({natsEx, config}) => buildAction({
    natsEx,
    serviceName: 'fb-ad-account',
    actionName: 'query-ad-fields',
    validator: buildValidator({
      adId: Joi.string(),
      fields: Joi.array().items(Joi.string())
    }),
    async handler ({adId, fields}) {
      const {
        facebookAccessToken
      } = config

      return requestFacebook({
        apiVersion,
        accessToken: facebookAccessToken,
        method: 'GET',
        path: `${adId}`,
        query: {
          fields: fields.join(',')
        }
      })
    }
  })
}
