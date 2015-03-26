// Defines the routes and params name that will be passed in req.params 
// routes tell Koop what controller method should handle what request route

var Combinatorics = require('js-combinatorics').Combinatorics;

var actions = {
    'drop': 'drop',
    'FeatureServer': 'featureserver',
    'Featureserver/:layer': 'featureserver',
    'Featureserver/:layer/:method': 'featureserver'
};
var base = '/zillow/:place';
var parameters = [
'price',
'bedrooms',
'bathrooms',
'sqft'
];

var combinations = Combinatorics.permutationCombination(parameters).toArray();

var endpoints = [];
endpoints.push(base);

combinations.forEach(function(params){
    if (params.length > 1){
        var stub = '';
        params.forEach(function(param){
            stub += param + '/:' + param + '/';
        });
        endpoints.push(stub);
    } else {
        endpoints.push(params[0] + '/:' + params[0]);
    }
});
console.log(endpoints);

var routes = {
    'get /zillow': 'index'
};

endpoints.forEach(function(endpoint){
    console.log(endpoint);
    routes['get ' + base + endpoint.slice(0,-1)] = 'get';
    Object.keys(actions).forEach(function(action){
        routes['get ' + base + '/' + endpoint + action] = actions[action];
    });
});

console.log(Object.keys(routes));
module.exports = routes;

