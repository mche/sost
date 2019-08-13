/*******************
** var arr = [{}, {}, {}];
** var ob = arr[1];
** arr.removeOf(ob);
*******************/
(function() {
  if(Array.prototype.removeOf) return;
  
  Array.prototype.removeOf = (function() {
    return function (that) {
      var idx = this.indexOf(that);
      if (idx < 0) return undefined;
      this.splice(idx, 1);
      return idx;
    };
  })();
})();