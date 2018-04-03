const env = process.env

module.exports = {
  build: () => {
    return {
      item: {
        natsUrl: env.NATS_URL,

        facebookAccessToken: env.FACEBOOK_ACCESS_TOKEN,
        facebookAdAccountId: env.FACEBOOK_AD_ACCOUNT_ID,

        mongoUrl: env.MONGO_URL,
        mongoDb: env.MONGO_DB,

        mongoCollFather: env.MONGO_COLL_FATHER,
        mongoCollMother: env.MONGO_COLL_MOTHER,
        mongoCollSitter: env.MONGO_COLL_SITTER,
        mongoCollAd: env.MONGO_COLL_AD
      }
    }
  }
}
