
/*!
 * reds
 * Copyright(c) 2011 TJ Holowaychuk <tj@vision-media.ca>
 * cn-search
 * Copyright(c) 2013 Sxyizhiren <786647787@qq.com>
 * MIT Licensed
 */

/**
 * Module dependencies.
 */

var natural = require('natural');
var metaphone = natural.Metaphone.process;
var stem = natural.PorterStemmer.stem;
var stopwords = natural.stopwords;
var cnstopwords = require('./cnstopWords');

// default chinese segment
var Segment = require('segment').Segment;
var segment = new Segment();
segment.useDefault();

/**
 * Chinese Segment
 * @type {*}
 */
var segmentSync = function(str){
    var words=segment.doSegment(str);
    var result=[];
    for(var i= 0,len=words.length;i<len;i++){
        result.push(words[i].w);
    }

    return result;
}

var englishregex = /^[a-zA-Z]/;
var redsOption = {};

function noop(){};

/**
 * Library version.
 */

exports.version = '1.0.0';

/**
 * Expose `Search`.
 */

exports.Search = Search;

/**
 * Expose `Query`.
 */

exports.Query = Query;

/**
 * Search types.
 */

var types = {
  intersect: 'zinterstore',
  union: 'zunionstore',
  and: 'zinterstore',
  or: 'zunionstore'
};

/**
 * Create a redis client, override to
 * provide your own behaviour.
 * Call it after createSearch(), so that you can get option from createSearch()
 * @return {RedisClient}
 * @api public
 */

exports.createClient = function(){
  if(!exports.client){
      if(redsOption && redsOption.port && redsOption.host){
          exports.client = require('redis').createClient(redsOption.port, redsOption.host);
      }else if(redsOption && redsOption.redis){
          exports.client = redsOption.redis;
      }else{
          exports.client = require('redis').createClient();
      }
  }
  return exports.client;

};

function createChineseSegment(){
	if (redsOption && redsOption.segmentSync) {
        segmentSync = redsOption.segmentSync;
	}else {
        //segmentSync = require("mmseg").open('/usr/local/etc/').segmentSync;
	}
}

/**
 * Return a new reds `Search` with the given `key`.
 *
 * @param {String} key
 * @return {Search}
 * @api public
 */

exports.createSearch = function(key,option){
  if ( !key || (typeof key !== 'string') ) throw new Error('createSearch() requires a string redis <key> for namespacing');
  if(typeof option === 'object'){
    redsOption.isRandomizeSameScore = option.isRandomizeSameScore;
    redsOption.port = option.port;
    redsOption.host = option.host;
    redsOption.redis = option.redis;
    redsOption.segmentSync = option.segmentSync;
  }
  createChineseSegment();
  return new Search(key);
};

/**
 * copy from mmseg, so that i can also use it for other segment
 * @param ar
 * @returns {*}
 */
var clean =function(ar) {
    if( ar && ar.length ){
        var a = [];
        for (var i = 0, l = ar.length; i < l; i++) {
            if( /^[\u4e00-\u9fa5\da-zA-Z]+$/.test(ar[i]) ) a.push(ar[i]);
        };
        ar = a;
    }
    return ar;
}

/**
 * Return the words in `str`.
 *
 * @param {String} str
 * @return {Array}
 * @api private
 */

exports.words = function(str){
  return clean(segmentSync(String(str)));
};

/**
 * Stem the given `words`.
 *
 * @param {Array} words
 * @return {Array}
 * @api private
 */

exports.stem = function(words){
  var ret = [];
  if (!words) return ret;
  for (var i = 0, len = words.length; i < len; ++i) {
    if(englishregex.test(words[i])){
      //word is in english
      ret.push(stem(words[i]));
    }else{
      //not english ,is chinese
      ret.push(words[i]);
    }

  }

  return ret;
};

/**
 * Strip stop words in `words`.
 *
 * @param {Array} words
 * @return {Array}
 * @api private
 */

exports.stripStopWords = function(words){
  var ret = [];
  if (!words) return ret;
  for (var i = 0, len = words.length; i < len; ++i) {
    if(englishregex.test(words[i])){
      //word is in english
      if (~stopwords.indexOf(words[i])) continue;
    }else{
      //not english ,is chinese
      if (~cnstopwords.indexOf(words[i])) continue;
    }

    ret.push(words[i]);
  }

  return ret;
};

/**
 * Returns an object mapping each word in a Array
 * to the number of times it occurs in the Array.
 *
 * @param {Array} words
 * @return {Object}
 * @api private
 */

exports.countWords = function(words){
  var obj = {};
  if (!words) return obj;
  for (var i = 0, len = words.length; i < len; ++i) {
    // when many date have same score, they will always in the same sequence.
    // here add random subscore, to support randomize the sequence of same score
    if(redsOption && redsOption.isRandomizeSameScore){
    	obj[words[i]] = (obj[words[i]] || 0) + 1 + Math.random();
    }else{
        obj[words[i]] = (obj[words[i]] || 0) + 1;
    }
  }
  return obj;
};

