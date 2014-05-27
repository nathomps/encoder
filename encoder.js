/**
 * Constructor.
 */
var Decoder = function Decoder(_file) {
  /**
   * Instance member variables.
   */
  this.file = _file;
  if (this.file) {
    console.log("Decoding %d bytes from %s", this.file.size, this.file.name);
  }
  this.frameCount = 0;
  this.ondecodeend = undefined;
}

/**
 * Class member variables.
 */
Decoder.prototype.decoderFrameWidth = 352;
Decoder.prototype.decoderFrameHeight = 288;

/**
 * Gets the index into the Javascript rgba array based on the current x,y
 * position and frame width/height.
 */
Decoder.prototype.rgbaStartIndex = function (x, y, width, height) {
  return (x + (y * width)) * 4;
}

/**
 * Helper function to compute the byte count for a frame of given width/height
 * in YUV420 format.
 */
Decoder.prototype.frameByteCountYUV420 = function(frameWidth, frameHeight) {
  //var frameByteCount = frameWidth * frameHeight * 12;
  // 1 byte variance for every pixel, 1 byte color for every four pixels
  var yCount = frameWidth * frameHeight;
  var uCount = yCount / 4;
  var vCount = yCount / 4;
  return yCount + uCount + vCount;
}

/**
 * Reads the next frame from file and converts the contents into javascript rgba
 * format.
 */
Decoder.prototype.decodeFrame = function(rgbaArray) {
  /*
  var callback = (function(buffer) {
    var output = rgbaArray;
    that.convertYUV420ToRGBA(buffer, output);
  }
  this.readNextFrame(callback);
  */
}

/**
 * reads the next frame from this Decoder's file.
 * Passes an ArrayBuffer to callback.
 */
Decoder.prototype.readNextFrame = function(callback) {
  // try to read a blob
  var frameSize = this.frameByteCountYUV420(this.decoderFrameWidth, this.decoderFrameHeight);
  var startByte = this.frameCount * frameSize;
  this.frameCount++;
  var blob = this.file.slice(startByte, (startByte + frameSize));
  console.log("bytes", startByte, (startByte + frameSize));
  var fileReader = new FileReader();
  var that = this;

  fileReader.onloadend = (function() {
    var callbackFn = callback;
    return function(evt) {
      if (evt.target.readyState === FileReader.DONE) {
        var buffer = this.result;
        console.log("result len=", buffer.length);
        callbackFn(buffer);
      } else {
        console.log("Got event", evt);
      }
    }
  })();

  fileReader.readAsArrayBuffer(blob);
}

/**
 * Decodes an yuv420 frame into the given rgbaArray.
 */
