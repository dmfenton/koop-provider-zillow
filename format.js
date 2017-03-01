module.exports = function (property) {
  const listing = property.filter(p => {
    return Array.isArray(p)
  })[0]
  const headline = listing[0].toString()
  return {
    type: 'Feature',
    geometry: {
      type: 'Point',
      coordinates: [property[2] / 1000000, property[1] / 1000000]
    },
    properties: {
      listing: `https://www.zillow.com/homedetails/${property[0]}_zpid/`,
      headline: headline,
      type: /^\$/.test(headline) ? 'sale' : headline,
      price: computePrice(headline),
      bedrooms: listing[1],
      bathrooms: listing[2],
      squareFeet: listing[3],
      photo: listing[5]
    }
  }
}

function computePrice (headline) {
  let price = parseFloat(headline.slice(1, -1))
  if (/K$/.test(headline)) return price * 1000
  else if (/M$/.test(headline)) return price * 1000000
}
