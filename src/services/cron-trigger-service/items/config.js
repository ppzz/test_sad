const env = process.env

module.exports = {
  name: 'config',
  build: () => {
    return {
      item: {
        natsUrl: env.NATS_URL,
        triggers: extractTriggers(env)
      }
    }
  }
}

function extractTriggers (env) {
  return Object.keys(env)
    .filter(key => key.startsWith('TRIGGER_'))
    .filter(key => !!env[key])
    .map(key => env[key])
    .map(string => string.split('|'))
    .map((tokens) => tokens.map(token => token.trim()))
}
