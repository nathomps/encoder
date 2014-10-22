if (typeof module != 'undefined') {
  var FileAPI = require('file-api');
  var FileReader = FileAPI.FileReader;
}

function YUV4MPEG2Header() {
  // fields from the header
  this.frameWidth = 0;
  this.frameHeight = 0;
  this.frameRate = 0.0;
  this.interlacing = "progressive";
  this.aspect = 0;
  this.colorSpace = "default";
  this.headerLength = 0;
}

YUV4MPEG2Header.prototype.BUFFER_LENGTH = 128;

/**
 * Populates this header object with parameters parsed from the YUV4MPEG2
 * header.
 *
 * @throws RangeError if the string does not contain the full header.
 * @throws TypeError if the string is not a valid yuv4mpeg2 header.
 */
YUV4MPEG2Header.prototype.parseFromString = function(string) {
  if (string.indexOf('YUV4MPEG2 ') != 0) {
    throw TypeError('invalid header');
  }
  var newline = string.indexOf('\n');
  if (newline < 0) {
    throw RangeError('header too short');
  }
  var fields = string.substring(0, newline).split(" ");
  // skip the signature and first frame identifier
  for (var i = 1; i < fields.length; i++) {
    // width = 'W'
    if (fields[i].indexOf('W') == 0) {
      this.frameWidth = parseInt(fields[i].substring(1, fields[i].length));
    } else if (fields[i].indexOf('H') == 0) {
      this.frameHeight = parseInt(fields[i].substring(1, fields[i].length));
    }
  }
}


/**
 * Parses the yuv4mpeg2 header and setting internal fields that are present in
 * the header.
 * @return A new YUV4MPEG2 object from the header.
 */
YUV4MPEG2Header.prototype.parseFromFile = function(file, onparsedone) {
  var fileReader = new FileReader();
  fileReader.onreadend = (function() {
    return function() {
      var header = parse(result);
      onparsedone(header);
    }
  })();
  fileReader.readAsText(file.slice(0, this.BUFFER_LENGTH));
}











/**
 * Create a YUV4MPEG2 wrapper.
 *
 * @param file The file to read out YUV4MPEG2 content.
 * @throws If the YUV4MPEG2 header is missing.
 */
function YUV4MPEG2(_file) {
  this.file = new FileReader();
  this.header = undefined;
  this.headOffset = 0;
}

//YUV4MPEG2Header.prototype.parseFromFile = function(file, onparsedone) {

YUV4MPEG2.prototype.BUFFER_SIZE = 256;

/**
 * Determines the offset of frame data in the given string.

 * @throws RangeError if the string does not contain the full frame header.
 * @throws TypeError if the string does not look like a yuv4mpeg2 frame.
 */
YUV4MPEG2.prototype.getFrameStartIndex = function(string) {
  if (string.indexOf("FRAME") < 0) {
    throw TypeError("frame header missing");
  }
  var newline = string.indexOf('\n');
  if (newline < 0) {
    throw RangeError("newline missing");
  }

  return newline + 1;
}

YUV4MPEG2.prototype.readNextFrame = function(onreaddone) {
  onreaddone([]);
  /*
  this.file.slice(this.headOffset, this.BUFFER_SIZE, function() {
  yuv4=this; callback=onreaddone; return this.headerCallback();}());
  */
}

/*
YUV4MPEG2.prototype.headerCallback = function(yuv4, onreaddone) {
  try {
    endIndex = yuv4.getFrameStartIndex(this.slice.buffer); // result from fileReader
    yuv4.headerOffset += endIndex;
    yuv4.fileReader.slice(yuv4.headerOffset, FRAME_SIZE, onreaddone);
    yuv4.headerOffset += FRAME_SIZE;
  } catch (RangeError) {
    // try again wiht a bigger buffer, or just shift buffer and look for newline
  } catch (TypeError te) {
    // not sure what to do here?
    throw te;
  }
}
*/

if (typeof module != 'undefined') {
  module.exports.YUV4MPEG2Header = YUV4MPEG2Header;
  module.exports.YUV4MPEG2 = YUV4MPEG2;
}
