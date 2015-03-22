var request = require('request');
var async = require('async');
var hash = require('object-hash');
var config = require('config');
var fs = require('fs');

var Zillow = function(koop) {

  var zillow = {};
  zillow.__proto__ = koop.BaseModel(koop);
  var type = 'zillow';
  var locations = {};

  zillow.find = function(params, options, cb) {
    if (!params.layer){
      params.layer = 0;
    } else {
      params.layer = parseInt(params.layer);
    }
    var key = hash.MD5(params);
    // check the cache for data with this type & id 
    koop.Cache.get(type, key, options, function(err, entry) {
      if (err) {
        var url = 'http://www.zillow.com/search/GetResults.htm?';
        async.waterfall([
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
    koop.Cache.insert(type, key, geojson, 0, function(err, success) {
      if (success) {
        callback(null, geojson);
      }
    });
  };

  var get_api = function(url, parameters, callback) {
    console.log(url + parameters);
    request.get(url + parameters, function(err, res) {
      callback(err, res);
    });
  };

  var get_bbox = function(place, callback) {
    var bbox;
    if (locations[place]) {
      bbox = locations.place;
      callback(bbox);
    } else {
      var token = config.esri.token;
      var root = 'http://geocode.arcgis.com';
      var gc_request = '/arcgis/rest/services/World/GeocodeServer/find?f=json&forStorage=true&maxlocations=1&outSR=4326';
      gc_request = root + gc_request + '&text=' + encodeURI(place) + '&token=' + token;
      request.get(gc_request, function(err, res) {
        //handle the geocoder result
        if (err){
          console.log('geocode request is borked');
        }
        else {
          response = JSON.parse(res.body);
          extent = response.locations[0].extent;
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
    var options = {
      spt: 'homes',
      status: 110001,
      lt: 111101,
      ht: 111111,
      pr: ',' + (params.max_price || '750000'),
      mp: ',2729',
      bd: (params.bedrooms || 2) + ',',
      ba: (params.bathrooms || 0) + ',',
      sf: (params.sqft || 1000) + ',',
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

    var parameters = '';
    for (var key in options) {
      parameters = parameters + key + '=' + options[key] + '&';
    }
    return parameters.slice(0, -1);
  };

  var translate = function(res) {
    var json = JSON.parse(res.body);
    var geojson = {
      type: 'FeatureCollection',
      features: []
    };
    json.map.properties.forEach(function(property) {
      var price = property[7][0];
      geojson.features.push({
        type: 'Feature',
        geometry: {
          type: 'Point',
          coordinates: [property[2] / 1000000, property[1] / 1000000]
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