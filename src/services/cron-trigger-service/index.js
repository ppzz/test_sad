const Holder = require('the-holder')
const logger = require('simple-json-logger')

const itemDefs = [
  require('./items/config'),
  require('./items/logger'),
  require('./items/nats-ex'),
  require('./items/cron-trigger')
]

async function main () {
  const holder = new Holder({logger})
  await holder.load(itemDefs)
}

main().catch((err) => {
  logger.error(err)
  process.exit(1)
})
