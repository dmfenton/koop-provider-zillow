// clean shutdown
process.on('SIGINT', () => process.exit(0))
process.on('SIGTERM', () => process.exit(0))

// Initialize Koop
const Koop = require('koop')
const koop = new Koop()

// Install the Zillow Provider
const zillow = require('./')
koop.register(zillow)

// Start listening for http traffic
const config = require('config')
const port = config.port || 8080
koop.server.listen(port)
console.log(`Koop Zillow listening on ${port}`)
console.log(`http://localhost:${port}/zillow/atlanta/FeatureServer/0`)
