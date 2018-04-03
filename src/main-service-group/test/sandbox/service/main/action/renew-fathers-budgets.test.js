const Holder = require('the-holder')
const buildSandboxCollItem = require('../../../lib/build-sandbox-coll-item')
const itemDefinitions = require('../../../../../lib/item-definitions')

describe('action.main.renew-fathers-budgets', () => {
  let holder = null

  beforeEach(() => {
    holder = new Holder()
  })

  afterEach(async () => {
    await holder.close()
  })

  it('should renew the budgets of all fathers', async () => {
    expect.assertions(1)
    const itemDefs = [
      ...itemDefinitions.filter(item => [
        'config',
        'logger',
        'natsEx',
        'mongodb',
        'service/main/action/renewFathersBudgets'
      ].includes(item.name)),
      buildSandboxCollItem('coll/father'),
      {
        name: 'test',
        need: [
          'coll/father',
          'natsEx',
          'service/main/action/renewFathersBudgets' // make sure this item is loaded before test
        ],
        build: async ({'coll/father': fatherColl, natsEx}) => {
          // setup data
          const father = {budget: 100, newBudget: 666}
          const {insertedId: fatherId} = await fatherColl.insertOne(father)

          // call action
          await natsEx.call('action.main.renew-fathers-budgets')

          // check
          const newFather = await fatherColl.findOne({_id: fatherId})
          expect(newFather.budget).toBe(666)
        }
      }
    ]
    await holder.load(itemDefs)
  })
})
