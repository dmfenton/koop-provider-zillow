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
  t.equal(g.coordinates[0], -84.430475)
  t.equal(g.coordinates[1], 33.740246)
  t.equal(p.type, 'sale')
  t.equal(p.price, 300000)
  t.equal(p.squareFeet, 1781)
  t.equal(p.photo, 'https://photos.zillowstatic.com/p_a/IS2vo2bymiqb781000000000.jpg')
  t.equal(p.bedrooms, 3)
  t.equal(p.bathrooms, 3)
  t.equal(p.listing, 'https://www.zillow.com/homedetails/35842901_zpid/')
  t.equal(p.headline, '$300K')
  t.end()
})
