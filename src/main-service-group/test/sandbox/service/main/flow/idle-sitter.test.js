const Holder = require('the-holder')
const buildSandboxCollItem = require('../../../lib/build-sandbox-coll-item')
const itemDefinitions = require('../../../../../lib/item-definitions')

describe('flow/idleSitter', () => {
  let holder = null

  beforeEach(() => {
    holder = new Holder()
  })

  afterEach(async () => {
    await holder.close()
  })

  it('should activate the sitter', (done) => {
    const itemDefs = [
      ...itemDefinitions.filter(item => [
        'config',
        'logger',
        'natsEx',
        'mongodb',
        'service/main/action/requestAd',
        'service/main/action/requestBudget',
        'service/main/action/returnBudget',
        'service/main/flow/idleSitter/activateSitter',
        'service/main/flow/idleSitter/findIdleSitters',
        'service/main/flow/idleSitter/requestAd',
        'service/main/flow/idleSitter/requestBudget',
        'service/main/flow/idleSitter/returnBudget',
        'service/fbAdAccount/action/createAd',
        'service/fbAdAccount/action/queryAdFields'
      ].includes(item.name)),
      buildSandboxCollItem('coll/sitter'),
      buildSandboxCollItem('coll/father'),
      buildSandboxCollItem('coll/mother'),
      buildSandboxCollItem('coll/ad'),
      {
        name: 'test',
        need: [
          'natsEx',
          'coll/sitter',
          'coll/father',
          'coll/mother',
          'coll/ad',
          'service/fbAdAccount/action/createAd',
          'service/main/action/requestAd',
          'service/main/action/requestBudget',
          'service/main/action/returnBudget',
          'service/main/flow/idleSitter/activateSitter',
          'service/main/flow/idleSitter/findIdleSitters',
          'service/main/flow/idleSitter/requestAd',
          'service/main/flow/idleSitter/requestBudget',
          'service/main/flow/idleSitter/returnBudget',
          'service/fbAdAccount/action/queryAdFields'
        ],
        build: async (
          {
            natsEx,
            'coll/sitter': sitterColl,
            'coll/father': fatherColl,
            'coll/mother': motherColl
          }
        ) => {
          const {insertedId: fatherId} = await fatherColl.insertOne({budget: 100})
          const {insertedId: motherId} = await motherColl.insertOne({fpt: fpt})
          const {insertedId: sitterId} = await sitterColl.insertOne({
            fatherId: fatherId.toString(),
            motherId: motherId.toString(),
            status: 'idle',
            requestBudget: 66
          })

          natsEx.on('flow.main.idle-sitter.activate-sitter.ok', async ({sitter}) => {
            try {
              const {_id, fatherId: finalFatherId, motherId: finalMotherId, status, requestBudget} = sitter
              expect(_id).toBe(sitterId.toString())
              expect(finalFatherId).toBe(fatherId.toString())
              expect(finalMotherId).toBe(motherId.toString())
              expect(status).toBe('idle')
              expect(requestBudget).toBe(66)
              const {status: finalStatus} = await sitterColl.findOne({_id: sitterId})
              expect(finalStatus).toBe('busy')
              done()
            } catch (err) {
              done(err)
            }
          })

          natsEx.emit('flow.main.idle-sitter.find-idle-sitters')
        }
      }
    ]
    holder.load(itemDefs)
  }, 60 * 1000)

  it('should fail to request budget from fatherColl', (done) => {
    const itemDefs = [
      ...itemDefinitions.filter(item => [
        'config',
        'logger',
        'natsEx',
        'mongodb',
        'service/main/action/requestBudget',
        'service/main/flow/idleSitter/findIdleSitters',
        'service/main/flow/idleSitter/requestBudget'
      ].includes(item.name)),
      buildSandboxCollItem('coll/sitter'),
      buildSandboxCollItem('coll/father'),
      buildSandboxCollItem('coll/mother'),
      buildSandboxCollItem('coll/ad'),
      {
        name: 'test',
        need: [
          'natsEx',
          'coll/sitter',
          'coll/father',
          'coll/mother',
          'coll/ad',
          'service/main/action/requestBudget',
          'service/main/flow/idleSitter/findIdleSitters',
          'service/main/flow/idleSitter/requestBudget'
        ],
        build: async (
          {
            natsEx,
            'coll/sitter': sitterColl,
            'coll/father': fatherColl
          }
        ) => {
          const {insertedId: fatherId} = await fatherColl.insertOne({budget: 0})
          const {insertedId: sitterId} = await sitterColl.insertOne({
            fatherId: fatherId.toString(),
            status: 'idle',
            requestBudget: 66
          })

          natsEx.on('flow.main.idle-sitter.request-budget.failed', async ({sitter}) => {
            try {
              const {_id, fatherId: finalFatherId, status, requestBudget} = sitter
              expect(_id).toBe(sitterId.toString())
              expect(finalFatherId).toBe(fatherId.toString())
              expect(status).toBe('idle')
              expect(requestBudget).toBe(66)
              done()
            } catch (err) {
              done(err)
            }
          })

          natsEx.emit('flow.main.idle-sitter.find-idle-sitters')
        }
      }
    ]
    holder.load(itemDefs)
  }, 60 * 1000)

  it('should fail to request ad and return budget', (done) => {
    const itemDefs = [
      ...itemDefinitions.filter(item => [
        'config',
        'logger',
        'natsEx',
        'mongodb',
        'service/main/action/requestAd',
        'service/main/action/requestBudget',
        'service/main/action/returnBudget',
        'service/main/flow/idleSitter/findIdleSitters',
        'service/main/flow/idleSitter/requestAd',
        'service/main/flow/idleSitter/requestBudget',
        'service/main/flow/idleSitter/returnBudget',
        'service/fbAdAccount/action/createAd',
        'service/fbAdAccount/action/queryAdFields'
      ].includes(item.name)),
      buildSandboxCollItem('coll/sitter'),
      buildSandboxCollItem('coll/father'),
      buildSandboxCollItem('coll/mother'),
      buildSandboxCollItem('coll/ad'),
      {
        name: 'test',
        need: [
          'natsEx',
          'coll/sitter',
          'coll/father',
          'coll/mother',
          'coll/ad',
          'service/fbAdAccount/action/createAd',
          'service/main/action/requestAd',
          'service/main/action/requestBudget',
          'service/main/action/returnBudget',
          'service/main/flow/idleSitter/findIdleSitters',
          'service/main/flow/idleSitter/requestAd',
          'service/main/flow/idleSitter/requestBudget',
          'service/main/flow/idleSitter/returnBudget',
          'service/fbAdAccount/action/queryAdFields'
        ],
        build: async (
          {
            natsEx,
            'coll/sitter': sitterColl,
            'coll/father': fatherColl,
            'coll/mother': motherColl
          }
        ) => {
          const {insertedId: fatherId} = await fatherColl.insertOne({budget: 100})
          const {insertedId: motherId} = await motherColl.insertOne({fpt: {}})
          const {insertedId: sitterId} = await sitterColl.insertOne({
            fatherId: fatherId.toString(),
            motherId: motherId.toString(),
            status: 'idle',
            requestBudget: 66
          })

          natsEx.on('flow.main.idle-sitter.return-budget.ok', async ({sitter}) => {
            try {
              const {_id, fatherId: finalFatherId, motherId: finalMotherId, status, requestBudget} = sitter
              expect(_id).toBe(sitterId.toString())
              expect(finalFatherId).toBe(fatherId.toString())
              expect(finalMotherId).toBe(motherId.toString())
              expect(status).toBe('idle')
              expect(requestBudget).toBe(66)
              const {budget} = await fatherColl.findOne({_id: fatherId})
              expect(budget).toBe(100)
              done()
            } catch (err) {
              done(err)
            }
          })

          natsEx.emit('flow.main.idle-sitter.find-idle-sitters')
        }
      }
    ]
    holder.load(itemDefs)
  }, 60 * 1000)
})

