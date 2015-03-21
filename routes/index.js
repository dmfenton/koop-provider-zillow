// Defines the routes and params name that will be passed in req.params 
// routes tell Koop what controller method should handle what request route

module.exports = {
    // route : handler
    'get /zillow': 'index',
    'get /zillow/:place': 'get',
    'get /zillow/:place/drop': 'drop',
    'get /zillow/:place/FeatureServer': 'featureserver',
    'get /zillow/:place/FeatureServer/:layer': 'featureserver',
    'get /zillow/:place/FeatureServer/:layer/:method': 'featureserver',
    'get /zillow/:place/max_price/:max_price': 'get',
    'get /zillow/:place/max_price/:max_price/drop': 'drop',
    'get /zillow/:place/max_price/:max_price/FeatureServer': 'featureserver',
    'get /zillow/:place/max_price/:max_price/FeatureServer/:layer': 'featureserver',
    'get /zillow/:place/max_price/:max_price/FeatureServer/:layer/:method': 'featureserver',
    'get /zillow/:place/max_price/:max_price/bedrooms/:bedrooms': 'get',
    'get /zillow/:place/max_price/:max_price/bedrooms/:bedrooms/drop': 'drop',
    'get /zillow/:place/max_price/:max_price/bedrooms/:bedrooms/FeatureServer': 'featureserver',
    'get /zillow/:place/max_price/:max_price/bedrooms/:bedrooms/FeatureServer/:layer': 'featureserver',
    'get /zillow/:place/max_price/:max_price/bedrooms/:bedrooms/FeatureServer/:layer/:method': 'featureserver',
    'get /zillow/:place/max_price/:max_price/bedrooms/:bedrooms/bathrooms/:bathrooms': 'get',
    'get /zillow/:place/max_price/:max_price/bedrooms/:bedrooms/bathrooms/:bathrooms/drop': 'drop',
    'get /zillow/:place/max_price/:max_price/bedrooms/:bedrooms/bathrooms/:bathrooms/FeatureServer': 'featureserver',
    'get /zillow/:place/max_price/:max_price/bedrooms/:bedrooms/bathrooms/:bathrooms/FeatureServer/:layer': 'featureserver',
    'get /zillow/:place/max_price/:max_price/bedrooms/:bedrooms/bathrooms/:bathrooms/FeatureServer/:layer/:method': 'featureserver',
    'get /zillow/:place/max_price/:max_price/bedrooms/:bedrooms/bathrooms/:bathrooms/sqft/:sqft': 'get',
    'get /zillow/:place/max_price/:max_price/bedrooms/:bedrooms/bathrooms/:bathrooms/sqft/:sqft/drop': 'drop',
    'get /zillow/:place/max_price/:max_price/bedrooms/:bedrooms/bathrooms/:bathrooms/sqft/:sqft/FeatureServer': 'featureserver',
    'get /zillow/:place/max_price/:max_price/bedrooms/:bedrooms/bathrooms/:bathrooms/sqft/:sqft/FeatureServer/:layer': 'featureserver',
    'get /zillow/:place/max_price/:max_price/bedrooms/:bedrooms/bathrooms/:bathrooms/sqft/:sqft/FeatureServer/:layer/:method': 'featureserver'
};

