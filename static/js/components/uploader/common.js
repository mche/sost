(function () {'use strict';
/*
  
*/
var moduleName = "UploaderCommon";
try {angular.module(moduleName); return;} catch(e) { } 
var module = angular.module(moduleName, []);

module.factory('$UploaderUtil', function() {// factory

return {
  secondsToStr (temp) {
  const years = Math.floor(temp / 31536000);
  if (years) {
    return years + ' year' + numberEnding(years);
  }
  const days = Math.floor((temp %= 31536000) / 86400);
  if (days) {
    return days + ' day' + numberEnding(days);
  }
  const hours = Math.floor((temp %= 86400) / 3600);
  if (hours) {
    return hours + ' hour' + numberEnding(hours);
  }
  const minutes = Math.floor((temp %= 3600) / 60);
  if (minutes) {
    return minutes + ' minute' + numberEnding(minutes);
  }
  const seconds = temp % 60;
  return seconds + ' second' + numberEnding(seconds);
  function numberEnding (number) {
    return (number > 1) ? 's' : '';
  }
},

kebabCase (s) {
  return s.replace(/[A-Z]/g, (m) => `-${m.toLowerCase()}`);
},
}; /// конец return

});///конец factory
/**************************************************/
module.factory('$UploaderMixins', function() {// factory

return {
  uploader: {
    inject: ['uploader']
  },

 support: {
  data () {
    return {
      support: true
    }
  },
  mounted () {
    this.support = this.uploader.uploader.support
  }
},
  
}; /// конец return
  
});//конец factory

/**************************************************/
module.factory('$UploaderViewIframeMixins', function() {// factory
  
return {
  "methods": {
    ViewIframe(file){/// из uploader/файлы.js
      var vm = this;
      //~ console.log('ViewIframe', file);
      var iframe = {"src": file.src, "height": parseInt(window.innerHeight*0.8)/*modal max-height:90%;*/, "width": window.innerWidth, "content_type": file.content_type, "timeouts":[]};
      if (vm.iframeFile) {
        vm.iframeFile = undefined;
        setTimeout(function(){ vm.iframeFile = iframe; });
      } else 
      vm.iframeFile = iframe;
      iframe.timeouts.push(setTimeout(vm.CallbackWaitIframeLoad, 100));
    },
    CallbackWaitIframeLoad(){/// из uploader/файлы.js
      var vm = this;
      var iframe = vm.$el.getElementsByTagName('iframe')[0];
      if (!iframe) return console.log("CallbackWaitIframeLoad просмотр закрыт");
      if (vm.iframeFile.timeouts.length > 30 /* 30*100 мсек = 3000 сек общее ожидание вызова просмотра*/) return console.log("CallbackWaitIframeLoad: нет просмотра по timeouts");
      if (!iframe.contentDocument || iframe.contentDocument.URL/*contentWindow.document.URL*/ != 'about:blank') return $('#modal-view-in-iframe', $(vm.$el)).modal('open');
      vm.iframeFile.timeouts.push(setTimeout(vm.CallbackWaitIframeLoad, 100));
    },
    ViewIframeClose(){
      /*** ничего @click.stop!!! ***/
    },
  },
  
}; /// конец return
  
});//конец factory

/**************************************************/
module.factory('$UploaderEvents', function() {// factory

return ['fileProgress', 'fileSuccess', 'fileComplete', 'fileError']; 
  
});//конец factory

}());