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
    }
    console.log("field",fields[i]);
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

if (typeof module != 'undefined') {
  module.exports.YUV4MPEG2Header = YUV4MPEG2Header;
}