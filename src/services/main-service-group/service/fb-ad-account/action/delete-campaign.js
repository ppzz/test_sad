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
    actionName: 'delete-campaign',
    validator: buildValidator({
      campaignId: Joi.string()
    }),
    async handler ({campaignId}) {
      const {
        facebookAccessToken
      } = config

      const response = await requestFacebook({
        apiVersion,
        accessToken: facebookAccessToken,
        method: 'DELETE',
        path: campaignId
      })

      return response.success
    }
  })
}
