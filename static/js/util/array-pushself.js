/// push() и вернуть self array
(function(){
  if(Array.prototype.pushSelf) return;
  
  
  Array.prototype.pushSelf = (function(){
  // save references to functions to make lookup faster
  var push = Array.prototype.push;
  var toString = Object.prototype.toString;

  return  function(val){
    if (toString.call(val).toLowerCase() == '[object array]') push.apply(this, val);// (this.push || push).apply(this, ...
    else push.apply(this, [val]);
    return this; ///self
  };

  })();
})();