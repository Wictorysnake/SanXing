<!--
 * @Author: wictory
 * @Date: 2023-09-19 17:07:06
 * @LastEditors: wictory
 * @LastEditTime: 2023-09-19 17:15:50
 * @Description: file content
-->

# Call、Apply、Bind 的使用与区别，如何实现一个 bind

## 相同点：

- 都是使用于方法借用及明确的 this 指向场景
- 第一个参数都是 this 指向的对象
- 都可以利用后续参数传参

## 不同点：

- 参数传递方式不同
- call，apply 是立即调用，bind 是动态调用（返回一个新函数）

## 基本使用：

```js
Array.prototype.slice.call(obj, 0, 1, 2)
Array.prototype.slice.apply(obj, [0, 1, 2])
Array.prototype.slice.bind(obj, 0, 1, 2)()
```

从上面的例子可以看出来 call, apply 使用上几乎保持一致，而 bind 实际上是返回了一个新函数。

## 实现 bind

```js
Function.prototype.bind = function (context) {
  var self = this
  var args = Array.prototype.slice.call(arguments, 1)
  var fNOP = function () {}
  var fBound = function () {
    var bindArgs = Array.prototype.slice.call(arguments)
    return self.apply(
      this instanceof fNOP ? this : context,
      args.concat(bindArgs)
    )
  }
  fNOP.prototype = this.prototype
  fBound.prototype = new fNOP()
  return fBound
}
```
