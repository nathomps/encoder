var should = require('should');
var Decoder = require(__dirname + '/../encoder.js').Decoder;

describe('Decoder', function(){
  var decoder = undefined;
  beforeEach(function(){
    decoder = new Decoder();
  });

  describe('#convertYUVToRGBA()', function(){
    Decoder.prototype.decoderFrameWidth = 4;
    Decoder.prototype.decoderFrameHeight = 1;
    it('should handle 0 values', function(){
      var buffer = [0, 0, 0, 0, 0, 0];
      var output = new Array(24);
      decoder.convertYUV420ToRGBA(buffer, output);
      for (var i = 0; i < 24; i += 4) {
        output[i].should.equal(0);
        output[i + 1].should.equal(0);
        output[i + 2].should.equal(0);
      }
    });
  });
});