Decoder.prototype.convertYUV420ToRGBA = function(data, rgbaArray) {
  /**
   * clips the value to the range [0,255]
   */
  function clip(value) {
    return Math.min(255, Math.max(0, value));
  }

  /**
   * Upscales a 4:2:0 chroma array into a 4:4:4 chroma array.
   */
  function upscaleTo444(input, output) {
    /*
    http://msdn.microsoft.com/en-us/library/windows/desktop/dd206750(v=vs.85).aspx
    Cout[0]     = Cin[0];
    Cout[1]     = clip((9 * (Cin[0] + Cin[1]) - (Cin[0] + Cin[2]) + 8) >> 4);
    Cout[2]     = Cin[1];
    Cout[3]     = clip((9 * (Cin[1] + Cin[2]) - (Cin[0] + Cin[3]) + 8) >> 4);
    Cout[4]     = Cin[2]
    Cout[5]     = clip((9 * (Cin[2] + Cin[3]) - (Cin[1] + Cin[4]) + 8) >> 4);
    ...
    Cout[2*i]   = Cin[i]
    Cout[2*i+1] = clip((9 * (Cin[i] + Cin[i+1]) - (Cin[i-1] + Cin[i+2]) + 8) >> 4);
    ...
    Cout[2*N-3] = clip((9 * (Cin[N-2] + Cin[N-1]) - (Cin[N-3] + Cin[N-1]) + 8) >> 4);
    Cout[2*N-2] = Cin[N-1];
    Cout[2*N-1] = clip((9 * (Cin[N-1] + Cin[N-1]) - (Cin[N-2] + Cin[N-1]) + 8) >> 4);
    */

    var croppedWidth = Decoder.prototype.decoderFrameWidth / 2;
    var croppedHeight = Decoder.prototype.decoderFrameHeight / 2;
    console.log("got ", input.length, " wanted ", (croppedWidth * croppedHeight));
    for (var y = 0; y < croppedHeight; y++) {
      var offset = y * croppedWidth;
      var writeOffset = y * Decoder.prototype.decoderFrameWidth;
      for (var x = 0; x < croppedWidth; x++) {
        var readIndex = offset + x;
        var writeIndex = writeOffset + (2 * x);
        output[writeIndex] = input[readIndex];
        output[writeIndex + Decoder.prototype.decoderFrameWidth] = input[readIndex];
        output[writeIndex+1] = input[readIndex];
        output[writeIndex + Decoder.prototype.decoderFrameWidth + 1] = input[readIndex];
      }
    }
  }

  var buffer = new Uint8Array(data);

  // set up a 4:4:4 structure
  /*
  var frameSize = this.decoderFrameHeight * this.decoderFrameWidth;
  var uBuffer = new Array(frameSize);
  upscaleTo444(buffer.subarray(frameSize, frameSize + (frameSize / 4)), uBuffer);
  var vBuffer = new Array(frameSize);
  upscaleTo444(buffer.subarray((frameSize + (frameSize / 4)), (frameSize + (frameSize / 2))), vBuffer);
  */

  // do the conversion from YUV 4:4:4 to RGB888 + Alpha
  for (var y = 0; y < this.decoderFrameHeight; y++) {
    var offset = y * this.decoderFrameHeight;
    for (var x = 0; x < this.decoderFrameWidth; x++) {
      var readIndex = offset + x;
      // 16 = black and 235 = white
      var Y = buffer[readIndex];
      // 16 = black and 240 = white
      var U = 128; //uBuffer[readIndex];
      var V = 128; //vBuffer[readIndex];
      // http://msdn.microsoft.com/en-us/library/windows/desktop/dd206750(v=vs.85).aspx
      var C = Y - 16;
      var D = U - 128;
      var E = V - 128;
      var writeIndex = this.rgbaStartIndex(x, y, this.decoderFrameWidth, this.decoderFrameHeight);
      // r
      // TODO: use uint8ClampedArray to avoid clip
      rgbaArray[writeIndex + 0] = clip(Math.round(1.164383 * C + 1.596027 * E));
      // g
      rgbaArray[writeIndex + 1] = clip(Math.round(1.164383 * C - (0.391762 * D) - (0.812968 * E)));
      // b
      rgbaArray[writeIndex + 2] = clip(Math.round(1.164383 * C + 2.017232 * D));
      // alpha
      rgbaArray[writeIndex + 3] = 255;
    }
  }

  if (this.ondecodeend) {
    this.ondecodeend();
  }

}

