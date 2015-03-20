var request = require('request');
var async = require('async');

var Zillow = function(koop) {

  var zillow = {};
  zillow.__proto__ = koop.BaseModel(koop);

  zillow.find = function(id, options, callback) {

    // check the cache for data with this type & id 
    koop.Cache.get(type, id, options, function(err, entry) {
      if (err) {
        var url = 'http://www.zillow.com/search/GetResults.htm?';
        async.waterfall([
          function(callback){
            callback(null, build_options);
          },
          function (paramaters, callback){
            callback(null, get_api(url, parameters));
          },
          function (res, callback){
            callback(null, translate(res));
          }
          ], function (err, result){
             cache_insert(result);
          });
      } else {
        callback(null, entry);
      }
    });
  };

  var cache_insert = function(geojson){
    var type = 'Zillow';
    var id = 'test';
    koop.Cache.insert(type, id, geojson, 0, function(err, success) {
      if (success) {
        callback(null, geojson);
      }
    });
  };

  var get_api = function(url, parameters){
    request.get(url + parameters, function(e, res){
      return res;
    });
  };
  var build_options = function() {
    var standard = {
      spt: 'homes',
      status: 110001,
      lt: 111101,
      ht: 111111,
      pr: ',750000',
      mp: ',2719',
      bd: 2,
      ba: 0,
      sf: 1000,
      lot: null,
      yr: null,
      pho: 0,
      pets: 0,
      parking: 0,
      laundry: 0,
      pnd: 0,
      red: 0,
      zso: 0,
      days: 'any',
      ds: 'all',
      pmf: 1,
      pf: 1,
      zoom: 11,
      rect: '-77111149,38881546,-76863956,38985700',
      p: 1,
      sort: 'days',
      search: 'maplist',
      disp: 1,
      rid: 41568,
      rt: 6,
      listright: true,
      isMapSearch: true
    };
    var parameters;
    for (var key in standard) {
      options = options + key + ':' + standard[key];
    }
    return parameters;
  };

  var translate = function(res) {
    var json = JSON.parse(res.body);
    var geojson = {
      type: 'FeatureCollection',
      crs: {
        type: 'name',
        properties: {
          name: 'EPSG:3857'
        }
      },
      features: []
    };
    json.map.properties.forEach(function(property) {
      geojson.features.push({
        type: 'Feature',
        geometry: {
          type: point,
          coordinates: [property[1], property[2]]
        },
        properties: {
          id: property[0],
          price: price,
          bedrooms: property[7][1],
          bathrooms: property[7][2],
          square_feet: property[7][3],
          photo: property[7][5]
        }
      });
    });
     return geojson;
  };

  return zillow;

};

module.exports = Zillow;