const fpt = {
  'adset_spec': {
    '@type': 'assigned',
    'value': {
      'targeting': {
        'geo_locations': {
          'countries': [
            'HK',
            'TW'
          ],
          'location_types': [
            'home'
          ]
        },
        'publisher_platforms': [
          'facebook'
        ],
        'facebook_positions': [
          'feed'
        ],
        'user_os': [
          'Android_ver_6.0_and_above'
        ],
        'flexible_spec': [
          {
            'interests': [
              {
                'id': '6003206308286',
                'name': 'Science fiction movies'
              }
            ]
          }
        ],
        'user_device': [
          'g5',
          'g6',
          'galaxy s7',
          'galaxy s7 active',
          'galaxy s7 edge',
          'galaxy s8',
          'galaxy s8+',
          'mate 9',
          'moto z droid',
          'moto z play dual',
          'nexus 6p',
          'p10 lite',
          'p9',
          'p9 lite',
          'pixel',
          'u ultra',
          'v20'
        ]
      },
      'optimization_goal': 'OFFSITE_CONVERSIONS',
      'promoted_object': {
        'application_id': '1616662925227761',
        'object_store_url': 'http://play.google.com/store/apps/details?id=com.tap4fun.reignofwar',
        'custom_event_type': 'PURCHASE'
      },
      'campaign_spec': {
        'name': 'SAD',
        'status': 'ACTIVE',
        'objective': 'APP_INSTALLS',
        'buying_type': 'AUCTION'
      },
      'attribution_spec': [
        {
          'event_type': 'CLICK_THROUGH',
          'window_days': 7
        }
      ],
      'billing_event': 'IMPRESSIONS',
      'bid_amount': 637,
      'daily_budget': 5000,
      'status': 'ACTIVE',
      'name': 'SAD'
    }
  },
  'creative': {
    '@type': 'assigned',
    'value': {
      'name': '主页帖中的广告 #6,072,102,338,398',
      'object_story_spec': {
        'page_id': '585757974886198',
        'link_data': {
          'link': 'http://play.google.com/store/apps/details?id=com.tap4fun.reignofwar',
          'message': 'try it out',
          'image_hash': 'ab659f1a43e2079435d08025bb3409b3',
          'call_to_action': {
            'type': 'INSTALL_MOBILE_APP',
            'value': {
              'link': 'http://play.google.com/store/apps/details?id=com.tap4fun.reignofwar'
            }
          }
        }
      }
    }
  },
  'status': {
    '@type': 'assigned',
    'value': 'ACTIVE'
  },
  'name': {
    '@type': 'assigned',
    'value': 'SAD'
  }
}
