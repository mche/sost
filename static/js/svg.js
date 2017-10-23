(function () {
  'use strict';
  /*
  отличный сайт SVG иконки https://icons8.com/icon/
  <svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" viewBox="0 0 50 50" version="1.1" style="height:2rem;" ng-include=" 'svg/truck' "></svg>
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 30 30"  ng-include=" 'svg/copy' " class="middle green-fill" style="height: 2rem;"></svg>
  
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
    $templateCache.put('svg/truck', '<g><path d="M 2.84375 13 C 1.285156 13 0 14.285156 0 15.84375 L 0 42 C 0 43.660156 1.339844 45 3 45 L 7.09375 45 C 7.570313 47.835938 10.035156 50 13 50 C 15.964844 50 18.429688 47.835938 18.90625 45 L 28.15625 45 C 28.894531 45 29.554688 44.6875 30.0625 44.21875 C 30.582031 44.675781 31.246094 44.992188 32 45 L 33.09375 45 C 33.570313 47.835938 36.035156 50 39 50 C 42.300781 50 45 47.300781 45 44 C 45 40.699219 42.300781 38 39 38 C 36.035156 38 33.570313 40.164063 33.09375 43 L 32 43 C 31.8125 43 31.527344 42.871094 31.3125 42.65625 C 31.097656 42.441406 31 42.183594 31 42 L 31 23 C 31 22.625 31.625 22 32 22 L 40 22 C 40.785156 22 41.890625 22.839844 42.65625 23.75 C 42.664063 23.761719 42.679688 23.769531 42.6875 23.78125 L 42.84375 24 L 38 24 C 36.40625 24 35 25.289063 35 27 L 35 31 C 35 31.832031 35.375 32.5625 35.90625 33.09375 C 36.4375 33.625 37.167969 34 38 34 L 48 34 L 48 42 C 48 42.375 47.375 43 47 43 L 45 43 L 45 45 L 47 45 C 48.660156 45 50 43.660156 50 42 L 50 32.375 C 50 30.085938 48.40625 28.0625 48.40625 28.0625 L 48.375 28.0625 L 44.25 22.5625 L 44.25 22.53125 L 44.21875 22.5 C 43.296875 21.386719 41.914063 20 40 20 L 32 20 C 31.644531 20 31.316406 20.074219 31 20.1875 L 31 15.90625 C 31 14.371094 29.789063 13 28.1875 13 Z M 2.84375 15 L 28.1875 15 C 28.617188 15 29 15.414063 29 15.90625 L 29 42.15625 C 29 42.625 28.628906 43 28.15625 43 L 18.90625 43 C 18.429688 40.164063 15.964844 38 13 38 C 10.035156 38 7.570313 40.164063 7.09375 43 L 3 43 C 2.625 43 2 42.371094 2 42 L 2 15.84375 C 2 15.375 2.367188 15 2.84375 15 Z M 38 26 L 44.34375 26 L 46.78125 29.25 C 46.78125 29.25 47.6875 30.800781 47.875 32 L 38 32 C 37.832031 32 37.5625 31.875 37.34375 31.65625 C 37.125 31.4375 37 31.167969 37 31 L 37 27 C 37 26.496094 37.59375 26 38 26 Z M 13 40 C 15.222656 40 17 41.777344 17 44 C 17 46.222656 15.222656 48 13 48 C 10.777344 48 9 46.222656 9 44 C 9 41.777344 10.777344 40 13 40 Z M 39 40 C 41.222656 40 43 41.777344 43 44 C 43 46.222656 41.222656 48 39 48 C 36.777344 48 35 46.222656 35 44 C 35 41.777344 36.777344 40 39 40 Z "></path></g>');
    $templateCache.put('svg/copy', '<path d="M 11 2 C 9.895 2 9 2.895 9 4 L 9 20 C 9 21.105 9.895 22 11 22 L 24 22 C 25.105 22 26 21.105 26 20 L 26 8.5 C 26 8.235 25.895031 7.9809687 25.707031 7.7929688 L 20.207031 2.2929688 C 20.019031 2.1049687 19.765 2 19.5 2 L 11 2 z M 19 3.9042969 L 24.095703 9 L 20 9 C 19.448 9 19 8.552 19 8 L 19 3.9042969 z M 6 7 C 4.895 7 4 7.895 4 9 L 4 25 C 4 26.105 4.895 27 6 27 L 19 27 C 20.105 27 21 26.105 21 25 L 21 24 L 11 24 C 8.794 24 7 22.206 7 20 L 7 7 L 6 7 z"></path>');
    $templateCache.put('svg/рабочий', '<path style=" " d="M 25.5 0 C 22.46875 0 20 2.46875 20 5.5 C 20 8.535156 22.46875 11 25.5 11 C 28.535156 11 31 8.535156 31 5.5 C 31 2.46875 28.535156 0 25.5 0 Z M 18.0625 10.21875 C 18.0625 10.21875 11.574219 10.554688 10.96875 10.59375 C 10.363281 10.632813 10.035156 10.746094 9.6875 11.09375 C 9.328125 11.453125 2.9375 18.40625 2.9375 18.40625 C 1.789063 19.636719 2.628906 20.695313 3.125 20.9375 C 3.402344 21.074219 3.742188 21.195313 4.125 21.1875 C 4.136719 21.191406 4.144531 21.179688 4.15625 21.1875 L 8.03125 23.15625 C 8.183594 22.832031 8.34375 22.539063 8.5 22.28125 C 8.5 22.28125 8.703125 21.976563 9.0625 21.46875 L 6.25 20.03125 L 11.03125 15.28125 L 13.40625 15.15625 C 12.203125 17.019531 10.082031 20.03125 9.0625 21.46875 L 18.3125 26.0625 L 22.0625 20.375 C 22.84375 23.519531 24.28125 29.402344 24.625 30.5625 C 25.066406 32.058594 25.824219 33.03125 27 32.78125 C 28.179688 32.53125 28.46875 31.878906 28.15625 30.5625 C 27.78125 28.976563 25.59375 16.5 25.59375 16.5 C 25.46875 15.800781 25.207031 15.199219 24.84375 14.78125 L 24.84375 14.75 C 24.84375 14.75 24.039063 13.640625 21.78125 12.09375 C 19.523438 10.546875 18.703125 10.21875 18.125 10.21875 C 18.117188 10.21875 18.105469 10.25 18.09375 10.25 C 18.078125 10.246094 18.078125 10.21875 18.0625 10.21875 Z M 18.3125 26.0625 L 17.75 26.90625 L 17.3125 27.8125 L 22.5 30.40625 C 22.332031 29.777344 22.101563 28.871094 21.84375 27.84375 Z M 17.3125 27.8125 L 8.03125 23.15625 C 7.5625 24.140625 7.144531 25.3125 7 25.78125 C 6.808594 26.40625 1.390625 44.652344 1.21875 45.3125 C 1.046875 45.976563 0.652344 48.136719 2.6875 48.84375 C 4.851563 49.59375 5.5 46.96875 5.5 46.96875 L 11.21875 31.875 L 16.4375 36.71875 L 17.65625 46.5625 C 17.65625 46.5625 17.734375 49 19.6875 49 C 21.640625 49 21.65625 47.730469 21.65625 46.125 C 21.65625 44.6875 21.339844 37.980469 21.3125 37.40625 C 21.285156 36.832031 21.074219 36.117188 20.84375 35.71875 C 20.296875 34.78125 16.90625 28.625 16.90625 28.625 Z M 39.15625 30 C 37.644531 30 36.855469 30.550781 34.625 34.25 L 30.21875 32.03125 C 30.15625 32.429688 30.027344 32.828125 29.78125 33.21875 C 29.644531 33.433594 29.464844 33.640625 29.28125 33.8125 L 33.59375 35.9375 C 32.519531 37.59375 31.855469 38.0625 31.5 38.0625 C 30.910156 38.0625 29.113281 38.046875 28.375 39.65625 C 27.835938 40.824219 24.128906 48.484375 24.09375 48.5625 C 23.945313 48.875 23.972656 49.238281 24.15625 49.53125 C 24.339844 49.820313 24.65625 50 25 50 L 49 50 C 49.34375 50 49.660156 49.820313 49.84375 49.53125 C 50.027344 49.242188 50.050781 48.871094 49.90625 48.5625 C 49.839844 48.421875 43.242188 34.457031 42.59375 32.9375 C 41.765625 30.992188 40.609375 30 39.15625 30 Z "></path>');
    $templateCache.put('svg/вправо-вниз', '<path style=" " d="M 28 46.410156 L 28 35.988281 C 19.636719 35.796875 12.960938 33.171875 8.136719 28.179688 C -0.359375 19.386719 -0.0195313 6.507813 0 5.964844 L 1.996094 5.925781 C 2.054688 6.652344 3.628906 23.542969 28 23.992188 L 28 13.589844 L 49.65625 30 Z "></path>');
    $templateCache.put('svg/внимание/время', '<path style=" " d="M 15 0 C 6.753906 0 0 6.753906 0 15 C 0 23.246094 6.753906 30 15 30 C 15.796875 30 16.628906 29.882813 17.34375 29.78125 C 17.726563 29.769531 18.066406 29.539063 18.222656 29.1875 C 18.378906 28.835938 18.320313 28.429688 18.074219 28.136719 C 17.824219 27.84375 17.433594 27.71875 17.0625 27.8125 C 16.375 27.910156 15.605469 28 15 28 C 7.84375 28 2 22.15625 2 15 C 2 7.84375 7.84375 2 15 2 C 20.855469 2 25.863281 5.90625 27.4375 11.28125 C 27.59375 11.816406 28.152344 12.125 28.6875 11.96875 C 29.222656 11.8125 29.53125 11.253906 29.375 10.71875 C 27.550781 4.496094 21.746094 0 15 0 Z M 14.90625 4.96875 C 14.863281 4.976563 14.820313 4.988281 14.78125 5 C 14.316406 5.105469 13.988281 5.523438 14 6 L 14 13.5 C 13.519531 13.824219 13.1875 14.378906 13.1875 15 C 13.1875 15.105469 13.234375 15.214844 13.25 15.3125 L 9.59375 19 C 9.296875 19.242188 9.160156 19.628906 9.246094 20.003906 C 9.332031 20.375 9.625 20.667969 9.996094 20.753906 C 10.371094 20.839844 10.757813 20.703125 11 20.40625 L 14.6875 16.75 C 14.785156 16.765625 14.894531 16.8125 15 16.8125 C 15.992188 16.8125 16.8125 15.992188 16.8125 15 C 16.8125 14.378906 16.480469 13.824219 16 13.5 L 16 6 C 16.011719 5.710938 15.894531 5.433594 15.6875 5.238281 C 15.476563 5.039063 15.191406 4.941406 14.90625 4.96875 Z M 29.5 14.25 C 29.15625 14.25 28.804688 14.378906 28.625 14.6875 L 9.125 48.5 C 8.945313 48.808594 8.945313 49.191406 9.125 49.5 C 9.304688 49.808594 9.644531 50 10 50 L 49 50 C 49.007813 50 49.023438 50 49.03125 50 C 49.585938 50 50.03125 49.554688 50.03125 49 C 50.03125 48.75 49.933594 48.519531 49.78125 48.34375 L 30.375 14.6875 C 30.195313 14.378906 29.84375 14.25 29.5 14.25 Z M 28.5 27 L 30.40625 27 C 30.605469 27 30.6875 27.113281 30.6875 27.3125 L 30.6875 38.6875 C 30.6875 38.886719 30.605469 39 30.40625 39 L 28.5 39 C 28.300781 39 28.1875 38.886719 28.1875 38.6875 L 28.1875 27.3125 C 28.1875 27.113281 28.300781 27 28.5 27 Z M 28.5 41.3125 L 30.5 41.3125 C 30.699219 41.3125 30.8125 41.394531 30.8125 41.59375 L 30.8125 43.6875 C 30.8125 43.886719 30.699219 44 30.5 44 L 28.5 44 C 28.300781 44 28.1875 43.886719 28.1875 43.6875 L 28.1875 41.59375 C 28.1875 41.394531 28.300781 41.3125 28.5 41.3125 Z "></path>');
    $templateCache.put('svg/принтер', '<path style=" " d="M 9 0 L 9 14 L 3 14 C 1.300781 14 0 15.300781 0 17 L 0 38 C 0 39.699219 1.300781 41 3 41 L 9 41 L 9 50 L 41 50 L 41 41 L 47 41 C 48.699219 41 50 39.699219 50 38 L 50 17 C 50 15.300781 48.699219 14 47 14 L 41 14 L 41 0 Z M 11 2 L 39 2 L 39 14 L 11 14 Z M 43 19 C 44.101563 19 45 19.898438 45 21 C 45 22.101563 44.101563 23 43 23 C 41.898438 23 41 22.101563 41 21 C 41 19.898438 41.898438 19 43 19 Z M 11 30 L 39 30 L 39 48 L 11 48 Z M 15 34 C 14.398438 34 14 34.398438 14 35 C 14 35.601563 14.398438 36 15 36 L 35 36 C 35.601563 36 36 35.601563 36 35 C 36 34.398438 35.601563 34 35 34 Z M 15 38 C 14.398438 38 14 38.398438 14 39 C 14 39.601563 14.398438 40 15 40 L 31 40 C 31.601563 40 32 39.601563 32 39 C 32 38.398438 31.601563 38 31 38 Z M 15 42 C 14.398438 42 14 42.398438 14 43 C 14 43.601563 14.398438 44 15 44 L 35 44 C 35.601563 44 36 43.601563 36 43 C 36 42.398438 35.601563 42 35 42 Z "></path>');
  });
  
})();