/**
 * hack to work around lack of Blob support in file-api node package
 */
function makeSlice(buffer) {
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
}

if (typeof module != 'undefined') {
  module.exports.makeSlice = makeSlice;
}
