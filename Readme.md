# cn-search
- [![NPM version](https://badge.fury.io/js/cn-search.png)](http://badge.fury.io/js/cn-search)
- [![Dependencies Status](https://david-dm.org/sxyizhiren/cn-search.png)](https://david-dm.org/sxyizhiren/cn-search)
- [![Build Status](https://travis-ci.org/sxyizhiren/cn-search.png?branch=master)](https://travis-ci.org/sxyizhiren/cn-search)
- [![Coverage Status](https://coveralls.io/repos/sxyizhiren/cn-search/badge.png?branch=master&service=github)](https://coveralls.io/github/sxyizhiren/cn-search?branch=master)
- [![NPM Stats](https://nodei.co/npm/cn-search.png?downloads=true&stars=true)](https://npmjs.org/package/cn-search)
- [![NPM Downloads](https://nodei.co/npm-dl/cn-search.png?months=9)](https://npmjs.org/package/cn-search)

  ch-search , a light-weight chinese search engine based on reds, english support also.

  https://github.com/tj/reds
    
  
## Installation

      $ npm install cn-search

## Example

  the same to reds

###usage

```js
var searcher=require('cn-search');
var search = searcher.createSearch('pets');	
var strs = [];
strs.push('Tobi wants four dollars');
strs.push('Mustachio is a cat');
strs.push('这是一个支持中文的搜索引擎，hello man');

strs.forEach(function(str, i){ search.index(str, i); });


// search who have all words in it.
search
  .query('支持 hello')
  .end(function(err, ids){
    if (err) throw err;
    console.log('Search results for "%s":', query);
    ids.forEach(function(id){
      console.log('  - %s', strs[id]);
    });
});

// search who have either word in it.
search
	.query('中文 Mustachio')
	.type('or')
	.end(function(err, ids){
		if (err) throw err;
		console.log('Search results for "%s":', query);
		ids.forEach(function(id){
		  console.log('  - %s', strs[id]);
		});
	});


// basic usage is same to reds : https://github.com/tj/reds
```

