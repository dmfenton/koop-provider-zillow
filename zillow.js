const request = require('request')
const markets = require('./markets')

function Zillow (koop) {
  this.getData = function (req, callback) {
    fetch(req.params.id, req.query, (err, geojson) => {
      callback(err, geojson)
    })
  }
}

function fetch (market, query, callback) {
  // simple wrapper around requests to the desired API
  const parameters = buildParameters(market, query)
  const base = 'https://www.zillow.com/search/GetResults.htm?'
  const url = `${base}${encodeURI(parameters)}`
  console.log(url)
  request.get(url, function (err, res, body) {
    if (err) return callback(err)
    const geojson = translate(body)
    callback(null, geojson)
  })
}

function translate (raw) {
    // translate the Zillow API response into geojson
  const json = JSON.parse(raw)
    // create the shell that will hold all the properties
  return {
    type: 'FeatureCollection',
    features: json.map.properties.map(formatFeature)
  }
}

function formatFeature (property) {
  const listing = property.filter(p => {
    return Array.isArray(p)
  })
  const headline = listing[0]
  let price = parseInt(headline.slice(1, -1))
  return {
    type: 'Feature',
    geometry: {
      type: 'Point',
      coordinates: [property[2] / 1000000, property[1] / 1000000]
    },
    properties: {
      listing: 'http://www.zillow.com/homedetails/' + property[0] + '_zpid/',
      headline: headline,
      type: /^\$/.test(headline) ? 'sale' : headline,
      price: /K$/.test(headline) ? price * 1000 : price * 1000000,
      bedrooms: listing[1],
      bathrooms: listing[2],
      squareFeet: listing[3],
      photo: listing[5]
    }
  }
}

function buildParameters (market, query) {
    // create a a default set of parameters for the API call
    // fill in passed in parameters where available
  // const options = {
  //   spt: 'homes',
  //   status: 110001,
  //   lt: 111101,
  //   ht: 111101,
  //   pr: ',631085',
  //   mp: ',2078',
  //   bd: '3,',
  //   ba: '0,',
  //   sf: ',',
  //   lot: '0,',
  //   yr: ',',
  //   singlestory: 0,
  //   hoa: '0,',
  //   pho: 0,
  //   pets: 0,
  //   parking: 0,
  //   laundry: 0,
  //   'income-restricted': 0,
  //   pnd: 0,
  //   red: 0,
  //   zso: 0,
  //   days: 'any',
  //   ds: 'all',
  //   pmf: 1,
  //   pf: 1,
  //   sch: 100111,
  //   zoom: 8,
  //   rect: markets[market].rect,
  //   p: 1,
  //   sort: 'days',
  //   search: 'map',
  //   rid: markets[market].rid,
  //   rt: 6,
  //   listright: true,
  //   isMapSearch: true
  // }
  const options = {
    spt: 'homes',
    status: 110001,
    lt: 111101,
    ht: 111111,
    pr: ',10000000',
    mp: ',37555',
    bd: '0,',
    ba: '0,',
    sf: '1,',
    lot: ',',
    yr: ',',
    singlestory: 0,
    hoa: 0,
    pho: 0,
    pets: 0,
    parking: 0,
    laundry: 0,
    'income-restricted': 0,
    pnd: 0,
    red: 0,
    zso: 0,
    days: 'any',
    ds: 'all',
    pmf: 1,
    pf: 1,
    sch: 100111,
    rect: markets[market].rect,
    p: 1,
    sort: 'days',
    search: 'map',
    disp: 1,
    rid: markets[market].rid,
    rt: 6,
    listright: true,
    isMapSearch: true,
    zoom: 11
  }
    // concatenate all the parameters into one big string
  return Object.keys(options).reduce((parameters, option) => {
    return `${parameters}${option}=${options[option]}&`
  }, '').slice(0, -1)
}

module.exports = Zillow
