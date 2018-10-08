/// push() и вернуть self array
(function(){
  if(Array.prototype.pushSelf) return;
  
  
  Array.prototype.pushSelf = (function(){
  // save references to array functions to make lookup faster
  var push = Array.prototype.push;

  return  function(val){
    push.apply(this, [val]);// (this.push || push).apply(this, ...
    return this; // for testing purposes
  };

  })();
})();