// Taken from Reid's answer at http://stackoverflow.com/questions/5306680/move-an-array-element-from-one-array-position-to-another
(function() {
  if(!Array.prototype.move) {
    Array.prototype.move = (function() {
    // save references to array functions to make lookup faster
    var push = Array.prototype.push,
        splice = Array.prototype.splice;

    return function (old_index, new_index) {
        while (old_index < 0) {
          old_index += this.length;
        }
        while (new_index < 0) {
          new_index += this.length;
        }
        if (new_index >= this.length) {
          var k = new_index - this.length;
          while ((k--) + 1) {
            //this.push(undefined);
            push.apply(this, undefined);// (this.push || push).apply(this, ...
          }
        }
        //this.splice(new_index, 0, this.splice(old_index, 1)[0]);
        splice.call(this, new_index, 0, splice.call(this, old_index, 1)[0]);//(this.splice || splice).call(this,
        return this; // for testing purposes
      };
    })();
  }
})();