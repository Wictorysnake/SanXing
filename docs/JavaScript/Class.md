# 如何理解 ES6 中的类

首先，JS 作为一门非面向对象语言，在 ES6 之前，并没有提供对类的支持，我们常用的做法是通过构造函数来模拟类的实现，通过将属性及方法定义在原型上共享给其实例，从而达到类的效果。

```js
function Person(name, age) {
  this.name = name
  this.age = age
}

Person.prototype.say = function () {
  console.log(`My name is ${this.name}, I'm ${this.age} years old.`)
}

const p1 = new Person("Tom", 18)
p1.say() // My name is Tom, I'm 18 years old.
```

## ES6 中的 class

ES6 中引入了 `class` 关键字，用于定义类，其语法糖如下：

```js
class Person {
  constructor(name, age) {
    this.name = name
    this.age = age
  }

  say() {
    console.log(`My name is ${this.name}, I'm ${this.age} years old.`)
  }
}

const p1 = new Person("Tom", 18)
p1.say() // My name is Tom, I'm 18 years old.
```

每个类中都有一个 `constructor` 方法，用于定义类的构造函数，通过 `new` 关键字创建类的实例时，会自动调用该方法。如果没有显示定义，会默认添加一个空的 `constructor` 方法。等同于 ES5 中的构造函数，类的所有方法都是定义在类的 `prototype` 属性上的。二者的主要区别在于 `class` 必须使用 `new` 关键字调用，ES5 中构造函数不使用 `new` 也可以调用。`class` 中新增 `static` 关键字，用于定义类的静态方法，静态方法只能通过类名调用，不能通过实例调用。

```js
class Person {
  constructor(name, age) {
    this.name = name
    this.age = age
  }

  say() {
    console.log(`My name is ${this.name}, I'm ${this.age} years old.`)
  }

  static staticMethod() {
    console.log("This is a static method.")
  }
}

const p1 = new Person("Tom", 18)
p1.say() // My name is Tom, I'm 18 years old.
Person.staticMethod() // This is a static method.
```

## Extends 继承

ES6 中新增了 `extends` 关键字，用于实现继承，其语法糖如下：

```js
class Person {
  constructor(name, age) {
    this.name = name
    this.age = age
  }

  say() {
    console.log(`My name is ${this.name}, I'm ${this.age} years old.`)
  }
}

class Student extends Person {
  constructor(name, age, grade) {
    super(name, age)
    this.grade = grade
  }

  study() {
    console.log(`I'm studying in grade ${this.grade}.`)
  }
}

const s1 = new Student("Tom", 18, 3)
s1.say() // My name is Tom, I'm 18 years old.
s1.study() // I'm studying in grade 3.
```

`extends` 注意点：

- 使用 `extends` 继承时，子类构造函数中必须调用 `super()`，代表调用父类的构造函数
- `super` 虽然代表了父类的构造函数，但是返回的是子类的实例，即 `super` 内部的 `this` 指的是子类的实例
- `super` 作为函数调用时，代表类的构造函数
- `super` 作为对象时，在普通方法中，指向父类的原型对象；在静态方法中，指向父类

```js
class A {
  constructor() {
    console.log(new.target.name)
  }
}

class B extends A {
  constructor() {
    super()
  }
}

new A() // A
new B() // B
```
