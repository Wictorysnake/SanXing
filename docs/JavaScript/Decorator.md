# 如何理解 ES6 中的 Decorator (装饰器)？

## 定义

Decorator 是 ES7 中的提案，概念借鉴于 python，它作用于一个目标类为其添加属性与方法。

我们用一个比喻来理解 Decorator，把孙悟空看成是一个类，那么棒子就是装饰器为其装备的武器。

```js
@stick
class Monkey {
  constructor(name) {
    this.name = name
  }
}

function stick(target) {
  target.stick = "金箍棒"
}

console.log(Monkey.stick) // 金箍棒
```

Decorator 不仅能修饰类，还能修饰类的属性与方法。

```js
class Monkey {
  @readonly
  name = "孙悟空"

  @readonly
  say() {
    console.log(`我是${this.name}`)
  }
}

function readonly(target, key, descriptor) {
  descriptor.writable = false
}

const p1 = new Monkey()
p1.name = "猪八戒"
p1.say = function () {
  console.log(`我是${this.name}`)
}
console.log(p1.name) // 孙悟空
p1.say() // 我是孙悟空
```

Decorator 只能修饰类及类的方法，不能修饰函数，因为存在函数提升的问题。

```js
@decorator
function func() {
  console.log("func")
}

function decorator() {
  console.log("decorator")
}

func() // Uncaught ReferenceError: Cannot access 'decorator' before initialization
```

## Mixin

在修饰器基础上，我们可以实现 `mixin`(混入)，意思在一个对象中混入另一个对象的属性与方法。

```js
const stick = {
  stick: "金箍棒",
}

const fly = {
  fly() {
    console.log("我会飞")
  },
}

@mixins(stick, fly)
class Monkey {
  constructor(name) {
    this.name = name
  }
}

function mixins(...list) {
  return function (target) {
    Object.assign(target.prototype, ...list)
  }
}

const p1 = new Monkey("孙悟空")
console.log(p1.stick) // 金箍棒
p1.fly() // 我会飞
```

## 装饰器的执行顺序

装饰器的执行顺序是从下到上，从右到左。

```js
@decorator1
@decorator2
class Monkey {
  constructor(name) {
    this.name = name
  }
}

function decorator1(target) {
  console.log("decorator1")
}

function decorator2(target) {
  console.log("decorator2")
}

// decorator2
// decorator1
```

## 装饰器的应用

### 日志

```js
class Math {
  @log
  add(a, b) {
    return a + b
  }
}

function log(target, name, descriptor) {
  const oldValue = descriptor.value
  descriptor.value = function () {
    console.log(`Calling ${name} with`, arguments)
    return oldValue.apply(this, arguments)
  }
  return descriptor
}

const math = new Math()
math.add(1, 2) // Calling add with [1, 2]
```

### 验证

```js
class Person {
  @required
  name

  @required
  age

  constructor(name, age) {
    this.name = name
    this.age = age
  }
}

function required(target, key, descriptor) {
  const oldValue = descriptor.value
  descriptor.value = function () {
    for (let key in this) {
      if (this[key] === undefined) {
        throw new Error(`${key} is required`)
      }
    }
    return oldValue.apply(this, arguments)
  }
  return descriptor
}

const p1 = new Person("Tom", 18)
console.log(p1) // Person { name: 'Tom', age: 18 }
const p2 = new Person("Tom")
// Uncaught Error: age is required
```

### 缓存

```js
class Math {
  @memoize
  add(a, b) {
    return a + b
  }
}

function memoize(target, name, descriptor) {
  const oldValue = descriptor.value
  const cache = new Map()
  descriptor.value = function () {
    const key = JSON.stringify(arguments)
    if (cache.has(key)) {
      return cache.get(key)
    }
    const result = oldValue.apply(this, arguments)
    cache.set(key, result)
    return result
  }
  return descriptor
}

const math = new Math()
console.log(math.add(1, 2)) // 3
console.log(math.add(1, 2)) // 3
```

### 打印方法执行时间

```js
class Math {
  @time
  add(a, b) {
    return a + b
  }
}

function time(target, name, descriptor) {
  const oldValue = descriptor.value
  descriptor.value = function () {
    console.time(name)
    const result = oldValue.apply(this, arguments)
    console.timeEnd(name)
    return result
  }
  return descriptor
}

const math = new Math()
math.add(1, 2) // add: 0.074951171875ms
```

### 打印方法执行次数

```js
class Math {
  @count
  add(a, b) {
    return a + b
  }
}

function count(target, name, descriptor) {
  const oldValue = descriptor.value
  let count = 0
  descriptor.value = function () {
    count++
    console.log(`${name} 方法执行了 ${count} 次`)
    return oldValue.apply(this, arguments)
  }
  return descriptor
}

const math = new Math()
math.add(1, 2) // add 方法执行了 1 次
math.add(1, 2) // add 方法执行了 2 次
```

### 重试

```js
class Math {
  @retry
  add(a, b) {
    return a + b
  }
}

function retry(target, name, descriptor) {
  const oldValue = descriptor.value
  descriptor.value = function () {
    try {
      return oldValue.apply(this, arguments)
    } catch (error) {
      console.log(`${name} 方法执行失败，正在重试...`)
      return oldValue.apply(this, arguments)
    }
  }
  return descriptor
}

const math = new Math()
math.add(1, 2) // add 方法执行失败，正在重试...
// 3
```

### 节流

```js
class Math {
  @throttle(1000)
  add(a, b) {
    return a + b
  }
}

function throttle(wait) {
  return function (target, name, descriptor) {
    const oldValue = descriptor.value
    let timer = null
    descriptor.value = function () {
      if (!timer) {
        timer = setTimeout(() => {
          oldValue.apply(this, arguments)
          timer = null
        }, wait)
      }
    }
    return descriptor
  }
}

const math = new Math()
math.add(1, 2) // 3
math.add(1, 2) // 1000ms 后 3
```

### 防抖

```js
class Math {
  @debounce(1000)
  add(a, b) {
    return a + b
  }
}

function debounce(wait) {
  return function (target, name, descriptor) {
    const oldValue = descriptor.value
    let timer = null
    descriptor.value = function () {
      clearTimeout(timer)
      timer = setTimeout(() => {
        oldValue.apply(this, arguments)
      }, wait)
    }
    return descriptor
  }
}

const math = new Math()
math.add(1, 2) // 1000ms 后 3
```

## 装饰器的好处

- 扩展功能，相当于继承增加了更多的灵活性
- 代码可读性更高，装饰器正确命名相当于注释
