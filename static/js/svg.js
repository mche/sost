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
      'svg/truck': '<path style=" " d="M 2.84375 13 C 1.273438 13 0 14.277344 0 15.84375 L 0 42 C 0 43.566406 1.429688 45 3 45 L 7.09375 45 C 7.570313 47.835938 10.03125 50 13 50 C 15.96875 50 18.429688 47.835938 18.90625 45 L 28.15625 45 C 29.722656 45 31 43.722656 31 42.15625 L 31 15.90625 C 31 14.304688 29.738281 13 28.1875 13 Z M 33 20 L 33 45 C 33.480469 47.832031 36.03125 50 39 50 C 41.96875 50 44.429688 47.832031 44.90625 45 L 47 45 C 48.570313 45 50 43.570313 50 42 L 50 32.375 C 50 30.363281 48.550781 28.308594 48.375 28.0625 L 44.21875 22.5 C 43.265625 21.351563 41.769531 20 40 20 Z M 38 25 L 43.59375 25 L 46.78125 29.25 C 47.121094 29.730469 48 31.203125 48 32.375 L 48 33 L 38 33 C 37 33 36 32 36 31 L 36 27 C 36 25.894531 37 25 38 25 Z M 13 40 C 15.207031 40 17 41.792969 17 44 C 17 46.207031 15.207031 48 13 48 C 10.792969 48 9 46.207031 9 44 C 9 41.792969 10.792969 40 13 40 Z M 39 40 C 41.207031 40 43 41.792969 43 44 C 43 46.207031 41.207031 48 39 48 C 36.792969 48 35 46.207031 35 44 C 35 41.792969 36.792969 40 39 40 Z "></path>',
      'svg/copy': '<path d="M 11 2 C 9.895 2 9 2.895 9 4 L 9 20 C 9 21.105 9.895 22 11 22 L 24 22 C 25.105 22 26 21.105 26 20 L 26 8.5 C 26 8.235 25.895031 7.9809687 25.707031 7.7929688 L 20.207031 2.2929688 C 20.019031 2.1049687 19.765 2 19.5 2 L 11 2 z M 19 3.9042969 L 24.095703 9 L 20 9 C 19.448 9 19 8.552 19 8 L 19 3.9042969 z M 6 7 C 4.895 7 4 7.895 4 9 L 4 25 C 4 26.105 4.895 27 6 27 L 19 27 C 20.105 27 21 26.105 21 25 L 21 24 L 11 24 C 8.794 24 7 22.206 7 20 L 7 7 L 6 7 z"></path>',
      'svg/рабочий': '<path style=" " d="M 25.5 0 C 22.46875 0 20 2.46875 20 5.5 C 20 8.535156 22.46875 11 25.5 11 C 28.535156 11 31 8.535156 31 5.5 C 31 2.46875 28.535156 0 25.5 0 Z M 18.0625 10.21875 C 18.0625 10.21875 11.574219 10.554688 10.96875 10.59375 C 10.363281 10.632813 10.035156 10.746094 9.6875 11.09375 C 9.328125 11.453125 2.9375 18.40625 2.9375 18.40625 C 1.789063 19.636719 2.628906 20.695313 3.125 20.9375 C 3.402344 21.074219 3.742188 21.195313 4.125 21.1875 C 4.136719 21.191406 4.144531 21.179688 4.15625 21.1875 L 8.03125 23.15625 C 8.183594 22.832031 8.34375 22.539063 8.5 22.28125 C 8.5 22.28125 8.703125 21.976563 9.0625 21.46875 L 6.25 20.03125 L 11.03125 15.28125 L 13.40625 15.15625 C 12.203125 17.019531 10.082031 20.03125 9.0625 21.46875 L 18.3125 26.0625 L 22.0625 20.375 C 22.84375 23.519531 24.28125 29.402344 24.625 30.5625 C 25.066406 32.058594 25.824219 33.03125 27 32.78125 C 28.179688 32.53125 28.46875 31.878906 28.15625 30.5625 C 27.78125 28.976563 25.59375 16.5 25.59375 16.5 C 25.46875 15.800781 25.207031 15.199219 24.84375 14.78125 L 24.84375 14.75 C 24.84375 14.75 24.039063 13.640625 21.78125 12.09375 C 19.523438 10.546875 18.703125 10.21875 18.125 10.21875 C 18.117188 10.21875 18.105469 10.25 18.09375 10.25 C 18.078125 10.246094 18.078125 10.21875 18.0625 10.21875 Z M 18.3125 26.0625 L 17.75 26.90625 L 17.3125 27.8125 L 22.5 30.40625 C 22.332031 29.777344 22.101563 28.871094 21.84375 27.84375 Z M 17.3125 27.8125 L 8.03125 23.15625 C 7.5625 24.140625 7.144531 25.3125 7 25.78125 C 6.808594 26.40625 1.390625 44.652344 1.21875 45.3125 C 1.046875 45.976563 0.652344 48.136719 2.6875 48.84375 C 4.851563 49.59375 5.5 46.96875 5.5 46.96875 L 11.21875 31.875 L 16.4375 36.71875 L 17.65625 46.5625 C 17.65625 46.5625 17.734375 49 19.6875 49 C 21.640625 49 21.65625 47.730469 21.65625 46.125 C 21.65625 44.6875 21.339844 37.980469 21.3125 37.40625 C 21.285156 36.832031 21.074219 36.117188 20.84375 35.71875 C 20.296875 34.78125 16.90625 28.625 16.90625 28.625 Z M 39.15625 30 C 37.644531 30 36.855469 30.550781 34.625 34.25 L 30.21875 32.03125 C 30.15625 32.429688 30.027344 32.828125 29.78125 33.21875 C 29.644531 33.433594 29.464844 33.640625 29.28125 33.8125 L 33.59375 35.9375 C 32.519531 37.59375 31.855469 38.0625 31.5 38.0625 C 30.910156 38.0625 29.113281 38.046875 28.375 39.65625 C 27.835938 40.824219 24.128906 48.484375 24.09375 48.5625 C 23.945313 48.875 23.972656 49.238281 24.15625 49.53125 C 24.339844 49.820313 24.65625 50 25 50 L 49 50 C 49.34375 50 49.660156 49.820313 49.84375 49.53125 C 50.027344 49.242188 50.050781 48.871094 49.90625 48.5625 C 49.839844 48.421875 43.242188 34.457031 42.59375 32.9375 C 41.765625 30.992188 40.609375 30 39.15625 30 Z "></path>',
    
      'svg/внимание/время': '<path style=" " d="M 15 0 C 6.753906 0 0 6.753906 0 15 C 0 23.246094 6.753906 30 15 30 C 15.796875 30 16.628906 29.882813 17.34375 29.78125 C 17.726563 29.769531 18.066406 29.539063 18.222656 29.1875 C 18.378906 28.835938 18.320313 28.429688 18.074219 28.136719 C 17.824219 27.84375 17.433594 27.71875 17.0625 27.8125 C 16.375 27.910156 15.605469 28 15 28 C 7.84375 28 2 22.15625 2 15 C 2 7.84375 7.84375 2 15 2 C 20.855469 2 25.863281 5.90625 27.4375 11.28125 C 27.59375 11.816406 28.152344 12.125 28.6875 11.96875 C 29.222656 11.8125 29.53125 11.253906 29.375 10.71875 C 27.550781 4.496094 21.746094 0 15 0 Z M 14.90625 4.96875 C 14.863281 4.976563 14.820313 4.988281 14.78125 5 C 14.316406 5.105469 13.988281 5.523438 14 6 L 14 13.5 C 13.519531 13.824219 13.1875 14.378906 13.1875 15 C 13.1875 15.105469 13.234375 15.214844 13.25 15.3125 L 9.59375 19 C 9.296875 19.242188 9.160156 19.628906 9.246094 20.003906 C 9.332031 20.375 9.625 20.667969 9.996094 20.753906 C 10.371094 20.839844 10.757813 20.703125 11 20.40625 L 14.6875 16.75 C 14.785156 16.765625 14.894531 16.8125 15 16.8125 C 15.992188 16.8125 16.8125 15.992188 16.8125 15 C 16.8125 14.378906 16.480469 13.824219 16 13.5 L 16 6 C 16.011719 5.710938 15.894531 5.433594 15.6875 5.238281 C 15.476563 5.039063 15.191406 4.941406 14.90625 4.96875 Z M 29.5 14.25 C 29.15625 14.25 28.804688 14.378906 28.625 14.6875 L 9.125 48.5 C 8.945313 48.808594 8.945313 49.191406 9.125 49.5 C 9.304688 49.808594 9.644531 50 10 50 L 49 50 C 49.007813 50 49.023438 50 49.03125 50 C 49.585938 50 50.03125 49.554688 50.03125 49 C 50.03125 48.75 49.933594 48.519531 49.78125 48.34375 L 30.375 14.6875 C 30.195313 14.378906 29.84375 14.25 29.5 14.25 Z M 28.5 27 L 30.40625 27 C 30.605469 27 30.6875 27.113281 30.6875 27.3125 L 30.6875 38.6875 C 30.6875 38.886719 30.605469 39 30.40625 39 L 28.5 39 C 28.300781 39 28.1875 38.886719 28.1875 38.6875 L 28.1875 27.3125 C 28.1875 27.113281 28.300781 27 28.5 27 Z M 28.5 41.3125 L 30.5 41.3125 C 30.699219 41.3125 30.8125 41.394531 30.8125 41.59375 L 30.8125 43.6875 C 30.8125 43.886719 30.699219 44 30.5 44 L 28.5 44 C 28.300781 44 28.1875 43.886719 28.1875 43.6875 L 28.1875 41.59375 C 28.1875 41.394531 28.300781 41.3125 28.5 41.3125 Z "></path>',
      'svg/ms-word': '<path style=" " d="M 28.875 0 C 28.855469 0.0078125 28.832031 0.0195313 28.8125 0.03125 L 0.8125 5.34375 C 0.335938 5.433594 -0.0078125 5.855469 0 6.34375 L 0 43.65625 C -0.0078125 44.144531 0.335938 44.566406 0.8125 44.65625 L 28.8125 49.96875 C 29.101563 50.023438 29.402344 49.949219 29.632813 49.761719 C 29.859375 49.574219 29.996094 49.296875 30 49 L 30 44 L 47 44 C 48.09375 44 49 43.09375 49 42 L 49 8 C 49 6.90625 48.09375 6 47 6 L 30 6 L 30 1 C 30.003906 0.710938 29.878906 0.4375 29.664063 0.246094 C 29.449219 0.0546875 29.160156 -0.0351563 28.875 0 Z M 28 2.1875 L 28 6.6875 C 27.941406 6.882813 27.941406 7.085938 28 7.28125 L 28 42.8125 C 27.972656 42.945313 27.972656 43.085938 28 43.21875 L 28 47.8125 L 2 42.84375 L 2 7.15625 Z M 30 8 L 47 8 L 47 42 L 30 42 L 30 37 L 44 37 L 44 35 L 30 35 L 30 29 L 44 29 L 44 27 L 30 27 L 30 22 L 44 22 L 44 20 L 30 20 L 30 15 L 44 15 L 44 13 L 30 13 Z M 4.625 15.65625 L 8.4375 34.34375 L 12.1875 34.34375 L 14.65625 22.375 C 14.769531 21.824219 14.875 21.101563 14.9375 20.25 L 14.96875 20.25 C 14.996094 21.023438 15.058594 21.75 15.1875 22.375 L 17.59375 34.34375 L 21.21875 34.34375 L 25.0625 15.65625 L 21.75 15.65625 L 19.75 28.125 C 19.632813 28.828125 19.558594 29.53125 19.53125 30.21875 L 19.5 30.21875 C 19.433594 29.339844 19.367188 28.679688 19.28125 28.21875 L 16.90625 15.65625 L 13.40625 15.65625 L 10.78125 28.0625 C 10.613281 28.855469 10.496094 29.582031 10.46875 30.25 L 10.40625 30.25 C 10.367188 29.355469 10.308594 28.625 10.21875 28.09375 L 8.1875 15.65625 Z "></path>',
    //~ <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 26 26" class="middle grey-fill" style="height: 2rem;" ng-include=" 'svg/' " />
      'svg/начальная дата': '<path style=" " d="M 7 0 C 6.398438 0 6 0.398438 6 1 L 6 4 C 6 4.601563 6.398438 5 7 5 C 7.601563 5 8 4.601563 8 4 L 8 1 C 8 0.398438 7.601563 0 7 0 Z M 17 0 C 16.398438 0 16 0.398438 16 1 L 16 4 C 16 4.601563 16.398438 5 17 5 C 17.601563 5 18 4.601563 18 4 L 18 1 C 18 0.398438 17.601563 0 17 0 Z M 3 2 C 1.300781 2 0 3.300781 0 5 L 0 22 C 0 23.699219 1.300781 25 3 25 L 21 25 C 22.699219 25 24 23.699219 24 22 L 24 19.90625 L 22 21.8125 L 22 22 C 22 22.601563 21.601563 23 21 23 L 3 23 C 2.398438 23 2 22.601563 2 22 L 2 8 L 22 8 L 22 9.1875 L 24 11 L 24 5 C 24 3.300781 22.699219 2 21 2 L 19 2 L 19 4 C 19 5.101563 18.101563 6 17 6 C 15.898438 6 15 5.101563 15 4 L 15 2 L 9 2 L 9 4 C 9 5.101563 8.101563 6 7 6 C 5.898438 6 5 5.101563 5 4 L 5 2 Z M 19.84375 10.0625 C 19.5625 10.039063 19 10.117188 19 11.09375 L 19 13 L 14 13 C 13.398438 13 13 13.398438 13 14 L 13 17 C 13 17.601563 13.398438 18 14 18 L 19 18 L 19 19.90625 C 19 21.207031 20 20.90625 20 20.90625 L 25.90625 15.5 L 20 10.09375 C 20 10.09375 19.9375 10.070313 19.84375 10.0625 Z "></path>',
      'svg/конечная дата': '<path style=" " d="M 9 0 C 8.398438 0 8 0.398438 8 1 L 8 4 C 8 4.601563 8.398438 5 9 5 C 9.601563 5 10 4.601563 10 4 L 10 1 C 10 0.398438 9.601563 0 9 0 Z M 19 0 C 18.398438 0 18 0.398438 18 1 L 18 4 C 18 4.601563 18.398438 5 19 5 C 19.601563 5 20 4.601563 20 4 L 20 1 C 20 0.398438 19.601563 0 19 0 Z M 5 2 C 3.300781 2 2 3.300781 2 5 L 2 11 L 4 11 L 4 8 L 24 8 L 24 22 C 24 22.601563 23.601563 23 23 23 L 5 23 C 4.398438 23 4 22.601563 4 22 L 4 20 L 2 20 L 2 22 C 2 23.699219 3.300781 25 5 25 L 23 25 C 24.699219 25 26 23.699219 26 22 L 26 5 C 26 3.300781 24.699219 2 23 2 L 21 2 L 21 4 C 21 5.101563 20.101563 6 19 6 C 17.898438 6 17 5.101563 17 4 L 17 2 L 11 2 L 11 4 C 11 5.101563 10.101563 6 9 6 C 7.898438 6 7 5.101563 7 4 L 7 2 Z M 6.84375 10.0625 C 6.5625 10.039063 6 10.117188 6 11.09375 L 6 13 L 1 13 C 0.398438 13 0 13.398438 0 14 L 0 17 C 0 17.601563 0.398438 18 1 18 L 6 18 L 6 19.90625 C 6 21.207031 7 20.90625 7 20.90625 L 12.90625 15.5 L 7 10.09375 C 7 10.09375 6.9375 10.070313 6.84375 10.0625 Z "></path>',
    //<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" class="middle blue-fill" style="height: 2rem;" ng-include=" 'svg/событие принято' " />
      'svg/событие принято': '<path style=" " d="M 5 2 L 5 4 L 4 4 C 2.894531 4 2 4.894531 2 6 L 2 17 C 2 18.105469 2.894531 19 4 19 L 11.34375 19 C 11.121094 18.375 11 17.703125 11 17 L 4 17 L 4 8 L 16 8 L 16 11.09375 C 16.324219 11.039063 16.660156 11 17 11 C 17.339844 11 17.675781 11.039063 18 11.09375 L 18 6 C 18 4.894531 17.105469 4 16 4 L 15 4 L 15 2 L 13 2 L 13 4 L 7 4 L 7 2 Z M 10 9.25 L 9.15625 11.21875 L 7 11.40625 L 8.625 12.84375 L 8.15625 14.9375 L 10 13.8125 L 11.84375 14.9375 L 11.375 12.84375 L 13 11.40625 L 10.84375 11.21875 Z M 17 12 C 14.238281 12 12 14.238281 12 17 C 12 19.761719 14.238281 22 17 22 C 19.761719 22 22 19.761719 22 17 C 22 14.238281 19.761719 12 17 12 Z M 19.125 14.0625 L 20.53125 15.46875 L 16 20 L 13 17 L 14.40625 15.59375 L 16 17.1875 Z "></path>',
    //~ <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" class="middle blue-fill" style="height: 2rem;" ng-include=" 'svg/повторить' " />
      'svg/повторить': '<path style=" " d="M 17 1.875 L 17 5 L 9 5 C 4.054688 5 0 9.054688 0 14 C 0 18.945313 4.054688 23 9 23 L 24 23 L 24 19 L 9 19 C 6.214844 19 4 16.785156 4 14 C 4 11.214844 6.214844 9 9 9 L 17 9 L 17 12.125 L 24 7 Z "></path>',
    //~ <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 50 50" class="middle blue-fill" style="height: 2rem;" ng-include=" 'svg/туда-обратно' " />
      'svg/туда-обратно': '<path style=" " d="M 8.96875 6.972656 C 8.355469 6.980469 7.777344 7.273438 7.40625 7.765625 L 2.585938 12.585938 C 2.0625 13.085938 1.851563 13.832031 2.035156 14.535156 C 2.21875 15.234375 2.765625 15.78125 3.464844 15.964844 C 4.167969 16.148438 4.914063 15.9375 5.414063 15.414063 L 7 13.828125 L 7 31 C 7 36.492188 11.507813 41 17 41 C 22.492188 41 27 36.492188 27 31 L 27 19 C 27 15.691406 29.691406 13 33 13 C 36.308594 13 39 15.691406 39 19 L 39 36.195313 L 37.425781 34.59375 C 37.050781 34.207031 36.535156 33.984375 35.996094 33.980469 C 35.179688 33.972656 34.445313 34.460938 34.132813 35.214844 C 33.820313 35.964844 33.996094 36.832031 34.574219 37.40625 L 39.574219 42.480469 C 39.949219 42.863281 40.464844 43.078125 41 43.078125 C 41.535156 43.078125 42.050781 42.863281 42.425781 42.480469 L 47.425781 37.40625 C 48.203125 36.617188 48.191406 35.351563 47.40625 34.574219 C 46.617188 33.796875 45.351563 33.808594 44.574219 34.59375 L 43 36.195313 L 43 19 C 43 13.507813 38.492188 9 33 9 C 32.753906 9.003906 32.507813 9.054688 32.277344 9.148438 C 27.136719 9.539063 23 13.765625 23 19 L 23 31 C 23 34.308594 20.308594 37 17 37 C 13.691406 37 11 34.308594 11 31 L 11 13.828125 L 12.585938 15.414063 C 13.085938 15.9375 13.832031 16.148438 14.535156 15.964844 C 15.234375 15.78125 15.78125 15.234375 15.964844 14.535156 C 16.148438 13.832031 15.9375 13.085938 15.414063 12.585938 L 10.585938 7.757813 C 10.203125 7.253906 9.601563 6.964844 8.96875 6.972656 Z "></path>',
    //~ <svg  xmlns="http://www.w3.org/2000/svg" viewBox="0 0 50 50" class="middle teal-fill fill-darken-3" style="height: 2rem; position: absolute; top:0; left:0;" ng-include=" 'svg/вправо-вниз' " />
      'svg/вправо-вниз': '<path style=" " d="M 28 46.410156 L 28 35.988281 C 19.636719 35.796875 12.960938 33.171875 8.136719 28.179688 C -0.359375 19.386719 -0.0195313 6.507813 0 5.964844 L 1.996094 5.925781 C 2.054688 6.652344 3.628906 23.542969 28 23.992188 L 28 13.589844 L 49.65625 30 Z "></path>',
    //~ <svg  xmlns="http://www.w3.org/2000/svg" viewBox="0 0 50 50" class="middle teal-fill fill-darken-3" style="height: 2rem;" ng-include=" 'svg/тачка' " />
      'svg/тачка': '<path style=" " d="M 28.84375 13.25 C 26.160156 13.25 23.789063 14.851563 22.71875 17.28125 C 22.070313 17.355469 21.335938 17.585938 20.71875 18 L 45.03125 18 C 44.136719 16.925781 42.792969 16.375 41.4375 16.375 C 41.304688 16.375 41.164063 16.359375 41.03125 16.375 C 40.386719 15.292969 39.207031 14.59375 37.90625 14.59375 C 37.195313 14.59375 36.519531 14.808594 35.9375 15.1875 C 35.011719 14.71875 34.027344 14.480469 32.90625 14.625 C 31.726563 13.726563 30.300781 13.25 28.84375 13.25 Z M 1 20 C 0.449219 20 0 20.449219 0 21 C 0 21.550781 0.449219 22 1 22 L 8.59375 22 L 17.625 30.34375 L 15.8125 25.90625 L 9.6875 20.28125 C 9.503906 20.109375 9.25 20 9 20 Z M 17 20 C 16.664063 20 16.34375 20.160156 16.15625 20.4375 C 15.96875 20.714844 15.933594 21.066406 16.0625 21.375 L 21.0625 33.375 C 21.1875 33.679688 21.460938 33.902344 21.78125 33.96875 L 35.46875 36.90625 L 37.5625 39.3125 C 36.597656 40.445313 36 41.902344 36 43.5 C 36 47.078125 38.921875 50 42.5 50 C 46.078125 50 49 47.078125 49 43.5 C 49 39.921875 46.078125 37 42.5 37 C 41.238281 37 40.0625 37.371094 39.0625 38 L 37.3125 36 L 49.75 21.65625 C 50.007813 21.359375 50.070313 20.949219 49.90625 20.59375 C 49.746094 20.238281 49.390625 20 49 20 Z M 21.71875 36 C 22.09375 37.519531 22.550781 39.382813 22.9375 40.875 C 23.339844 42.429688 24.246094 43.511719 25.46875 43.90625 C 25.796875 44.011719 26.125 44.0625 26.46875 44.0625 C 27.417969 44.0625 28.414063 43.675781 29.34375 42.90625 C 31.441406 41.171875 33.117188 39.75 34.34375 38.71875 L 31.875 38.1875 C 30.820313 39.070313 29.542969 40.117188 28.0625 41.34375 C 27.339844 41.941406 26.625 42.179688 26.0625 42 C 25.511719 41.824219 25.101563 41.242188 24.875 40.375 C 24.566406 39.1875 24.195313 37.769531 23.875 36.46875 Z M 42.5 39 C 44.996094 39 47 41.003906 47 43.5 C 47 45.996094 44.996094 48 42.5 48 C 40.003906 48 38 45.996094 38 43.5 C 38 42.5 38.328125 41.589844 38.875 40.84375 L 41.75 44.15625 C 41.972656 44.460938 42.347656 44.613281 42.722656 44.550781 C 43.09375 44.488281 43.398438 44.21875 43.511719 43.859375 C 43.621094 43.5 43.519531 43.105469 43.25 42.84375 L 40.375 39.53125 C 41.007813 39.191406 41.726563 39 42.5 39 Z "></path>',
    //~ <svg  xmlns="http://www.w3.org/2000/svg" viewBox="0 0 50 50" class="middle teal-fill fill-darken-3" style="height: 2rem;" ng-include=" 'svg/водитель' " />
      'svg/водитель': '<path style=" " d="M 25 0 C 20.039063 0 16 4.484375 16 10 C 16 15.515625 20.039063 20 25 20 C 29.964844 20 34 15.515625 34 10 C 34 4.484375 29.964844 0 25 0 Z M 25 21.0625 C 19.832031 21.0625 16.03125 21.699219 12.28125 23.15625 C 10.730469 23.757813 9.78125 25.289063 8.6875 27.0625 C 8.4375 27.464844 8.183594 27.882813 7.90625 28.3125 C 7.488281 28.953125 7.015625 29.683594 6.5 30.46875 C 4.378906 33.703125 1.75 37.714844 0.84375 39.46875 C -0.125 41.347656 -0.179688 42.855469 0.65625 44.46875 C 1.320313 45.757813 2.246094 47.441406 3.40625 49.46875 L 3.71875 50 L 10 50 L 10 49 C 10 41.820313 16.714844 36 25 36 C 33.285156 36 40 41.820313 40 49 L 40 50 L 46.28125 50 L 46.59375 49.46875 C 47.746094 47.457031 48.667969 45.773438 49.34375 44.46875 C 50.179688 42.855469 50.125 41.347656 49.15625 39.46875 C 48.511719 38.222656 46.960938 35.867188 45.3125 33.34375 C 44.121094 31.515625 42.886719 29.625 42.125 28.34375 L 41.6875 27.625 C 40.472656 25.554688 39.449219 23.746094 37.71875 23.125 C 34.265625 21.882813 30.765625 21.0625 25 21.0625 Z M 25 40 C 18.933594 40 14 44.058594 14 49 L 14 50 L 36 50 L 36 49 C 36 44.058594 31.0625 40 25 40 Z "></path>',
    //~ <svg  xmlns="http://www.w3.org/2000/svg" viewBox="0 0 50 50" class="middle teal-fill fill-darken-3" style="height: 2rem;" ng-include=" 'svg/person' " />
      'svg/person': '<path style=" " d="M 34.800781 33.800781 C 33.101563 33.101563 31 32.199219 31 31.5 L 31 27 C 33.5 25.101563 35 22.101563 35 19 L 35 13 C 35 7.5 30.5 3 25 3 C 19.5 3 15 7.5 15 13 L 15 19 C 15 22.101563 16.5 25.199219 19 27 L 19 31.5 C 19 32.101563 16.898438 33 15.199219 33.800781 C 11.101563 35.5 5 38.101563 5 45 L 5 46 L 45 46 L 45 45 C 45 38.101563 38.898438 35.5 34.800781 33.800781 Z "></path>',
    //~ <svg  xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" class="middle teal-fill fill-darken-3" style="height: 1rem;" ng-include=" 'svg/плюс в квадрате' " />
      'svg/плюс в квадрате': '<path style=" " d="M 5 2 C 3.347656 2 2 3.347656 2 5 L 2 19 C 2 20.652344 3.347656 22 5 22 L 19 22 C 20.652344 22 22 20.652344 22 19 L 22 5 C 22 3.347656 20.652344 2 19 2 Z M 5 4 L 19 4 C 19.550781 4 20 4.449219 20 5 L 20 19 C 20 19.550781 19.550781 20 19 20 L 5 20 C 4.449219 20 4 19.550781 4 19 L 4 5 C 4 4.449219 4.449219 4 5 4 Z M 11 6 L 11 11 L 6 11 L 6 13 L 11 13 L 11 18 L 13 18 L 13 13 L 18 13 L 18 11 L 13 11 L 13 6 Z "></path>',
    //~ <svg  xmlns="http://www.w3.org/2000/svg" viewBox="0 0 26 26" class="middle teal-fill fill-darken-3" style="height: 1rem;" ng-include=" 'svg/плюс в квадрате заполнен' " />
      'svg/плюс в квадрате заполнен': '<path style=" " d="M 19 3 L 7 3 C 4.800781 3 3 4.800781 3 7 L 3 19 C 3 21.199219 4.800781 23 7 23 L 19 23 C 21.199219 23 23 21.199219 23 19 L 23 7 C 23 4.800781 21.199219 3 19 3 Z M 19 14 L 14 14 L 14 19 L 12 19 L 12 14 L 7 14 L 7 12 L 12 12 L 12 7 L 14 7 L 14 12 L 19 12 Z "></path>',
    //~ <svg  xmlns="http://www.w3.org/2000/svg" viewBox="0 0 50 50" class="middle red-fill fill-darken-1" style="height: 2rem;" ng-include=" 'svg/стереть' " />
    //~ добавить в path transform="rotate(180, 25, 25)"
      'svg/стереть': '<path style=" " d="M 46 10 L 12.539063 10 L -0.316406 25 L 12.539063 40 L 46 40 C 48.207031 40 50 38.207031 50 36 L 50 14 C 50 11.792969 48.207031 10 46 10 Z M 34.707031 30.292969 L 33.292969 31.707031 L 28 26.414063 L 22.707031 31.707031 L 21.292969 30.292969 L 26.585938 25 L 21.292969 19.707031 L 22.707031 18.292969 L 28 23.585938 L 33.292969 18.292969 L 34.707031 19.707031 L 29.414063 25 Z "></path>',
    //~ <svg  xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48" class="middle red-fill fill-darken-1" style="height: 2rem;" ng-include=" 'svg/стрелка влево вверх полукруг' " />
      'svg/стрелка влево вверх полукруг': '<g><path style="" d="M 19 4 L 30.699219 18 L 7.300781 18 Z "></path><path style="" d="M 27 42 L 40 42 L 40 34 L 27 34 C 24.800781 34 23 32.199219 23 30 L 23 13 L 15 13 L 15 30 C 15 36.601563 20.398438 42 27 42 Z "></path></g>',
    //~ <svg  xmlns="http://www.w3.org/2000/svg" viewBox="0 0 50 50" class="middle teal-fill fill-darken-3" style="height: 2rem;" ng-include=" 'svg/колесо' " />
      'svg/колесо': '<path d="M 25 2 C 12.318 2 2 12.318 2 25 C 2 37.682 12.318 48 25 48 C 37.682 48 48 37.682 48 25 C 48 12.318 37.682 2 25 2 z M 24.998047 9 C 25.299824 9 25.594873 9.0283545 25.892578 9.0449219 C 25.867808 9.1408872 25.842172 9.2375964 25.847656 9.3417969 L 26.3125 18.449219 C 26.3345 18.856219 26.599422 19.20975 26.982422 19.34375 C 27.691422 19.59175 28.337297 19.963219 28.904297 20.449219 C 29.090297 20.608219 29.320688 20.691406 29.554688 20.691406 C 29.718688 20.691406 29.883203 20.650359 30.033203 20.568359 L 38.117188 16.167969 C 38.172517 16.137851 38.208677 16.089158 38.255859 16.050781 C 38.600697 16.559872 38.907898 17.094152 39.193359 17.642578 C 39.053736 17.664249 38.916031 17.710851 38.791016 17.794922 L 31.308594 22.800781 C 30.972594 23.025781 30.806766 23.429172 30.884766 23.826172 C 30.961766 24.215172 31 24.611 31 25 C 31 25.389 30.960813 25.784828 30.882812 26.173828 C 30.803812 26.569828 30.970688 26.972266 31.304688 27.197266 L 38.927734 32.328125 C 38.99973 32.376543 39.075808 32.40998 39.154297 32.4375 C 38.870539 32.975317 38.561756 33.49653 38.220703 33.996094 C 38.158522 33.936248 38.100732 33.871678 38.021484 33.828125 L 33.730469 31.466797 C 33.664469 31.426797 33.601297 31.380422 33.529297 31.357422 L 30.035156 29.433594 C 29.670156 29.231594 29.218344 29.279781 28.902344 29.550781 C 28.335344 30.036781 27.689469 30.410203 26.980469 30.658203 C 26.597469 30.792203 26.3325 31.144781 26.3125 31.550781 L 25.847656 40.615234 C 25.841626 40.734121 25.865782 40.847458 25.898438 40.955078 C 25.598815 40.971861 25.301796 41 24.998047 41 C 24.694628 41 24.398906 40.971829 24.099609 40.955078 C 24.131696 40.849416 24.155676 40.739529 24.150391 40.623047 L 23.742188 31.578125 C 23.724187 31.165125 23.456406 30.806828 23.066406 30.673828 C 22.324406 30.421828 21.646734 30.029766 21.052734 29.509766 C 20.738734 29.234766 20.286922 29.183813 19.919922 29.382812 L 11.697266 33.875 C 11.355136 33.363741 11.050081 32.827746 10.767578 32.277344 C 10.90933 32.256613 11.050099 32.215949 11.177734 32.130859 L 18.679688 27.128906 C 19.012687 26.905906 19.181422 26.505328 19.107422 26.111328 C 19.035422 25.730328 19 25.357 19 25 C 19 24.643 19.035422 24.269672 19.107422 23.888672 C 19.181422 23.494672 19.013687 23.094094 18.679688 22.871094 L 11.177734 17.876953 C 11.050413 17.792257 10.909474 17.745504 10.767578 17.724609 C 11.065466 17.144075 11.385922 16.577873 11.75 16.041016 C 11.838923 16.185323 11.951355 16.316103 12.111328 16.402344 L 19.921875 20.615234 C 20.070875 20.696234 20.234484 20.736328 20.396484 20.736328 C 20.633484 20.736328 20.867688 20.652281 21.054688 20.488281 C 21.647687 19.968281 22.324406 19.577219 23.066406 19.324219 C 23.455406 19.191219 23.724187 18.832875 23.742188 18.421875 L 24.152344 9.3359375 C 24.156977 9.2336369 24.131756 9.1391112 24.107422 9.0449219 C 24.404159 9.0284586 24.69726 9 24.998047 9 z M 22.152344 9.2675781 L 21.96875 13.390625 C 19.90775 13.925625 18.048297 14.993719 16.529297 16.511719 L 13.0625 14.640625 C 13.002898 14.608569 12.939145 14.603074 12.876953 14.583984 C 15.223455 11.856725 18.469082 9.9325147 22.152344 9.2675781 z M 27.847656 9.2695312 C 31.483771 9.9267197 34.690008 11.812101 37.029297 14.484375 L 33.412109 16.451172 C 31.923109 14.988172 30.067594 13.931391 28.058594 13.400391 L 27.847656 9.2695312 z M 39.964844 19.392578 C 40.622249 21.140718 41 23.024823 41 25 C 41 26.977996 40.622085 28.865013 39.962891 30.615234 L 36.529297 28.302734 C 36.835297 27.232734 37 26.126 37 25 C 37 23.878 36.839156 22.776938 36.535156 21.710938 L 39.902344 19.455078 C 39.927844 19.438023 39.941434 19.41149 39.964844 19.392578 z M 10.003906 19.476562 C 10.027992 19.496072 10.042063 19.523484 10.068359 19.541016 L 13.441406 21.787109 C 13.152406 22.829109 13 23.906 13 25 C 13 26.095 13.155312 27.171844 13.445312 28.214844 L 10.068359 30.466797 C 10.042859 30.483852 10.029275 30.51039 10.005859 30.529297 C 9.3672041 28.802932 9 26.945804 9 25 C 9 23.056369 9.3666108 21.20131 10.003906 19.476562 z M 25 21 C 22.794 21 21 22.794 21 25 C 21 27.206 22.794 29 25 29 C 27.206 29 29 27.206 29 25 C 29 22.794 27.206 21 25 21 z M 25 23 C 26.103 23 27 23.897 27 25 C 27 26.103 26.103 27 25 27 C 23.897 27 23 26.103 23 25 C 23 23.897 23.897 23 25 23 z M 16.523438 33.486328 C 18.029438 34.987328 19.917797 36.069469 21.966797 36.605469 L 22.152344 40.712891 C 22.152653 40.719798 22.155802 40.725554 22.15625 40.732422 C 18.498798 40.073058 15.274794 38.170748 12.931641 35.474609 L 16.523438 33.486328 z M 33.396484 33.564453 L 37 35.548828 C 34.661929 38.204959 31.465244 40.078951 27.841797 40.732422 C 27.842126 40.72751 27.845444 40.723682 27.845703 40.71875 L 28.056641 36.599609 C 30.058641 36.070609 31.910484 35.018453 33.396484 33.564453 z"></path>',
      'svg/lock': '<path style=" " d="M 16 0 C 13.789063 0 11.878906 0.917969 10.6875 2.40625 C 9.496094 3.894531 9 5.824219 9 7.90625 L 9 9 L 12 9 L 12 7.90625 C 12 6.328125 12.390625 5.085938 13.03125 4.28125 C 13.671875 3.476563 14.542969 3 16 3 C 17.460938 3 18.328125 3.449219 18.96875 4.25 C 19.609375 5.050781 20 6.308594 20 7.90625 L 20 9 L 23 9 L 23 7.90625 C 23 5.8125 22.472656 3.863281 21.28125 2.375 C 20.089844 0.886719 18.207031 0 16 0 Z M 9 10 C 7.34375 10 6 11.34375 6 13 L 6 23 C 6 24.65625 7.34375 26 9 26 L 23 26 C 24.65625 26 26 24.65625 26 23 L 26 13 C 26 11.34375 24.65625 10 23 10 Z M 16 15 C 17.105469 15 18 15.894531 18 17 C 18 17.738281 17.597656 18.371094 17 18.71875 L 17 21 C 17 21.550781 16.550781 22 16 22 C 15.449219 22 15 21.550781 15 21 L 15 18.71875 C 14.402344 18.371094 14 17.738281 14 17 C 14 15.894531 14.894531 15 16 15 Z "></path>',
      //~ <svg  xmlns="http://www.w3.org/2000/svg" viewBox="0 0 50 50" class="middle teal-fill fill-darken-3" style="height: 2rem;" ng-include=" 'svg/filter' " />
      'svg/filter': '<path style=" " d="M 4 2 C 3.398438 2 3 2.398438 3 3 L 3 6 C 3 6.300781 3.113281 6.488281 3.3125 6.6875 L 19.3125 23.6875 C 19.511719 23.886719 19.800781 24 20 24 L 30 24 C 30.300781 24 30.488281 23.886719 30.6875 23.6875 L 46.6875 6.6875 C 46.886719 6.488281 47 6.300781 47 6 L 47 3 C 47 2.398438 46.601563 2 46 2 Z M 19 26 L 19 41 C 19 41.398438 19.199219 41.707031 19.5 41.90625 L 29.5 47.90625 C 29.601563 48.007813 29.800781 48 30 48 C 30.199219 48 30.300781 48.007813 30.5 47.90625 C 30.800781 47.707031 31 47.398438 31 47 L 31 26 Z "></path>',
      //~ <svg  xmlns="http://www.w3.org/2000/svg" viewBox="0 0 26 26" class="middle teal-fill fill-darken-3" style="height: 2rem;" ng-include=" 'svg/откуда' " />
      'svg/откуда': '<path style=" " d="M 13 2 L 7 10 L 11 10 L 11 20 L 15 20 L 15 10 L 19 10 Z M 6.84375 16.28125 C 6.800781 16.289063 6.757813 16.300781 6.71875 16.3125 C 4.898438 16.625 3.367188 17.078125 2.1875 17.6875 C 1.597656 17.992188 1.082031 18.351563 0.6875 18.78125 C 0.292969 19.210938 0 19.773438 0 20.40625 C 0 21.355469 0.625 22.09375 1.375 22.625 C 2.125 23.15625 3.09375 23.5625 4.25 23.90625 C 6.558594 24.597656 9.621094 25 13 25 C 16.378906 25 19.441406 24.597656 21.75 23.90625 C 22.90625 23.5625 23.875 23.15625 24.625 22.625 C 25.375 22.09375 26 21.355469 26 20.40625 C 26 19.773438 25.710938 19.210938 25.3125 18.78125 C 24.914063 18.351563 24.410156 17.992188 23.8125 17.6875 C 22.621094 17.078125 21.027344 16.625 19.15625 16.3125 C 18.789063 16.222656 18.40625 16.347656 18.160156 16.632813 C 17.914063 16.917969 17.851563 17.320313 17.996094 17.667969 C 18.140625 18.015625 18.46875 18.253906 18.84375 18.28125 C 20.574219 18.570313 22 19.003906 22.90625 19.46875 C 23.359375 19.699219 23.679688 19.945313 23.84375 20.125 C 24.007813 20.304688 24 20.390625 24 20.40625 C 24 20.457031 23.9375 20.667969 23.46875 21 C 23 21.332031 22.207031 21.695313 21.1875 22 C 19.144531 22.609375 16.21875 23 13 23 C 9.78125 23 6.855469 22.609375 4.8125 22 C 3.792969 21.695313 3 21.332031 2.53125 21 C 2.0625 20.667969 2 20.457031 2 20.40625 C 2 20.390625 1.992188 20.304688 2.15625 20.125 C 2.320313 19.945313 2.644531 19.699219 3.09375 19.46875 C 3.988281 19.003906 5.382813 18.570313 7.0625 18.28125 C 7.613281 18.222656 8.011719 17.722656 7.953125 17.171875 C 7.894531 16.621094 7.394531 16.222656 6.84375 16.28125 Z "></path>',
      //~ <svg  xmlns="http://www.w3.org/2000/svg" viewBox="0 0 26 26" class="middle teal-fill fill-darken-3" style="height: 2rem;" ng-include=" 'svg/куда' " />
      'svg/куда': '<path style=" " d="M 11 1 L 11 11 L 7 11 L 13 19 L 19 11 L 15 11 L 15 1 Z M 6.84375 16.28125 C 6.800781 16.289063 6.757813 16.300781 6.71875 16.3125 C 4.898438 16.625 3.367188 17.078125 2.1875 17.6875 C 1.597656 17.992188 1.082031 18.351563 0.6875 18.78125 C 0.292969 19.210938 0 19.773438 0 20.40625 C 0 21.355469 0.625 22.09375 1.375 22.625 C 2.125 23.15625 3.09375 23.5625 4.25 23.90625 C 6.558594 24.597656 9.621094 25 13 25 C 16.378906 25 19.441406 24.597656 21.75 23.90625 C 22.90625 23.5625 23.875 23.15625 24.625 22.625 C 25.375 22.09375 26 21.355469 26 20.40625 C 26 19.773438 25.710938 19.210938 25.3125 18.78125 C 24.914063 18.351563 24.410156 17.992188 23.8125 17.6875 C 22.621094 17.078125 21.027344 16.625 19.15625 16.3125 C 18.789063 16.222656 18.40625 16.347656 18.160156 16.632813 C 17.914063 16.917969 17.851563 17.320313 17.996094 17.667969 C 18.140625 18.015625 18.46875 18.253906 18.84375 18.28125 C 20.574219 18.570313 22 19.003906 22.90625 19.46875 C 23.359375 19.699219 23.679688 19.945313 23.84375 20.125 C 24.007813 20.304688 24 20.390625 24 20.40625 C 24 20.457031 23.9375 20.667969 23.46875 21 C 23 21.332031 22.207031 21.695313 21.1875 22 C 19.144531 22.609375 16.21875 23 13 23 C 9.78125 23 6.855469 22.609375 4.8125 22 C 3.792969 21.695313 3 21.332031 2.53125 21 C 2.0625 20.667969 2 20.457031 2 20.40625 C 2 20.390625 1.992188 20.304688 2.15625 20.125 C 2.320313 19.945313 2.644531 19.699219 3.09375 19.46875 C 3.988281 19.003906 5.382813 18.570313 7.0625 18.28125 C 7.613281 18.222656 8.011719 17.722656 7.953125 17.171875 C 7.894531 16.621094 7.394531 16.222656 6.84375 16.28125 Z "></path>',
      //~ 'svg/': '', // вставлять path или g
    };
    angular.forEach(data, function(val, key) {
      $templateCache.put(key, val);
    });
    
  });
  
})();