// used to send http requests
var request = require('request');
// used to manage control flow
var async = require('async');
// used to create hashes that fingerprint a given request
var hash = require('object-hash');


var Zillow = function(koop) {

  var zillow = {};
  zillow.__proto__ = koop.BaseModel(koop);
  var type = 'zillow';
  var token_expiration;
  var locations ={};
  var token;

  zillow.find = function(params, options, cb) {
    // delete these two keys or else we get inconsistent hash keys depending on the request
    delete params.layer;
    delete params.method;
    var key = hash.MD5(params);
    // check the cache for data with this type & id 
    // if no prior requests exist then trigger this waterfall
    koop.Cache.get(type, key, options, function(err, entry) {
      if (err) {
        async.waterfall([
          function(callback) {
            if (!token || Date.now() >= token_expiration){
              get_token(function(err, res){
                token = res.body.access_token;
                callback(null);
              });
            } else{
              callback(null);
            }
          },
          function(callback) {
            get_bbox(params.place, function(bbox){
              params.bbox = bbox;
              callback(null);
            });
          },
          function(callback) {
            query = build_options(params);
            callback(null, query);
          },
          function(query, callback) {
            var url = 'http://www.zillow.com/search/GetResults.htm?';
            get_api(url, query, function(err, res) {
              callback(null, res);
            });
          },
          function(res, callback) {
            callback(null, translate(res));
          }
        ], function(err, geojson) {
          cache_insert(key, geojson, cb);
        });
      } else {
        cb(null, entry);
      }
    });
  };

  var cache_insert = function(key, geojson, callback) {
    // take translated geojson and huck it into Koop
    koop.Cache.insert(type, key, geojson, 0, function(err, success) {
      if (success) {
        callback(null, geojson);
      }
    });
  };

  var get_api = function(url, parameters, callback) {
    // simple wrapper around requests to the desired API
    console.log(url + parameters);
    request.get(url + parameters, function(err, res) {
      callback(err, res);
    });
  };

  var get_token = function(callback){
    console.log('getting here?');
    request.post({
      url: 'https://www.arcgis.com/sharing/rest/oauth2/token/',
      json:true,
      form: {
        'f': 'json',
        'client_id': koop.config.esri.id,
        'client_secret': koop.config.esri.secret,
        'grant_type': 'client_credentials',
        'expiration': '60'
      }
    }, function(err, res){
      callback(err, res);
    });
  };

  var get_bbox = function(place, callback) {
    // takes in a location string and returns a bbox in the format zillow understands
    var bbox;
    if (locations[place]) {
      bbox = locations.place;
      callback(bbox);
    } else {
      console.log(token);
      var root = 'http://geocode.arcgis.com';
      var gc_request = '/arcgis/rest/services/World/GeocodeServer/find?f=json&forStorage=true&maxlocations=1&outSR=4326';
      gc_request = root + gc_request + '&text=' + encodeURI(place) + '&token=' + token;
      console.log(gc_request);
      request.get(gc_request, function(err, res) {
        //handle the geocoder result
        if (err){
          console.log('geocode request is borked');
        }
        else {
          response = JSON.parse(res.body);
          extent = response.locations[0].extent;
          // zillow consumes wgs 84 coordinates without any decimals
          for (var point in extent) {
            extent[point] = extent[point] * 1000000;
          }
          bbox = extent.xmin + ',' + extent.ymin + ',' + extent.xmax + ',' + extent.ymax;
          locations.place = bbox;
          callback(bbox);
        }
      });
    }
  };

  var build_options = function(params) {
    // create a a default set of parameters for the API call
    // fill in passed in parameters where available
    var options = {
      spt: 'homes',
      status: 110001,
      lt: 111101,
      ht: 111111,
      pr: ',' + (params.max_price || '10000000'),
      mp: ',2729',
      bd: (params.bedrooms || 0) + ',',
      ba: (params.bathrooms || 0) + ',',
      sf: (params.sqft || 1) + ',',
      lot: ',',
      yr: ',',
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
      rect: params.bbox,
      p: 1,
      sort: 'days',
      search: 'map',
      disp: 1,
      rid: 41568,
      rt: 6,
      listright: true,
      isMapSearch: true
    };
    // concatenate all the parameters into one big string
    var parameters = '';
    for (var key in options) {
      parameters = parameters + key + '=' + options[key] + '&';
    }
    return parameters.slice(0, -1);
  };

  var translate = function(res) {
    // translate the Zillow API response into geojson
    var json = JSON.parse(res.body);
    // create the shell that will hold all the properties
    var geojson = {
      type: 'FeatureCollection',
      features: []
    };
    json.map.properties.forEach(function(property) {
    // loop through each property returned from the API call and push it into the geojson shell
      var headline = property[7][0];
      var type, price;
      if (headline.slice(0,1) === '$'){
        type = 'sale';
        if (headline.slice(-1) === 'K'){
          // take the price value and turn it into a number we can use
          price = parseInt(headline.slice(1,-1)) * 1000;
        } else {
          price = parseInt(headline.slice(1,-1)) * 1000000;
        }
      } else {
          type = headline;
          price = null;
      }
      geojson.features.push({
        type: 'Feature',
        geometry: {
          type: 'Point',
          coordinates: [property[2] / 1000000, property[1] / 1000000]
        },
        properties: {
          listing: 'http://www.zillow.com/homedetails/' + property[0] + '_zpid/',
          headline: headline,
          type: type,
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

  zillow.drop = function(key, options, callback) {
  // drops the item from the cache
    var dir = ['zillow', key, 0].join(':');
    koop.Cache.remove('zillow', key, options, function(err, res) {
      koop.files.removeDir('files/' + dir, function(err, res) {
        koop.files.removeDir('tiles/' + dir, function(err, res) {
          koop.files.removeDir('thumbs/' + dir, function(err, res) {
            callback(err, true);
          });
        });
      });
    });
  };

  return zillow;

};

module.exports = Zillow;