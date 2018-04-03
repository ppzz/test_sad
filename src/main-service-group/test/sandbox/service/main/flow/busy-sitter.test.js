const Holder = require('the-holder')
const buildSandboxCollItem = require('../../../lib/build-sandbox-coll-item')
const itemDefinitions = require('../../../../../lib/item-definitions')
const buildObjectGenerator = require('random-object-language')
const {ObjectID} = require('mongodb')

describe('flow/busySitter', () => {
  let holder = null

  beforeEach(() => {
    holder = new Holder()
  })

  afterEach(() => {
    return holder.close()
  })

  it('should find busy sitters,check their spend and delete the overspend ad', (done) => {
    const itemDefs = [
      ...itemDefinitions.filter(item => [
        'config',
        'logger',
        'natsEx',
        'mongodb',
        'service/main/flow/busySitter/checkAdSpend',
        'service/main/flow/busySitter/deleteCampaign',
        'service/main/flow/busySitter/findBusySitters',
        'service/main/flow/busySitter/queryAdSpend',
        'service/main/flow/busySitter/returnRemainingBudget',
        'service/main/flow/busySitter/updateAdSpend',
        'service/main/flow/busySitter/updateSitterStatusToIdle',
        'service/fbAdAccount/action/createAd',
        'service/fbAdAccount/action/queryAdSpend',
        'service/fbAdAccount/action/deleteCampaign',
        'service/fbAdAccount/action/queryAdFields'
      ].includes(item.name)),
      buildSandboxCollItem('coll/sitter'),
      buildSandboxCollItem('coll/father'),
      buildSandboxCollItem('coll/ad'),
      {
        name: 'test',
        need: [
          'natsEx',
          'coll/sitter',
          'coll/father',
          'coll/ad',
          'service/main/flow/busySitter/checkAdSpend',
          'service/main/flow/busySitter/deleteCampaign',
          'service/main/flow/busySitter/findBusySitters',
          'service/main/flow/busySitter/queryAdSpend',
          'service/main/flow/busySitter/returnRemainingBudget',
          'service/main/flow/busySitter/updateAdSpend',
          'service/main/flow/busySitter/updateSitterStatusToIdle',
          'service/fbAdAccount/action/createAd',
          'service/fbAdAccount/action/queryAdSpend',
          'service/fbAdAccount/action/deleteCampaign',
          'service/fbAdAccount/action/queryAdFields'
        ],
        build: async ({natsEx, 'coll/sitter': sitterColl, 'coll/father': fatherColl, 'coll/ad': adColl}) => {
          const {insertedId: fatherId} = await fatherColl.insertOne({budget: 0})
          const pt = await buildObjectGenerator(fpt)()
          const adId = await natsEx.call('action.fb-ad-account.create-ad', {params: pt})
          const fbAd = await natsEx.call('action.fb-ad-account.query-ad-fields', {
            adId,
            fields: ['adset_id', 'campaign_id', 'effective_status']
          })
          await adColl.insertOne({
            _id: adId,
            adsetId: fbAd.adset_id,
            campaignId: fbAd.campaign_id,
            effectiveStatus: fbAd.effective_status
          })

          const {insertedId: sitterId} = await sitterColl.insertOne({
            fatherId: fatherId.toString(),
            adId: adId,
            status: 'busy',
            budget: 0,
            closeBudgetRate: 0.7
          })

          const promises = [
            new Promise((resolve, reject) => {
              natsEx.on('flow.main.busy-sitter.delete-campaign.ok', async ({sitter}) => {
                try {
                  const {adId: finalAdId} = sitter
                  expect(finalAdId).toBe(adId)
                  const {effectiveStatus} = await adColl.findOne({_id: adId})
                  expect(effectiveStatus).toBe('DELETED')
                  resolve()
                } catch (err) {
                  reject(err)
                }
              })
            }),
            new Promise((resolve, reject) => {
              natsEx.on('flow.main.busy-sitter.return-remaining-budget.ok', async ({sitter, returnedAmount}) => {
                try {
                  const {fatherId: finalFatherId} = sitter
                  expect(finalFatherId).toBe(fatherId.toString())
                  expect(returnedAmount).toBeLessThan(0)
                  resolve()
                } catch (err) {
                  reject(err)
                }
              })
            }),
            new Promise((resolve, reject) => {
              natsEx.on('flow.main.busy-sitter.update-sitter-status-to-idle.ok', async ({sitter}) => {
                try {
                  const {_id} = sitter
                  expect(_id).toBe(sitterId.toString())
                  const {status} = await sitterColl.findOne({_id: ObjectID(_id)})
                  expect(status).toBe('idle')
                  resolve()
                } catch (err) {
                  reject(err)
                }
              })
            })
          ]

          natsEx.emit('flow.main.busy-sitter.find-busy-sitters')

          Promise.all(promises).then(() => done()).catch(done)
        }
      }
    ]
    holder.load(itemDefs)
  }, 60 * 1000)

  it('should find busy sitters,check their spend and should not find overspend ad', (done) => {
    const itemDefs = [
      ...itemDefinitions.filter(item => [
        'config',
        'logger',
        'natsEx',
        'mongodb',
        'service/main/flow/busySitter/checkAdSpend',
        'service/main/flow/busySitter/findBusySitters',
        'service/main/flow/busySitter/queryAdSpend',
        'service/fbAdAccount/action/createAd',
        'service/fbAdAccount/action/queryAdSpend'
      ].includes(item.name)),
      buildSandboxCollItem('coll/sitter'),
      {
        name: 'test',
        need: [
          'natsEx',
          'coll/sitter',
          'service/main/flow/busySitter/checkAdSpend',
          'service/main/flow/busySitter/findBusySitters',
          'service/main/flow/busySitter/queryAdSpend',
          'service/fbAdAccount/action/createAd',
          'service/fbAdAccount/action/queryAdSpend'
        ],
        build: async ({natsEx, 'coll/sitter': sitterColl}) => {
          const pt = await buildObjectGenerator(fpt)()
          const adId = await natsEx.call('action.fb-ad-account.create-ad', {params: pt})

          const {insertedId: sitterId} = await sitterColl.insertOne({
            adId: adId,
            status: 'busy',
            budget: 10000,
            closeBudgetRate: 0.7
          })

          natsEx.on('flow.main.busy-sitter.check-ad-spend.ok', async ({sitter, spend}) => {
            const {_id, adId: finalAdId, status, budget, closeBudgetRate} = sitter
            try {
              expect(_id).toBe(sitterId.toString())
              expect(finalAdId).toBe(adId)
              expect(status).toBe('busy')
              expect(budget).toBe(10000)
              expect(closeBudgetRate).toBe(0.7)
              expect(spend).toBeGreaterThanOrEqual(0)
              done()
            } catch (err) {
              done(err)
            }
          })

          natsEx.emit('flow.main.busy-sitter.find-busy-sitters')
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
