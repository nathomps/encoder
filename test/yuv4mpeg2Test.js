var should = require('should');
var FileAPI = require('file-api');
var FileReader = FileAPI.FileReader;
var YUV4MPEG2API = require(__dirname + '/../yuv4mpeg2.js');
var MakeSlice = require(__dirname + '/slice.js').makeSlice;

describe('YUV4MPEG2Header', function(){
  var header = undefined;
  beforeEach(function(){
    header = new YUV4MPEG2API.YUV4MPEG2Header();
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

describe('YUV4MPEG2', function(){
  /*
   *
   * Constructor
   *
   */
  describe('#YUV4MPEG2', function(){
    var FRAME_WIDTH = 2;
    var FRAME_HEIGHT = 7;

    var yuv4 = undefined;

    beforeEach(function(){
      var file = new FileAPI.File('fake');
      FileAPI.File.prototype.slice = function() {};
      yuv4 = new YUV4MPEG2API.YUV4MPEG2(file, FRAME_WIDTH, FRAME_HEIGHT);
    });

    it('should have a file', function(){
      yuv4.file.should.not.equal(undefined);
    });

    it('should set header to undefined', function(){
      (yuv4.header === undefined).should.be.true;
    });

    it('should set headOffset to 0', function(){
      yuv4.headOffset.should.equal(0);
    });
  });

  /*
   *
   * get Frame Start Index
   *
   */
  describe('#getFrameStartIndex', function(){
    it('should throw if frame tag missing', function(){
      (function(){ YUV4MPEG2API.YUV4MPEG2.prototype.getFrameStartIndex('\n! !""! !"!!!!!!!"! """'); }).should.throw();
    });

    it('should throw if newline missing', function(){
      (function() { YUV4MPEG2API.YUV4MPEG2.prototype.getFrameStartIndex('FRAME'); }).should.throw();
    });

    it('should return index after newline', function(){
      YUV4MPEG2API.YUV4MPEG2.prototype.getFrameStartIndex('FRAME\n! !""! !"!!!!!!!"! """').should.equal(6);
    });
  });

  /****************************************************************************
   *
   * ReadNextFrame
   *
   ***************************************************************************/
  describe('#readNextFrame()', function(){
    var FRAME_HEIGHT = 4;
    var FRAME_WIDTH = 4;
    var BUFFER_SIZE = 64;

    var yuv4 = undefined;

    var bytes = new Uint8Array(BUFFER_SIZE);
    var i = 0;
    bytes[i++] = 'F';
    bytes[i++] = 'R';
    bytes[i++] = 'A';
    bytes[i++] = 'M';
    bytes[i++] = 'E';
    bytes[i++] = '\n';
    for (var j = 0; j < (FRAME_HEIGHT * FRAME_WIDTH); j++) {
      bytes[i++] = j;
    }
    bytes[i++] = 'F';
    bytes[i++] = 'R';
    bytes[i++] = 'A';
    bytes[i++] = 'M';
    bytes[i++] = 'E';
    bytes[i++] = '\n';
    for (var j = 0; j < (FRAME_HEIGHT * FRAME_WIDTH); j++) {
      bytes[i++] = j + (FRAME_HEIGHT * FRAME_WIDTH);
    }

    // create a mock file around the byte array
    beforeEach(function(){
      var fileConfig = {
        name:   "test_file",
        buffer: bytes,
      };
      var file = new FileAPI.File(fileConfig);
      FileAPI.File.prototype.slice = MakeSlice(bytes);
      yuv4 = new YUV4MPEG2API.YUV4MPEG2(file, FRAME_WIDTH, FRAME_HEIGHT);
    });

    // has to parse FRAME out correctly
    it('should read correct first frame', function(done){
      var frameSize = FRAME_WIDTH * FRAME_HEIGHT;
      var callback = (function(frameSize) {
        return function(buffer) {
          var byteArray = new Uint8Array(buffer);
          byteArray.length.should.equal(frameSize);
          for (var i = 0; i < frameSize; i++) {
            byteArray[i].should.equal(i);
          }
          done();
        };
      })(frameSize);
      yuv4.readNextFrame(callback);
    });
/*
    it('should read correct second frame', function(done){
      var skip = function() {}
      var callback = function(buffer) {
        var byteArray = new Uint8Array(buffer);
        var frameSize = (Decoder.prototype.decoderFrameWidth * Decoder.prototype.decoderFrameHeight) * 1.5;
        byteArray.length.should.equal(frameSize);
        for (var i = 0; i < frameSize; i++) {
          byteArray[i].should.equal(frameSize + i);
        }
        done();
      };
      decoder.readNextFrame(skip);
      decoder.readNextFrame(callback);
    });
    */

  });

});