/*
Decoder.prototype.decode = function(fileReader, rgbaArray) {
  for (x = 0; x < this.decoderFrameWidth; x++) {
    for (y = 0; y < this.decoderFrameHeight; y++) {
      index = this.rgbaStartIndex(x, y, this.decoderFrameWidth, this.decoderFrameHeight);
      total = this.decoderFrameWidth * this.decoderFrameHeight * 4;
      this.decoderRgbaArray[index] = Math.floor(255 * (index / total));
      // green
      this.decoderRgbaArray[index + 1] = 0;
      // blue
      this.decoderRgbaArray[index + 2] = 0;
      // alpha
      this.decoderRgbaArray[index + 3] = 255;
    }
  
    function drawFrame(myDecoder, frameBuffer) {
      for (x = 0; x < myDecoder.decoderFrameWidth; x++) {
        for (y = 0; y < myDecoder.decoderFrameHeight; y++) {
          index = this.rgbaStartIndex(x, y, myDecoder.decoderFrameWidth, myDecoder.decoderFrameHeight);
          total = myDecoder.decoderFrameWidth * myDecoder.decoderFrameHeight * 4;
          myDecoder.decoderRgbaArray[index] = 0;
          // green
          myDecoder.decoderRgbaArray[index + 1] = 0;
          // blue
          myDecoder.decoderRgbaArray[index + 2] = 0;
          // alpha
          myDecoder.decoderRgbaArray[index + 3] = Math.floor(255 * (index / total));
        }
      }
    }
  
    console.log("file.size=", file.size);
    console.log("file.name=", file.name);
  
    //drawFrame(rgbaArray, undefined); 
    //render(rgbaArray, this.decoderFrameWidth, this.decoderFrameHeight);
  
    var frameByteCount = frameByteCountYUV420(this.decoderFrameWidth, this.decoderFrameHeight);
    console.log("frame.size=", frameByteCount);
    var frameBlob = file.slice(0, frameByteCount);
    console.log("blob.size=", frameBlob.size);
    var reader = new FileReader();
    reader.onloadend = function(e) {
      var myDecoder = this;
      var myReader = reader;
      return function (e) {
        var frameBuffer = myReader.result;
        console.log("reader done.  bytes=", frameBuffer.length);
        drawFrame(myDecoder, frameBuffer);
      }
    }();
    reader.readAsArrayBuffer(frameBlob);
  }

  function render(rgbaArray, width, height) {
    function blackBox(posX, posY, rgbaArray, width, height) {
      for (x = 0; x < 10; x++) {
        y = 0;
        index = this.rgbaStartIndex((posX + x), (posY + y), width, height);
        rgbaArray[index + 0] = 0;
        rgbaArray[index + 1] = 0;
        rgbaArray[index + 2] = 0;
        rgbaArray[index + 3] = 255;
        y = 1;
        index = this.rgbaStartIndex((posX + x), (posY + y), width, height);
        rgbaArray[index + 0] = 0;
        rgbaArray[index + 1] = 0;
        rgbaArray[index + 2] = 0;
        rgbaArray[index + 3] = 255;
        if (x === 0 || x === 1 || x === 8 || x === 9) {
          for (y = 2; y < 8; y++) {
            index = this.rgbaStartIndex((posX + x), (posY + y), width, height);
            rgbaArray[index + 0] = 0;
            rgbaArray[index + 1] = 0;
            rgbaArray[index + 2] = 0;
            rgbaArray[index + 3] = 255;
          }
        }
        y = 8;
        index = this.rgbaStartIndex((posX + x), (posY + y), width, height);
        rgbaArray[index + 0] = 0;
        rgbaArray[index + 1] = 0;
        rgbaArray[index + 2] = 0;
        rgbaArray[index + 3] = 255;
        y = 9;
        index = this.rgbaStartIndex((posX + x), (posY + y), width, height);
        rgbaArray[index + 0] = 0;
        rgbaArray[index + 1] = 0;
        rgbaArray[index + 2] = 0;
        rgbaArray[index + 3] = 255;
      }
    }

  	console.log("width=", width);
  	console.log("height=", height);
  	for (x = 0; x < width; x++) {
  		for (y = 0; y < height; y++) {
  			r = (255.0 * x) / width;
  			g = 0;
  			b = (255.0 * y) / height;
  			alpha = 255;
  			index = this.rgbaStartIndex(x, y, width, height);
  			rgbaArray[index + 0] = Math.min(255, r);
  			rgbaArray[index + 1] = Math.min(255, g);
  			rgbaArray[index + 2] = Math.min(255, b);
  			rgbaArray[index + 3] = alpha;
  		}
  	}
  	posX = 50;
  	posY = 60;
  	blackBox(posX, posY, rgbaArray, width, height);
  	posX = 170;
  	posY = 100;
  	blackBox(posX, posY, rgbaArray, width, height);
  }
}
*/


if (typeof module != 'undefined') {
  module.exports.Decoder = Decoder;
}
