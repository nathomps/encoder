var Decoder = function Decoder(_file) {
  this.file = _file;
  this.frameCount = 0;

  function yuvToRGB() {
/*
size.total = size.width * size.height;
y = yuv[position.y * size.width + position.x];
u = yuv[(position.y / 2) * (size.width / 2) + (position.x / 2) + size.total];
v = yuv[(position.y / 2) * (size.width / 2) + (position.x / 2) + size.total + (size.total / 4)];
rgb = Y'UV444toRGB888(y, u, v);
*/
  }
}

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
  console.log("decoding from ",this.file.name);
  // try to read a blob
  var frameSize = this.frameByteCountYUV420(this.decoderFrameWidth, this.decoderFrameHeight);
  var blob = this.file.slice((this.frameCount * frameSize), frameSize);
  var fileReader = new FileReader();
  fileReader.onloadend = (function() {
    return function(evt) {
      if (evt.target.readyState === FileReader.DONE) {
        var buffer = this.result;
        console.log("result len=", buffer.length);
      } else {
        console.log("Got event", evt);
      }
    }
  })();
  fileReader.readAsBinaryString(blob);
}

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
    /*
    first width*height bytes are the Y values.
    next are the u values (1/4 of y values).
    last are the v values (1/4 of y values).
  // http://trace.eas.asu.edu/yuv/
      //unsigned char luma[352][288];
      //unsigned char cb[176][144];
      //unsigned char cr[176][144];
  
    i = x * 352 + y;
    pixel[i][r] = cr[floor(i/2)];
    pixel[i][g] = 255 - (cr[floor(i/2)] + cb[floor(i/2)]);
    pixel[i][b] = cb[floor(i/2)];
    pixel[i][alpha] = luma[i];
    */
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