/**
 * Return the given `words` mapped to the metaphone constant.
 *
 * Examples:
 *
 *    metaphone(['tobi', 'wants', '4', 'dollars'])
 *    // => { '4': '4', tobi: 'TB', wants: 'WNTS', dollars: 'TLRS' }
 *
 * @param {Array} words
 * @return {Object}
 * @api private
 */

exports.metaphoneMap = function(words){
  var obj = {};
  if (!words) return obj;
  for (var i = 0, len = words.length; i < len; ++i) {
    if(englishregex.test(words[i])){
      obj[words[i]] = metaphone(words[i]);
    }else{
      obj[words[i]] = words[i];
    }
  }
  return obj;
};

/**
 * Return an array of metaphone constants in `words`.
 *
 * Examples:
 *
 *    metaphone(['tobi', 'wants', '4', 'dollars'])
 *    // => ['4', 'TB', 'WNTS', 'TLRS']
 *
 * @param {Array} words
 * @return {Array}
 * @api private
 */

exports.metaphoneArray = function(words){
  var arr = [];
  var constant;

  if (!words) return arr;
  
  for (var i = 0, len = words.length; i < len; ++i) {
    if(englishregex.test(words[i])){
      constant = metaphone(words[i]);
    } else {
      constant = words[i];
    }
    if (!~arr.indexOf(constant)) arr.push(constant);
  }
  
  return arr;
};

/**
 * Return a map of metaphone constant redis keys for `words`
 * and the given `key`.
 *
 * @param {String} key
 * @param {Array} words
 * @return {Array}
 * @api private
 */

exports.metaphoneKeys = function(key, words){
  return exports.metaphoneArray(words).map(function(c){
    return key + ':word:' + c;
  });
};

/**
 * Initialize a new `Query` with the given `str`
 * and `search` instance.
 *
 * @param {String} str
 * @param {Search} search
 * @api public
 */

function Query(str, search) {
  this.str = str;
  this.type('and');
  this.search = search;
}

/**
 * Set `type` to "union" or "intersect", aliased as
 * "or" and "and".
 *
 * @param {String} type
 * @return {Query} for chaining
 * @api public
 */

Query.prototype.type = function(type){
  this._type = types[type];
  return this;
};

/**
 * Limit search to the specified range of elements.
 *
 * @param {String} start
 * @param {String} stop
 * @return {Query} for chaining
 * @api public
 */
Query.prototype.between = function(start, stop){
  this._start = start;
  this._stop = stop;
  return this;
};

/**
 * Perform the query and callback `fn(err, ids)`.
 *
 * @param {Function} fn
 * @return {Query} for chaining
 * @api public
 */

Query.prototype.end = function(fn){
  var key = this.search.key;
  var db = this.search.client;
  var query = this.str;
  var words = exports.stem(exports.stripStopWords(exports.words(query)));
  console.log('End:',words);
  var keys = exports.metaphoneKeys(key, words);
  var type = this._type;
  var start = this._start || 0;
  var stop = this._stop || -1;

  if (!keys.length) return fn(null, []);

  var tkey = key + 'tmpkey';
  db.multi([
    [type, tkey, keys.length].concat(keys),
    ['zrevrange', tkey, start, stop],
    ['zremrangebyrank', tkey, start, stop],
  ]).exec(function(err, ids) {
    ids = ids[1];
    fn(err, ids);
  });

  return this;
};

/**
 * Initialize a new `Search` with the given `key`.
 *
 * @param {String} key
 * @api public
 */

function Search(key) {
  this.key = key;
  this.client = exports.createClient();
}

/**
 * Index the given `str` mapped to `id`.
 *
 * @param {String} str
 * @param {Number|String} id
 * @param {Function} fn
 * @api public
 */

Search.prototype.index = function(str, id, fn){
  var key = this.key;
  var db = this.client;
  var words = exports.stem(exports.stripStopWords(exports.words(str)));
  var counts = exports.countWords(words);
  var map = exports.metaphoneMap(words);
  var keys = Object.keys(map);

  var cmds = [];
  keys.forEach(function(word, i){
    cmds.push(['zadd', key + ':word:' + map[word], counts[word], id]);
    cmds.push(['zadd', key + ':object:' + id, counts[word], map[word]]);
  });
  db.multi(cmds).exec(fn || noop);

  return this;
};

/**
 * Remove occurrences of `id` from the index.
 *
 * @param {Number|String} id
 * @api public
 */

Search.prototype.remove = function(id, fn){
  fn = fn || noop;
  var key = this.key;
  var db = this.client;
  
  db.zrevrangebyscore(key + ':object:' + id, '+inf', 0, function(err, constants){
    if (err) return fn(err);
    var multi = db.multi().del(key + ':object:' + id);
    constants.forEach(function(c){
      multi.zrem(key + ':word:' + c, id);
    });
    multi.exec(fn);
  });
  
  return this;
};

/**
 * Perform a search on the given `query` returning
 * a `Query` instance.
 *
 * @param {String} query
 * @param {Query}
 * @api public
 */

Search.prototype.query = function(query){
  return new Query(query, this);
};
