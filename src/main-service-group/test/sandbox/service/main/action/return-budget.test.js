const Holder = require('the-holder')
const buildSandboxCollItem = require('../../../lib/build-sandbox-coll-item')
const itemDefinitions = require('../../../../../lib/item-definitions')

describe('action.main.return-budget', () => {
  let holder = null

  beforeEach(() => {
    holder = new Holder()
  })

  afterEach(async () => {
    await holder.close()
  })

  it('should return an amount of budget to the father', async () => {
    expect.assertions(1)
    const itemDefs = [
      ...itemDefinitions.filter(item => [
        'config',
        'logger',
        'natsEx',
        'mongodb',
        'service/main/action/returnBudget'
      ].includes(item.name)),
      buildSandboxCollItem('coll/father'),
      {
        name: 'test',
        need: [
          'coll/father',
          'natsEx',
          'service/main/action/returnBudget' // make sure this item is loaded before test
        ],
        build: async ({'coll/father': fatherColl, natsEx}) => {
          // setup data
          const father = {budget: 100}
          const {insertedId: fatherId} = await fatherColl.insertOne(father)
          const amount = 66

          // call action
          await natsEx.call('action.main.return-budget', {fatherId: fatherId.toString(), amount})

          // check
          const fatherAfterAction = await fatherColl.findOne({_id: fatherId})
          expect(fatherAfterAction.budget).toBe(166)
        }
      }
    ]
    await holder.load(itemDefs)
  })
})
