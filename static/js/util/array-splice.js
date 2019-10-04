// http://stackoverflow.com/a/41466395
/// не нужно
/// arr1.splice(idx, 0, ...arr2);
(function() {
  if(Array.prototype.spliceArray) return;
    
  Array.prototype.spliceArray = (function() {
    function inPlacePush(targetArray, pushedArray) {
    // Not using forEach for browser compatability
        var pushedArrayLength = pushedArray.length;
        for (var index = 0; index < pushedArrayLength; index++) {
           targetArray.push(pushedArray[index]);
       }
    }
    return function(index, insertedArray) {
      var postArray = this.splice(index);
      inPlacePush(this, insertedArray);
      inPlacePush(this, postArray);
    };
  })();
    
})();