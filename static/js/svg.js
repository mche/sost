(function () {
  'use strict';
  /*
  отличный сайт SVG иконки https://icons8.com/icon/
  <svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" viewBox="0 0 50 50" version="1.1" style="height:2rem;" ng-include=" 'svg/truck' " />
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 30 30"  ng-include=" 'svg/copy' " class="middle green-fill" style="height: 2rem;" />
  
  http://www.heropatterns.com/
  background-color: #DFDBE5;
  background-image: url("data:image/svg+xml,%3Csvg width='60' height='48' viewBox='0 0 60 48' xmlns='http://www.w3.org/2000/svg'%3E%3Cg id='Page-1' fill='none' fill-rule='evenodd'%3E%3Cg id='fancy-rectangles' fill='%239C92AC' fill-opacity='0.4'%3E%3Cpath d='M6 12h6v12H6V12zm12 0h6v12h-6V12zm6-12h6v12h-6V0zM12 0h6v12h-6V0zm0 24h6v12h-6V24zM0 0h6v12H0V0zm6 36h6v12H6V36zm12 0h6v12h-6V36zm12-12h6v12h-6V24zM42 0h6v12h-6V0zm-6 12h6v12h-6V12zm12 0h6v12h-6V12zM36 36h6v12h-6V36zm12 0h6v12h-6V36zm-6-12h6v12h-6V24zm12 0h6v12h-6V24z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E");
  
  https://jsbin.com/micepar/embed?html,css,output
  background: url("data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCAzMCAzMCIgY2xhc3M9ImZpbGwtbmF2eSI+CiAgICA8cGF0aCBkPSJNIDExIDIgQyA5Ljg5NSAyIDkgMi44OTUgOSA0IEwgOSAyMCBDIDkgMjEuMTA1IDkuODk1IDIyIDExIDIyIEwgMjQgMjIgQyAyNS4xMDUgMjIgMjYgMjEuMTA1IDI2IDIwIEwgMjYgOC41IEMgMjYgOC4yMzUgMjUuODk1MDMxIDcuOTgwOTY4NyAyNS43MDcwMzEgNy43OTI5Njg4IEwgMjAuMjA3MDMxIDIuMjkyOTY4OCBDIDIwLjAxOTAzMSAyLjEwNDk2ODcgMTkuNzY1IDIgMTkuNSAyIEwgMTEgMiB6IE0gMTkgMy45MDQyOTY5IEwgMjQuMDk1NzAzIDkgTCAyMCA5IEMgMTkuNDQ4IDkgMTkgOC41NTIgMTkgOCBMIDE5IDMuOTA0Mjk2OSB6IE0gNiA3IEMgNC44OTUgNyA0IDcuODk1IDQgOSBMIDQgMjUgQyA0IDI2LjEwNSA0Ljg5NSAyNyA2IDI3IEwgMTkgMjcgQyAyMC4xMDUgMjcgMjEgMjYuMTA1IDIxIDI1IEwgMjEgMjQgTCAxMSAyNCBDIDguNzk0IDI0IDcgMjIuMjA2IDcgMjAgTCA3IDcgTCA2IDcgeiI+PC9wYXRoPgo8L3N2Zz4=");
  */
  var module = angular.module('SVGCache', []);
  //~ .factory('SVGCache', function($templateCache){ return $templateCache; })
  module.run(function($templateCache) {
    module.$templateCache = $templateCache;
    //~ <svg  xmlns="http://www.w3.org/2000/svg" viewBox="0 0 50 50" class="middle teal-fill fill-darken-3" style="height: 2rem;" ng-include=" 'svg/truck' " />
    var data = {
      'svg/truck': '<use xlink:href="/fonts/icons.svg#truck" />',
      'svg/copy': '<use xlink:href="/fonts/icons.svg#copy" />',
      'svg/рабочий': '<use xlink:href="/fonts/icons.svg#рабочий" />',
    
      'svg/внимание/время': '<use xlink:href="/fonts/icons.svg#внимание/время" />',
      'svg/ms-word': '<use xlink:href="/fonts/icons.svg#ms-word" />',
    //~ <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 26 26" class="middle grey-fill" style="height: 2rem;" ng-include=" 'svg/начальная дата' " />
      'svg/начальная дата': '<use xlink:href="/fonts/icons.svg#начальная дата" />',
      'svg/конечная дата': '<use xlink:href="/fonts/icons.svg#конечная дата" />',
    //<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" class="middle blue-fill" style="height: 2rem;" ng-include=" 'svg/событие принято' " />
      'svg/событие принято': '<use xlink:href="/fonts/icons.svg#событие принято" />',
    //~ <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" class="middle blue-fill" style="height: 2rem;" ng-include=" 'svg/повторить' " />
      'svg/повторить': '<use xlink:href="/fonts/icons.svg#повторить" />',
    //~ <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48" class="middle blue-fill" style="height: 2rem;" ng-include=" 'svg/туда-обратно' " />
      'svg/туда-обратно': '<use xlink:href="/fonts/icons.svg#туда-обратно" />',
    //~ <svg  xmlns="http://www.w3.org/2000/svg" viewBox="0 0 50 50" class="middle teal-fill fill-darken-3" style="height: 2rem; position: absolute; top:0; left:0;" ng-include=" 'svg/вправо-вниз' " />
      'svg/вправо-вниз': '<use xlink:href="/fonts/icons.svg#вправо-вниз" />',
      //~ <svg  xmlns="http://www.w3.org/2000/svg" viewBox="0 0 50 50" class="middle teal-fill fill-darken-3" style="height: 2rem; position: absolute; top:0; left:0;" ng-include=" 'svg/вправо-вниз-выпукло' " />
      'svg/вправо-вниз-выпукло': '<use xlink:href="/fonts/icons.svg#вправо-вниз-выпукло" />',
    //~ <svg  xmlns="http://www.w3.org/2000/svg" viewBox="0 0 50 50" class="middle teal-fill fill-darken-3" style="height: 2rem;" ng-include=" 'svg/тачка' " />
      'svg/тачка': '<use xlink:href="/fonts/icons.svg#тачка" />',
    //~ <svg  xmlns="http://www.w3.org/2000/svg" viewBox="0 0 50 50" class="middle teal-fill fill-darken-3" style="height: 2rem;" ng-include=" 'svg/водитель' " />
      'svg/водитель': '<use xlink:href="/fonts/icons.svg#водитель" />',
    //~ <svg  xmlns="http://www.w3.org/2000/svg" viewBox="0 0 50 50" class="middle teal-fill fill-darken-3" style="height: 2rem;" ng-include=" 'svg/person' " />
      'svg/person': '<use xlink:href="/fonts/icons.svg#person" />',
    //~ <svg  xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" class="middle teal-fill fill-darken-3" style="height: 1rem;" ng-include=" 'svg/плюс в квадрате' " />
      'svg/плюс в квадрате': '<use xlink:href="/fonts/icons.svg#плюс в квадрате" />',
    //~ <svg  xmlns="http://www.w3.org/2000/svg" viewBox="0 0 26 26" class="middle teal-fill fill-darken-3" style="height: 1rem;" ng-include=" 'svg/плюс в квадрате заполнен' " />
      'svg/плюс в квадрате заполнен': '<use xlink:href="/fonts/icons.svg#плюс в квадрате заполнен" />',
    //~ <svg  xmlns="http://www.w3.org/2000/svg" viewBox="0 0 50 50" class="middle red-fill fill-darken-1" style="height: 2rem;" ng-include=" 'svg/стереть' " />
    //~ добавить в path transform="rotate(180, 25, 25)"
      'svg/стереть': '<use xlink:href="/fonts/icons.svg#стереть" />',
    //~ <svg  xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48" class="middle red-fill fill-darken-1" style="height: 2rem;" ng-include=" 'svg/стрелка влево вверх полукруг' " />
      'svg/стрелка влево вверх полукруг': '<use xlink:href="/fonts/icons.svg#стрелка влево вверх полукруг" />',
    //~ <svg  xmlns="http://www.w3.org/2000/svg" viewBox="0 0 50 50" class="middle teal-fill fill-darken-3" style="height: 2rem;" ng-include=" 'svg/колесо' " />
      'svg/колесо': '<use xlink:href="/fonts/icons.svg#колесо" />',
      //~ <svg  xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" class="middle teal-fill fill-darken-3" style="height: 2rem;" ng-include=" 'svg/filter' " />
      'svg/filter': '<use xlink:href="/fonts/icons.svg#filter" />',
      //~ <svg  xmlns="http://www.w3.org/2000/svg" viewBox="0 0 26 26" class="middle teal-fill fill-darken-3" style="height: 2rem;" ng-include=" 'svg/откуда' " />
      'svg/откуда': '<use xlink:href="/fonts/icons.svg#откуда" />',
      //~ <svg  xmlns="http://www.w3.org/2000/svg" viewBox="0 0 26 26" class="middle teal-fill fill-darken-3" style="height: 2rem;" ng-include=" 'svg/куда' " />
      'svg/куда': '<use xlink:href="/fonts/icons.svg#куда" />',
      //~ <svg  xmlns="http://www.w3.org/2000/svg" viewBox="0 0 252 252" class="middle teal-fill fill-darken-3" style="height: 2rem;" ng-include=" 'svg/расчет готов' " />
      'svg/расчет готов': '<use xlink:href="/fonts/icons.svg#расчет готов" />',
      //~ <svg  xmlns="http://www.w3.org/2000/svg" viewBox="0 0 50 50" class="middle teal-fill fill-darken-3" style="height: 2rem;" ng-include=" 'svg/крыжик1' " />
      'svg/крыжик1': '<use xlink:href="/fonts/icons.svg#крыжик1" />',
      //~ <svg  xmlns="http://www.w3.org/2000/svg" viewBox="0 0 50 50" class="middle teal-fill fill-darken-3" style="height: 2rem;" ng-include=" 'svg/отменить' " />
      // кружок перечеркнут как знак остановка запрещена
      'svg/отменить': '<use xlink:href="/fonts/icons.svg#отменить" />',
      //~ <svg  xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" class="middle teal-fill fill-darken-3" style="height: 2rem;" ng-include=" 'svg/вернуть' " />
      // загнутая стрелка назад влево
      'svg/вернуть': '<use xlink:href="/fonts/icons.svg#вернуть" />',
      //~ <svg  xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" class="middle teal-fill fill-darken-3" style="height: 2rem;" ng-include=" 'svg/сохранить' " />
      // дискета
      'svg/сохранить': '<use xlink:href="/fonts/icons.svg#сохранить" />',
      //~ <svg  xmlns="http://www.w3.org/2000/svg" viewBox="0 0 50 50" class="middle teal-fill fill-darken-3" style="height: 2rem;" ng-include=" 'svg/! знак в залитом кружке' " />
      'svg/! знак в залитом кружке': '<use xlink:href="/fonts/icons.svg#!знак-в-залитом-кружке" />',
      //~ <svg  xmlns="http://www.w3.org/2000/svg" viewBox="0 0 50 50" class="middle teal-fill fill-darken-3" style="height: 2rem;" ng-include=" 'svg/сигма-знак' " />
      'svg/сигма-знак': '<use xlink:href="/fonts/icons.svg#сигма-знак" />',
      //~ 'svg/': '', // вставлять path или g
    };
    angular.forEach(data, function(val, key) {
      $templateCache.put(key, val);
    });
    
  });
  
})();