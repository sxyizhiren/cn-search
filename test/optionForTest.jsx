
var db = require('redis-js');

var option={};
option.redis=db;


exports.option=option;
exports.db=db;
