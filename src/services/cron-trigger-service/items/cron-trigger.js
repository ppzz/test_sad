const schedule = require('node-schedule')

module.exports = {
  name: 'cronTrigger',
  need: ['config', 'natsEx', 'logger'],
  build: ({config, natsEx, logger}) => {
    const {triggers} = config
    triggers.forEach(([cron, topic]) => {
      schedule.scheduleJob(cron, () => {
        natsEx.emit(topic)
      })
      logger.info('trigger loaded', {cron, topic})
    })
  }
}
