const Holder = require('the-holder')
const buildSandboxCollItem = require('../../../lib/build-sandbox-coll-item')
const itemDefinitions = require('../../../../../lib/item-definitions')

describe('action.main.request-budget', () => {
  let holder = null

  beforeEach(() => {
    holder = new Holder()
  })

  afterEach(async () => {
    await holder.close()
  })

  it('should request an amount of budget from the father', async () => {
    expect.assertions(1)
    const itemDefs = [
      ...itemDefinitions.filter(item => [
        'config',
        'logger',
        'natsEx',
        'mongodb',
        'service/main/action/requestBudget'
      ].includes(item.name)),
      buildSandboxCollItem('coll/father'),
      {
        name: 'test',
        need: [
          'coll/father',
          'natsEx',
          'service/main/action/requestBudget' // make sure this item is loaded before test
        ],
        build: async ({'coll/father': fatherColl, natsEx}) => {
          // setup data
          const father = {budget: 100}
          const {insertedId: fatherId} = await fatherColl.insertOne(father)
          const amount = 66

          // call action
          const allocation = await natsEx.call('action.main.request-budget', {fatherId: fatherId.toString(), amount})

          // check
          expect(allocation).toBe(66)
        }
      }
    ]
    await holder.load(itemDefs)
  })

  it('should only get remaining budget', async () => {
    expect.assertions(1)
    const itemDefs = [
      ...itemDefinitions.filter(item => [
        'config',
        'logger',
        'natsEx',
        'mongodb',
        'service/main/action/requestBudget'
      ].includes(item.name)),
      buildSandboxCollItem('coll/father'),
      {
        name: 'test',
        need: [
          'coll/father',
          'natsEx',
          'service/main/action/requestBudget' // make sure this item is loaded before test
        ],
        build: async ({'coll/father': fatherColl, natsEx}) => {
          // setup data
          const father = {budget: 66}
          const {insertedId: fatherId} = await fatherColl.insertOne(father)
          const amount = 100

          // call action
          const allocation = await natsEx.call('action.main.request-budget', {fatherId: fatherId.toString(), amount})

          // check
          expect(allocation).toBe(66)
        }
      }
    ]
    await holder.load(itemDefs)
  })
})
