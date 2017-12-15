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
      'svg/worker': '<use xlink:href="/fonts/icons.svg#worker" />',
    
      'svg/warn-time': '<use xlink:href="/fonts/icons.svg#warn-time" />',
      'svg/ms-word': '<use xlink:href="/fonts/icons.svg#ms-word" />',
    //~ <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 26 26" class="middle grey-fill" style="height: 2rem;" ng-include=" 'svg/start-date' " />
      'svg/start-date': '<use xlink:href="/fonts/icons.svg#start-date" />',
      'svg/finish-date': '<use xlink:href="/fonts/icons.svg#finish-date" />',
    //<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" class="middle blue-fill" style="height: 2rem;" ng-include=" 'svg/event-done' " />
      'svg/event-done': '<use xlink:href="/fonts/icons.svg#event-done" />',
    //~ <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" class="middle blue-fill" style="height: 2rem;" ng-include=" 'svg/repeat' " />
      'svg/repeat': '<use xlink:href="/fonts/icons.svg#repeat" />',
    //~ <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48" class="middle blue-fill" style="height: 2rem;" ng-include=" 'svg/arrows-forward-backward' " />
      'svg/arrows-forward-backward': '<use xlink:href="/fonts/icons.svg#arrows-forward-backward" />',
    //~ <svg  xmlns="http://www.w3.org/2000/svg" viewBox="0 0 50 50" class="middle teal-fill fill-darken-3" style="height: 2rem; position: absolute; top:0; left:0;" ng-include=" 'svg/right-down' " />
      'svg/right-down': '<use xlink:href="/fonts/icons.svg#right-down" />',
      //~ <svg  xmlns="http://www.w3.org/2000/svg" viewBox="0 0 50 50" class="middle teal-fill fill-darken-3" style="height: 2rem; position: absolute; top:0; left:0;" ng-include=" 'svg/right-down-выпукло' " />
      'svg/right-down-выпукло': '<use xlink:href="/fonts/icons.svg#right-down-выпукло" />',
    //~ <svg  xmlns="http://www.w3.org/2000/svg" viewBox="0 0 50 50" class="middle teal-fill fill-darken-3" style="height: 2rem;" ng-include=" 'svg/тачка' " />
      'svg/тачка': '<use xlink:href="/fonts/icons.svg#тачка" />',
    //~ <svg  xmlns="http://www.w3.org/2000/svg" viewBox="0 0 50 50" class="middle teal-fill fill-darken-3" style="height: 2rem;" ng-include=" 'svg/driver' " />
      'svg/driver': '<use xlink:href="/fonts/icons.svg#driver" />',
    //~ <svg  xmlns="http://www.w3.org/2000/svg" viewBox="0 0 50 50" class="middle teal-fill fill-darken-3" style="height: 2rem;" ng-include=" 'svg/person' " />
      'svg/person': '<use xlink:href="/fonts/icons.svg#person" />',
    //~ <svg  xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" class="middle teal-fill fill-darken-3" style="height: 1rem;" ng-include=" 'svg/plus-square' " />
      'svg/plus-square': '<use xlink:href="/fonts/icons.svg#plus-square" />',
    //~ <svg  xmlns="http://www.w3.org/2000/svg" viewBox="0 0 26 26" class="middle teal-fill fill-darken-3" style="height: 1rem;" ng-include=" 'svg/plus-square заполнен' " />
      'svg/plus-square заполнен': '<use xlink:href="/fonts/icons.svg#plus-square заполнен" />',
    //~ <svg  xmlns="http://www.w3.org/2000/svg" viewBox="0 0 50 50" class="middle red-fill fill-darken-1" style="height: 2rem;" ng-include=" 'svg/left-clear-fill' " />
    //~ добавить в path transform="rotate(180, 25, 25)"
      'svg/left-clear-fill': '<use xlink:href="/fonts/icons.svg#left-clear-fill" />',
    //~ <svg  xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48" class="middle red-fill fill-darken-1" style="height: 2rem;" ng-include=" 'svg/arrow-left-up-round' " />
      'svg/arrow-left-up-round': '<use xlink:href="/fonts/icons.svg#arrow-left-up-round" />',
    //~ <svg  xmlns="http://www.w3.org/2000/svg" viewBox="0 0 50 50" class="middle teal-fill fill-darken-3" style="height: 2rem;" ng-include=" 'svg/wheel' " />
      'svg/wheel': '<use xlink:href="/fonts/icons.svg#wheel" />',
      //~ <svg  xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" class="middle teal-fill fill-darken-3" style="height: 2rem;" ng-include=" 'svg/filter' " />
      'svg/filter': '<use xlink:href="/fonts/icons.svg#filter" />',
      //~ <svg  xmlns="http://www.w3.org/2000/svg" viewBox="0 0 26 26" class="middle teal-fill fill-darken-3" style="height: 2rem;" ng-include=" 'svg/from-location' " />
      'svg/from-location': '<use xlink:href="/fonts/icons.svg#from-location" />',
      //~ <svg  xmlns="http://www.w3.org/2000/svg" viewBox="0 0 26 26" class="middle teal-fill fill-darken-3" style="height: 2rem;" ng-include=" 'svg/to-location' " />
      'svg/to-location': '<use xlink:href="/fonts/icons.svg#to-location" />',
      //~ <svg  xmlns="http://www.w3.org/2000/svg" viewBox="0 0 252 252" class="middle teal-fill fill-darken-3" style="height: 2rem;" ng-include=" 'svg/calc-done' " />
      'svg/calc-done': '<use xlink:href="/fonts/icons.svg#calc-done" />',
      //~ <svg  xmlns="http://www.w3.org/2000/svg" viewBox="0 0 50 50" class="middle teal-fill fill-darken-3" style="height: 2rem;" ng-include=" 'svg/checked1' " />
      'svg/checked1': '<use xlink:href="/fonts/icons.svg#checked1" />',
      //~ <svg  xmlns="http://www.w3.org/2000/svg" viewBox="0 0 50 50" class="middle teal-fill fill-darken-3" style="height: 2rem;" ng-include=" 'svg/break' " />
      // кружок перечеркнут как знак остановка запрещена
      'svg/break': '<use xlink:href="/fonts/icons.svg#break" />',
      //~ <svg  xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" class="middle teal-fill fill-darken-3" style="height: 2rem;" ng-include=" 'svg/backward-round' " />
      // загнутая стрелка назад влево
      'svg/backward-round': '<use xlink:href="/fonts/icons.svg#backward-round" />',
      //~ <svg  xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" class="middle teal-fill fill-darken-3" style="height: 2rem;" ng-include=" 'svg/save' " />
      // дискета
      'svg/save': '<use xlink:href="/fonts/icons.svg#save" />',
      //~ <svg  xmlns="http://www.w3.org/2000/svg" viewBox="0 0 50 50" class="middle teal-fill fill-darken-3" style="height: 2rem;" ng-include=" 'svg/!sign-round-fill' " />
      'svg/!sign-round-fill': '<use xlink:href="/fonts/icons.svg#!sign-round-fill" />',
      //~ <svg  xmlns="http://www.w3.org/2000/svg" viewBox="0 0 50 50" class="middle teal-fill fill-darken-3" style="height: 2rem;" ng-include=" 'svg/sigma' " />
      'svg/sigma': '<use xlink:href="/fonts/icons.svg#sigma" />',
      //~ 'svg/': '', // вставлять path или g
    };
    angular.forEach(data, function(val, key) {
      $templateCache.put(key, val);
    });
    
  });
  
})();