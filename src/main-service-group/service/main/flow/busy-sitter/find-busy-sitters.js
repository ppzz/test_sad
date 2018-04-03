/*
entry step
find all busy setters and dispatch them
 */

const buildStep = require('n3h-step-builder')

module.exports = {
  need: ['natsEx', 'coll/sitter'],
  build: ({natsEx, 'coll/sitter': sitterColl}) => buildStep({
    natsEx,
    serviceName: 'main',
    flowName: 'busy-sitter',
    stepName: 'find-busy-sitters',
    async handler () {
      const sitters = await sitterColl.find({status: 'busy'}).toArray()
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
