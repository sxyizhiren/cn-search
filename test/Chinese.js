/**
 * Created with JetBrains WebStorm.
 * User: Administrator
 * Date: 13-10-5
 * Time: 上午11:57
 * To change this template use File | Settings | File Templates.
 */


var searcher=require('../index');
var should = require('should');
//redis take 46ms,  and mock take 61ms

var option = require('./optionForTest.jsx').option;
var search = searcher.createSearch('pets',option);

var start = new Date;

var strs = [];
strs.push('Tobi wants four dollars');
strs.push('Tobi only wants $4');
strs.push('Loki is really fat');
strs.push('Loki, Jane, and Tobi are ferrets');
strs.push('Manny is a cat');
strs.push('Luna is a cat');
strs.push('Mustachio is a cat');
strs.push('这是一个支持中文中文的可以搜索的引擎，hello man');
strs.push('当参数不传的时候，arguments[0]与str是不会指向同一个引用的');
strs.push('返回有序集 key 中，指定区间内的成员');
strs.push('在单词数组中搜索某一个单词或词性所在的位置，搜索一下');
strs.push('Redis是一个开源的使用ANSI C语言编写、支持网络、可基于内存亦可持久化的日志型、Key-Value数据库，并提供多种语言的API。从2010年3月15日起，Redis的开发工作由VMware主持');

strs.forEach(function(str, i){ search.index(str, i); });

describe("[ Chinese Word Search ]", function() {
	it("query two word one time.", function(done) {
        search
          .query('Tobi dollars')
          .end(function(err, ids){
            if (err) throw err;
            ids.should.have.length(1);
            ids[0].should.eql('0');
            done();
          });   
    
    });
    it("query one chinese word.", function(done) {
        search
          .query('搜索')
          .end(function(err, ids){
            if (err) throw err;
            ids.should.have.length(2);
            ids[0].should.eql('10');
            done();
          });  
    
    });
    
    it("query two chinese words.", function(done) {
        search
            .query('中文 数据库 ')
            .type('or')
            .end(function(err, ids){
                if (err) throw err;
                ids.should.have.length(2);
                ids[0].should.eql('7');
                ids[1].should.eql('11');
                done();
            });

    });
});

