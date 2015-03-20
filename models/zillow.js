var request = require('request');
var async = require('async');

var Zillow = function(koop) {

  var zillow = {};
  zillow.__proto__ = koop.BaseModel(koop);

  zillow.find = function(id, options, cb) {
    var type = 'Zillow';
    var id = 'test';
    // check the cache for data with this type & id 
    koop.Cache.get(type, id, options, function(err, entry) {
      if (err) {
        var url = 'http://www.zillow.com/search/GetResults.htm?';
        async.waterfall([
          function(callback){
            parameters = build_options();
            callback(null, parameters);
          },
          function (parameters, callback){
            get_api(url, parameters, function(err, res){
              callback(null, res);
            });
          },
          function (res, callback){
            callback(null, translate(res));
          }
          ], function (err, result){
             cache_insert(result, cb);
          });
      } else {
        callback(null, entry);
      }
    });
  };

  var cache_insert = function(geojson, callback){
    koop.Cache.insert('zillow', 'test', geojson, 0, function(err, success) {
      if (success) {
        callback(null, geojson);
      }
    });
  };

  var get_api = function(url, parameters, callback){
    console.log(url+parameters);
    request.get(url + parameters, function(err, res){
      callback(err,res);
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
    var parameters = '';
    for (var key in standard) {
      parameters = parameters + key + '=' + standard[key] + '&';
    }
    return parameters.slice(0,-1);
  };

  var translate = function(res) {
    var json = JSON.parse(res.body);
    var geojson = {
      type: 'FeatureCollection',
      crs: {
        type: 'name',
        properties: {
          name: 'EPSG:4326'
        }
      },
      features: []
    };
    json.map.properties.forEach(function(property) {
      var price = property[7][0];
      geojson.features.push({
        type: 'Feature',
        geometry: {
          type: 'point',
          coordinates: [property[2]/1000000, property[1]/1000000]
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