var should = require('should');
var FileAPI = require('file-api');
var FileReader = FileAPI.FileReader;
var YUV4MPEG2Header = require(__dirname + '/../yuv4mpeg2.js').YUV4MPEG2Header;
//var MakeSlice = require(__dirname + '/slice.js').makeSlice;

describe('YUV4MPEG2Header', function(){
  var header = undefined;
  beforeEach(function(){
    header = new YUV4MPEG2Header();
  });

  describe('#parseFromString', function(){
      var fullString = 'YUV4MPEG2 W352 H240 F30000:1001 Ip A4320:4739\nFRAME\n! !""! !"!!!!!!!"! """';
    it('should parse width', function(){
      var string = 'YUV4MPEG2 W352\n';
      header.parseFromString(string);
      header.frameWidth.should.equal(352);
    });

    it('should parse height', function(){
      var string = 'YUV4MPEG2 H240\n';
      header.parseFromString(string);
      header.frameHeight.should.equal(240);
    });

    it('should throw type error for invalid string', function(){
      (function(){ header.parseFromString("junk"); }).should.throw();
    });

    it('should throw range error for incomplete string', function(){
      (function(){ header.parseFromString("YUV4MPEG2 W352"); }).should.throw();
    });
  });
});
