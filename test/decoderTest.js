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
        buffer: bytes.buffer,
        size:   bytes.length
      };
      var file = new FileAPI.File(fileConfig);
      FileAPI.File.prototype.slice = function() {
      }
      decoder = new Decoder(file);
    });

    it('should read correct bytes', function(output){
      var callback = function(buffer) {
        var byteArray = new Uint8Array(buffer);
        for (var i = 0; i < BUFFER_SIZE; i++) {
          byteArray[i].should.equal(i);
        }
      };
      decoder.readNextFrame(callback);
    });
  });
});
