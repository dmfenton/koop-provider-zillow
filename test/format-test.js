const test = require('tape')
const format = require('../format')

test('Format a feature', t => {
  const input = [
    35842901,
    33740246,
    -84430475,
    '$300K',
    1,
    0,
    0,
    0,
    [
      '$300K',
      3,
      3,
      1781,
      false,
      'https://photos.zillowstatic.com/p_a/IS2vo2bymiqb781000000000.jpg',
      '9,147 sqft lot',
      '',
      'ForSale',
      'For Sale (Broker)',
      27
    ]
  ]
  const feature = format(input)
  const g = feature.geometry
  const p = feature.properties
  t.equal(g.coordinates[0], -84.430475, 'longitude')
  t.equal(g.coordinates[1], 33.740246, 'latitude')
  t.equal(p.type, 'sale', 'type')
  t.equal(p.price, 300000, 'price')
  t.equal(p.squareFeet, 1781, 'square feet')
  t.equal(p.photo, 'https://photos.zillowstatic.com/p_a/IS2vo2bymiqb781000000000.jpg', 'photo')
  t.equal(p.bedrooms, 3, 'bedrooms')
  t.equal(p.bathrooms, 3, 'bathrooms')
  t.equal(p.listing, 'https://www.zillow.com/homedetails/35842901_zpid/', 'listing url')
  t.equal(p.headline, '$300K', 'headline')
  t.end()
})

test('Format a set of features', t => {
  const json = require('./fixtures/response.json')
  const features = json.map.properties.map(format)
  t.equal(features.length, 394, 'formatted all features')
  t.end()
})
