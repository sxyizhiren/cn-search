
/**
 * Module dependencies.
 */

var reds = require('../');
var should = require('should');
//redis take 64ms,  and mock take 191ms

var db = require('./optionForTest.jsx').db;
var option = require('./optionForTest.jsx').option;

var search = reds.createSearch('reds',option);


var start = new Date;

describe("[ reds property ]", function() {
	it("reds version.", function() {
        reds.version.should.match(/^\d+\.\d+\.\d+$/);
    });
    it("segment", function() {
        reds
          .words('foo bar baz ')
          .should.eql(['foo', 'bar', 'baz']);
        reds
          .words(' Punctuation and whitespace; should be, handled.')
          .should.eql(['Punctuation', 'and', 'whitespace', 'should', 'be', 'handled']);
    });
    it("feature", function() {
        reds
          .stripStopWords(['this', 'is', 'just', 'a', 'test'])
          .should.eql(['just', 'test']);
        reds
          .countWords(['foo', 'bar', 'baz', 'foo', 'jaz', 'foo', 'baz'])
          .should.eql({
            foo: 3
            , bar: 1
            , baz: 2
            , jaz: 1
          });
        reds
          .metaphoneMap(['foo', 'bar', 'baz'])
          .should.eql({
              foo: 'F'
            , bar: 'BR'
            , baz: 'BS'
          });

        reds
          .metaphoneArray(['foo', 'bar', 'baz'])
          .should.eql(['F', 'BR', 'BS'])

        reds
          .metaphoneKeys('reds', ['foo', 'bar', 'baz'])
          .should.eql(['reds:word:F', 'reds:word:BR', 'reds:word:BS']);

        reds
          .metaphoneKeys('foobar', ['foo', 'bar', 'baz'])
          .should.eql(['foobar:word:F', 'foobar:word:BR', 'foobar:word:BS']);
    });

});



search
.index('Tobi wants 4 dollars', 0)
.index('Loki is a ferret', 2)
.index('Tobi is also a ferret', 3)
.index('Jane is a bitchy ferret', 4)
.index('Tobi is employed by LearnBoost', 5)
.index('computing stuff', 6)
.index('simple words do not mean simple ideas', 7)
.index('The dog spoke the words, much to our unbelief.', 8)
.index('puppy dog eagle puppy frog puppy dog simple', 9);

describe("[Search English Word]", function() {
	it("search two english word", function(done) {
      search
        .query('stuff compute')
        .end(function(err, ids){
          if (err) throw err;
          ids.should.eql(['6']);
          done();
        });
    });
    it("search english word hit more", function(done) {
        search
        .query('Tobi')
        .end(function(err, ids){
          if (err) throw err;
          ids.should.have.length(3);
          ids.should.containEql('0');
          ids.should.containEql('3');
          ids.should.containEql('5');
          done();
        });
    });
    it("search lowcase english word hit more", function(done) {
        search
        .query('tobi')
        .end(function(err, ids){
          if (err) throw err;
          ids.should.have.length(3);
          ids.should.containEql('0');
          ids.should.containEql('3');
          ids.should.containEql('5');
          done();
        });
    });
    it("search bitchy", function(done) {
        search
        .query('bitchy')
        .end(function(err, ids){
          if (err) throw err;
          ids.should.eql(['4']);
          done();
        });
    });
    it("search bitchy and jane", function(done) {
        search
        .query('bitchy jane')
        .end(function(err, ids){
          if (err) throw err;
          ids.should.eql(['4']);
          done();
        });
    });
    it("search more word with type or", function(done) {
        search
        .query('loki and jane')
        .type('or')
        .end(function(err, ids){
          if (err) throw err;
          ids.should.have.length(2);
          ids.should.containEql('2');
          ids.should.containEql('4');
          done();
        });
    });
    it("search more word with type or, again", function(done) {
        search
        .query('loki and jane')
        .type('or')
        .end(function(err, ids){
          if (err) throw err;
          ids.should.have.length(2);
          ids.should.containEql('2');
          ids.should.containEql('4');
          done();
        });
    });
    it("search more word with type and", function(done) {
        search
        .query('loki and jane')
        .end(function(err, ids){
          if (err) throw err;
          ids.should.eql([]);
          done();
        });
    });
    it("search jane and ferret", function(done) {
        search
        .query('jane ferret')
        .end(function(err, ids){
          if (err) throw err;
          ids.should.eql(['4']);
          done();
        });
    });
    it("search stopword, hit none", function(done) {
        search
        .query('is a')
        .end(function(err, ids){
          if (err) throw err;
          ids.should.eql([]);
          done();
        });
    });
    it("search simple", function(done) {
        search
        .query('simple')
        .end(function(err, ids){
          if (err) throw err;
          ids.should.have.length(2);
          ids.should.containEql('7');
          ids.should.containEql('9');
          ids[0].should.eql('7');
          ids[1].should.eql('9');
          done();
        });
    });
    it("search dog ideas", function(done) {
        search
        .query('dog ideas')
        .type('or')
        .end(function(err, ids){
          if (err) throw err;
          ids.should.have.length(3);
          ids.should.containEql('7');
          ids.should.containEql('8');
          ids.should.containEql('9');
          ids[0].should.eql('9');
          done();
        });
    });
    it("search word then remove then search again", function(done) {
        search
        .index('keyboard cat', 6, function(err){
          if (err) throw err;
          search.query('keyboard').end(function(err, ids){
            if (err) throw err;
            ids.should.eql(['6']);
            search.query('cat').end(function(err, ids){
              if (err) throw err;
              ids.should.eql(['6']);
              search.remove(6, function(err){
                if (err) throw err;
                search.query('keyboard').end(function(err, ids){
                  if (err) throw err;
                  ids.should.be.empty;
                  search.query('cat').end(function(err, ids){
                    if (err) throw err;
                    ids.should.be.empty;
                    done();
                  });
                });
              });
            });
          });
        });
    });
});



