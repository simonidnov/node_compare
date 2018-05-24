const Metas_model = require('../models/metas_model');

exports.get = function(req, res, callback) {
  Metas_model.get(req, res, callback);  
};

exports.create = function(req, res, callback) {
  Metas_model.create(req, res, callback);
};
