/**

Глобальный уникальный гененератор

var it = IdMaker();

console.log(it.next().value); // 0
console.log(it.next().value); // 1
console.log(it.next().value); // 2

Генераторы - это специальный тип функции, который работает как фабрика итераторов.

Функция становится генератором, если содержит один или более yield операторов и использует function* синтаксис.
https://developer.mozilla.org/ru/docs/Web/JavaScript/Guide/Iterators_and_Generators
**/

function* IdMaker(){
  var index = 0;
  while(true)
    yield index++;
}