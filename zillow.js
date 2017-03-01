const request = require('request')
const markets = require('./markets')
const format = require('./format')

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
    features: json.map.properties.map(format)
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
