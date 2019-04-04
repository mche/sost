(function () {'use strict';
/*
*/

var moduleName = "Номенклатура";
try {angular.module(moduleName); return;} catch(e) { } 
var module = angular.module(moduleName, ['appRoutes',]);//'ngSanitize',, 'dndLists'

/******************************************************/
var Data  = function($http, appRoutes){
  const MapLookupAutocomplete = function(item) {
    //~ var val = item.parents_title.slice(item.parents_id[0] == $c.item.topParent.id ? 1 : 0);// копия
    var val = item.parents_title.slice(0);
    val.push(item.title);
    return {value: val.join('〉'), data:item, _title: (item._title || '') + item.id ? '(поз. #'+item.id+')' : '',};
  };
  
  const SortLookupAutocomplete = function (a, b) {
    if (a.value.toLowerCase() > b.value.toLowerCase()) return 1;
    if (a.value.toLowerCase() < b.value.toLowerCase()) return -1; 
    return 0;
  };
  var cache = {}, data = [], lookup = [], $data = {}, then, $this = {
    "Load": function(){
      if (!then) $this.Refresh(0);
      return then;/*$http.get(appRoutes.url_for('номенклатура/список', param || 0)); */ 
    },
    "Refresh": function(param){
      data.splice(0, data.length);
      lookup.splice(0, lookup.length);
      for (var prop in $data) { if ($data.hasOwnProperty(prop)) { delete $data[prop]; } }///только такая очистка хэша
      then = $http.get(appRoutes.url_for('номенклатура/список', param || 0)).then(function(resp){
         Array.prototype.push.apply(data, resp.data);
        return data;
      });
      return $this;
    },
    "Data": function(){///массив
      return data;
    },
    "$Data": function(){///из массива хэш
      if (Object.keys($data).length === 0 ) data.reduce(function(result, item, index, array) {  result[item.id] = item; return result; }, $data);
      //~ console.log("Nomen $Data", )
      return $data;
    },
    "LookupComplete": function(data){/// в tree-item
      if (!data) {
        if (lookup.length)  /*/~ console.log("lookup ready!!!");*/
          return lookup;

        data = $this.Data();
        lookup.splice(0, lookup.length);
        Array.prototype.push.apply(lookup, data.map(MapLookupAutocomplete).sort(SortLookupAutocomplete));
        //~ console.log("lookup on Data()");
        return lookup;
      }
      //~ console.log("lookup on pass data");
      return data.map(MapLookupAutocomplete).sort(SortLookupAutocomplete);
    },
    
    "@Список без потомков": [],///по идее функция возвращает список
    "Список без потомков/загружено": function(){ return $this['_Список без потомков/загружено']; },///then
    "Список без потомков/обновить": function(param){
      $this['_Список без потомков/загружено'] = $http.get(appRoutes.url_for('номенклатура/список без потомков', param || 0)).then(function(resp){
        $this['@Список без потомков'].splice(0, $this['@Список без потомков'].length);
        Array.prototype.push.apply($this['@Список без потомков'], resp.data);
        return resp.data;
      });
      return $this;
    },
  };
  return $this.Refresh(0);
  
};

/*=============================================================*/

module

.factory('$Номенклатура', Data)
//~ .factory(moduleName, Data)//нельзя разные объекты

;

}());