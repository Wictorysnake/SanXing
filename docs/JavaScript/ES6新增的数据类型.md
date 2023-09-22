<!--
 * @Author: wictory
 * @Date: 2023-09-22 15:18:01
 * @LastEditors: wictory
 * @LastEditTime: 2023-09-22 15:29:09
 * @Description: file content
-->

# ES6 新增的数据类型有哪些？使用场景

## 新增的数据类型

- Symbol

ES6 中新增一种原始数据类型 Symbol，表示独一无二的值，是 JavaScript 语言的第七种数据类型。最大的特点是唯一性，Symbol 通过 Symbol 函数生成，在 ES5 中对象的属性都是字符串，我们使用他人定义的对象，然后去新增自己的属性，这样容易起冲突覆盖原有的属性， Symbol 也可以看成为一个字符串，不过这个字符串能保证是独一无二的。

```js
let s = Symbol()
console.log(typeof s) // symbol

let s1 = Symbol("foo")
let s2 = Symbol("bar")
console.log(s1) // Symbol(foo)
console.log(s2) // Symbol(bar)
```

## Symbol 用法

- 作为属性名的 Symbol

```js
let mySymbol = Symbol()
let a = {}
a[mySymbol] = "Hello!"
console.log(a[mySymbol]) // Hello!
```

- 作为常量

```js
const COLOR_RED = Symbol()
const COLOR_GREEN = Symbol()
function getComplement(color) {
  switch (color) {
    case COLOR_RED:
      return COLOR_GREEN
    case COLOR_GREEN:
      return COLOR_RED
    default:
      throw new Error("Undefined color")
  }
}
```

- 消除魔术字符串

```js
const shapeType = {
  triangle: Symbol(),
}
function getArea(shape, options) {
  let area = 0
  switch (shape) {
    case shapeType.triangle:
      area = 0.5 * options.width * options.height
      break
  }
  return area
}
getArea(shapeType.triangle, { width: 100, height: 100 })
```

Symbol 作为属性名，该属性不会出现在 for...in、for...of 循环中，也不会被 Object.keys()、Object.getOwnPropertyNames()、JSON.stringify() 返回，但是它也不是私有属性，有一个 Object.getOwnPropertySymbols 方法，可以获取指定对象的所有 Symbol 属性名。

```js
const attrs = Object.getOwnPropertySymbols(shapeType)
// [Symbol()]
```

## Symbol.for

Symbol.for()方法接受一个字符串作为参数，然后搜索有没有以该参数作为名称的 Symbol 值。如果有，就返回这个 Symbol 值，否则就新建并返回一个以该字符串为名称的 Symbol 值。

```js
let s1 = Symbol.for("foo")
let s2 = Symbol.for("foo")
console.log(s1 === s2) // true
```

## Symbol.keyFor

Symbol.keyFor()方法返回一个已登记的 Symbol 类型值的 key。

```js
let s1 = Symbol.for("foo")
console.log(Symbol.keyFor(s1)) // foo
```

## 总结

Symbol 的特点：

- 独一无二
- 不能隐式转换
- 不能与其他数据类型做运算
- 不能使用点运算符进行操作
