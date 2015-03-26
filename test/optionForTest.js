
var db = require('redis-js-fork');

var option={};
option.redis=db;

var Segment = require('segment').Segment;
var segment = new Segment();
segment.useDefault();
option.segmentSync = function(str){
    var words=segment.doSegment(str);
    var result=[];
    for(var i= 0,len=words.length;i<len;i++){
        result.push(words[i].w);
    }

    return result;
}

exports.option=option;
exports.db=db;
