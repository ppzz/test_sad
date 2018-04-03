/*
create an facebook ad
 */

const buildAction = require('n3h-action-builder')
const requestFacebook = require('request-facebook')
const Joi = require('joi')
const buildValidator = require('n3h-joi-validator')

const apiVersion = 'v2.12'

module.exports = {
  need: ['natsEx', 'config'],
  build: ({natsEx, config}) => buildAction({
    natsEx,
    serviceName: 'fb-ad-account',
    actionName: 'create-ad',
    validator: buildValidator({
      params: Joi.object()
    }),
    async handler ({params}) {
      const {
        facebookAccessToken,
        facebookAdAccountId
      } = config

      const ad = await requestFacebook({
        apiVersion,
        accessToken: facebookAccessToken,
        method: 'POST',
        path: `${facebookAdAccountId}/ads`,
        body: params
      })

      return ad.id
    }
  })
}
