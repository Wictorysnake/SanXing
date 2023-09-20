<!--
 * @Author: wictory
 * @Date: 2023-09-20 14:31:26
 * @LastEditors: wictory
 * @LastEditTime: 2023-09-20 14:40:05
 * @Description: file content
-->

# var let const 的区别及使用场景

首先 3 个都是 js 声明变量所用。

## var

var 所声明的变量，作用域为该语句所在的函数内，且存在变量提升现象。

```js
console.log(a) // undefined
var a = 1

for (var i = 0; i < 10; i++) {
  setTimeout(() => {
    console.log(i) // 10 个 10
  }, 0)
}

console.log(i) // 10
```

后面声明的变量会覆盖前面声明的变量。

```js
var a = 1
var a = 2
console.log(a) // 2
```

## let

let 所声明的变量，只在 let 命令所在的代码块内有效，不存在变量提升。

```js
console.log(a) // ReferenceError: a is not defined
let a = 1

for (let i = 0; i < 10; i++) {
  setTimeout(() => {
    console.log(i) // 0 1 2 3 4 5 6 7 8 9
  }, 0)
}

console.log(i) // ReferenceError: i is not defined
```

不允许重复声明。

```js
let a = 1
let a = 2 // SyntaxError: Identifier 'a' has already been declared
```

## const

const 包含 let 所有特性，区别是 const 声明的变量是一个只读的不可修改的常量，一旦声明，常量的值就不能改变。

> 这里注意，const 保证的不是所声明的值不得改动，而是变量指向的内存不可改动。

```js
const a = 1
a = 2 // TypeError: Assignment to constant variable.

const a = {
  name: "wictory",
}

a.name = "wictory1"
console.log(a) // { name: 'wictory1' }

a = {} // TypeError: Assignment to constant variable.
```

## 总结

使用 var 声明的变量，其作用域为该语句所在的函数内，且存在变量提升现象，后面的覆盖前面的。
使用 let 声明的变量，其作用域为该语句所在的代码块内，不存在变量提升，不允许重复声明。
使用 const 声明的是一个只读的常量，其作用域为该语句所在的代码块内，不存在变量提升，不允许重复声明。
