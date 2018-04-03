const Holder = require('the-holder')
const gracedown = require('grace-down')
const logger = require('simple-json-logger')

const itemDefinitions = require('./lib/item-definitions')

async function main () {
  const holder = new Holder({logger})

  // load items
  await holder.load(itemDefinitions)

  // setup graceful shutdown
  gracedown(async () => {
    logger.info('SIGTERM received, shutting down...')
    await holder.close()
    logger.info('Goodbye')
    process.exit(0)
  })

  logger.info('holder started', {pid: process.pid})
}

main().catch(err => {
  logger.error(err)
  process.exit(1)
})
