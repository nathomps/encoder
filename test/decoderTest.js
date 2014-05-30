var should = require('should');
var FileAPI = require('file-api');
var FileReader = FileAPI.FileReader;
var Decoder = require(__dirname + '/../encoder.js').Decoder;

describe('Decoder', function(){
  var decoder = undefined;
  beforeEach(function(){
    decoder = new Decoder(null);
  });

  describe('#convertYUVToRGBA()', function(){
    Decoder.prototype.decoderFrameWidth = 4;
    Decoder.prototype.decoderFrameHeight = 4;
    it('should generate correct RGB values', function(){
      var uint8Buffer = new Uint8Array(24);
      // 4 x 4 luma values
      var index = 0;
      // first row should be white
      uint8Buffer[index++] = 235;
      uint8Buffer[index++] = 235;
      uint8Buffer[index++] = 235;
      uint8Buffer[index++] = 235;

      // second row should be grey
      uint8Buffer[index++] = 162;
      uint8Buffer[index++] = 162;
      uint8Buffer[index++] = 162;
      uint8Buffer[index++] = 162;

      // second row should be darker grey
      uint8Buffer[index++] = 89;
      uint8Buffer[index++] = 89;
      uint8Buffer[index++] = 89;
      uint8Buffer[index++] = 89;

      // last row should be black
      uint8Buffer[index++] = 16;
      uint8Buffer[index++] = 16;
      uint8Buffer[index++] = 16;
      uint8Buffer[index++] = 16;

      // 2 x 2 chroma b
      for (; index < 20; index++) {
        uint8Buffer[index] = 128;
      }

      // 2 x 2 chroma r
      for (; index < 24; index++) {
        uint8Buffer[index] = 128;
      }

      var output = new Array(64);
      decoder.convertYUV420ToRGBA(uint8Buffer.buffer, output);
      /*
      for (var i = 0; i < 64; i+=4) {
        console.log("%d,%d,%d,%d", output[i], output[i+1], output[i+2], output[i+3]);
      }
      */

      // alpha channel
      output[3].should.equal(255);
      output[63].should.equal(255);

      // first row is white
      output[0].should.equal(255);
      output[1].should.equal(255);
      output[2].should.equal(255);

      // last row is black
      output[60].should.equal(0);
      output[61].should.equal(0);
      output[62].should.equal(0);

      // each row has all the same rgb values
      for (var i = 0; i < 64; i += 16) {
        output[i + 4].should.equal(output[i]);
        output[i + 8].should.equal(output[i]);
        output[i + 12].should.equal(output[i]);
      }
    });
  });

  describe('#readNextFrame()', function(){
    Decoder.prototype.decoderFrameWidth = 4;
    Decoder.prototype.decoderFrameHeight = 4;
    var BUFFER_SIZE = 64;
    var bytes = new Uint8Array(BUFFER_SIZE);
    for (var i = 0; i < bytes.length; i++) {
      bytes[i] = i;
    }

    beforeEach(function(){
      var fileConfig = {
        name:   "test_file",
        buffer: bytes,
      };
      var file = new FileAPI.File(fileConfig);
      // hack to work around lack of Blob support in file-api node package
      FileAPI.File.prototype.slice = (function(buffer) {
        var origBuffer = buffer;
        return function(/* start, end, contentType */) {
          // http://www.w3.org/TR/FileAPI/#slice-method-algo
          var relativeStart = 0;
          if (arguments.length > 0) {
            var start = arguments[0];
            if (start < 0) {
              relativeStart = Math.max((origBuffer.length + start), 0);
            } else if (start > 0) {
              relativeStart = Math.min(start, origBuffer.length);
            }
          }

          var relativeEnd = origBuffer.length;
          if (arguments.length > 1) {
            var end = arguments[1];
            if (end < 0) {
              relativeEnd = Math.max((origBuffer.length + end), 0);
            } else if (end > 0) {
              relativeEnd = Math.min(end, origBuffer.length);
            }
          }

          this.size = relativeEnd - relativeStart;
          this.buffer = new Uint8Array(this.size);
          for (var i = 0; i < this.size; i++) {
            this.buffer[i] = origBuffer[i + relativeStart];
          }
          return this;
        }
      })(bytes);

      decoder = new Decoder(file);
    });

    it('should read correct first frame', function(output){
      var callback = function(buffer) {
        var byteArray = new Uint8Array(buffer);
        var frameSize = (Decoder.prototype.decoderFrameWidth * Decoder.prototype.decoderFrameHeight) * 1.5;
        byteArray.length.should.equal(frameSize);
        for (var i = 0; i < frameSize; i++) {
          byteArray[i].should.equal(i);
        }
      };
      decoder.readNextFrame(callback);
    });

    it('should read correct second frame', function(output){
      var skip = function() {}
      var callback = function(buffer) {
        var byteArray = new Uint8Array(buffer);
        var frameSize = (Decoder.prototype.decoderFrameWidth * Decoder.prototype.decoderFrameHeight) * 1.5;
        byteArray.length.should.equal(frameSize);
        for (var i = 0; i < frameSize; i++) {
          byteArray[i].should.equal(frameSize + i);
        }
      };
      decoder.readNextFrame(skip);
      decoder.readNextFrame(callback);
    });

  });
});
