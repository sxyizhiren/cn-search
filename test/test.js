/**
 * Created with JetBrains WebStorm.
 * User: Administrator
 * Date: 13-10-5
 * Time: 上午11:57
 * To change this template use File | Settings | File Templates.
 */


var searcher=require('../index');

var search = searcher.createSearch('pets');

var strs = [];
strs.push('Tobi wants four dollars');
strs.push('Tobi only wants $4');
strs.push('Loki is really fat');
strs.push('Loki, Jane, and Tobi are ferrets');
strs.push('Manny is a cat');
strs.push('Luna is a cat');
strs.push('Mustachio is a cat');
strs.push('这是一个支持中文的搜索引擎，hello man');

strs.forEach(function(str, i){ search.index(str, i); });


search
  .query(query1= 'Tobi dollars')
  .end(function(err, ids){
    if (err) throw err;
    console.log('Search results for "%s":', query1);
    ids.forEach(function(id){
      console.log('  - %s', strs[id]);
    });
    //process.exit();
  });

search
  .query(query2 = '支持 hello')
  .end(function(err, ids){
    if (err) throw err;
    console.log('Search results for "%s":', query2);
    ids.forEach(function(id){
      console.log('  - %s', strs[id]);
    });
    //process.exit();
  });

