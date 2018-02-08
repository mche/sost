function unicodeEscape(str) {
  var result = '', index = 0, charCode, escape;
  while (!isNaN(charCode = str.charCodeAt(index++))) {
    escape = charCode.toString(16);
    result += charCode < 256
      ? '\\x' + (charCode > 15 ? '' : '0') + escape
      : '\\u' + ('0000' + escape).slice(-4);
  }
  return result;
}