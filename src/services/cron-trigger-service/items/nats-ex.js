const {connect} = require('nats-ex')

module.exports = {
  name: 'natsEx',
  need: ['config', 'logger'],
  build: async ({config, logger}) => {
    const {
      natsUrl
    } = config

    const natsEx = await connect({
      url: natsUrl,
      logger
    })

    return {
      item: natsEx,
      stop: () => natsEx.close()
    }
  }
}
