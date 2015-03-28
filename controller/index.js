var hash = require('object-hash');

var Controller = function( zillow, BaseController ){

  // inherit from the base controller to share some logic 
  var controller = {};
  controller.__proto__ = BaseController();

  // respond to the root route
  controller.index = function(req, res){
    res.send('This is the base route of ze Zillow Provider');
  };

  // get a resource from the providers model 
  controller.get = function(req, res){
    zillow.find(req.params, req.query, function(err, data){
      if (err){
        res.send(err, 500);
      } else {
        res.json( data );
      }
    });
  };
  
  // use the shared code in the BaseController to create a feature service
  controller.featureserver = function(req, res){
    var callback = req.query.callback, self = this;
    delete req.query.callback;

    zillow.find(req.params, req.query, function(err, data){
      if (err) {
        res.send(err, 500);
      } else {
        // inherited logic for processing feature service requests      
        controller.processFeatureServer( req, res, err, data, callback);
      }
    });
  };

  // render templates and views 
  controller.preview = function(req, res){
    res.render(__dirname + '/../views/demo', { locals:{ id: req.params.id } });
  };

  // drops the cache
  controller.drop = function(req, res){
    var params = req.params;
    delete params.method;
    delete params.layer;
    var key = hash.MD5(params);

    zillow.drop( key, req.query, function(error, result){
      if (error) {
        res.send( error, 500);
      } else {
        res.json( result );
      }
    });
  };
  
  // return the controller so it can be used by koop
  return controller;

};

module.exports = Controller;

