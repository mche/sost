/*
stepsColor('#800000', '#ffffff', 6)  
*/
function stepsColor(startColor, endColor, steps) {
   var startR = parseInt(startColor.slice(1,3), 16),
    endR = parseInt(endColor.slice(1,3), 16),
    startG = parseInt(startColor.slice(3,5), 16),
    endG = parseInt(endColor.slice(3,5), 16),
    startB = parseInt(startColor.slice(5,7), 16),
    endB = parseInt(endColor.slice(5,7), 16),
    dR = (endR - startR)/steps,
    dG = (endG - startG)/steps,
    dB = (endB - startB)/steps,
    stepsHex  = new Array()
  ;
   for(var i = 0; i <= steps; i++) {
     var stepR = Math.round(startR + dR * i) || '00';
     var stepG = Math.round(startG + dG * i) || '00';
     var stepB = Math.round(startB + dB * i) || '00';
     stepsHex[i] = '#' + stepR.toString(16)  + stepG.toString(16)  + stepB.toString(16);
   }
   return stepsHex;
}