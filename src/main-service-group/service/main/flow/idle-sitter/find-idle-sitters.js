/*
entry step
find all idle setters and dispatch them
 */

const buildStep = require('n3h-step-builder')

module.exports = {
  need: ['natsEx', 'coll/sitter'],
  build: ({natsEx, 'coll/sitter': sitterColl}) => buildStep({
    natsEx,
    serviceName: 'main',
    flowName: 'idle-sitter',
    stepName: 'find-idle-sitters',
    async handler () {
      const sitters = await sitterColl.find({status: 'idle'}).toArray()
      if (sitters.length === 0) {
        this.emit.okCase('empty')
      } else {
        sitters.forEach(sitter => {
          this.emit.ok({sitter})
        })
      }
    }
  })
}
