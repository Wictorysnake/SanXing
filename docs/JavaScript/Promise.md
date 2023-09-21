# 如何理解 ES6 中的 Promise

js 是单线程的，也就是说一次只能完成一个任务，为了解决这个问题，js 将任务的执行模式分为两种，同步和异步。同步任务会在主线程上排队执行，前一个任务执行完毕，才会执行后一个任务。异步任务则会在异步任务队列中排队，等待主线程上的同步任务执行完毕，才会被主线程读取执行。在 ES5 中我们处理异步只能通过回调的方式进行处理，在多层异步中，回调会一层一层嵌套，也就是所谓的回调地狱，promise 就是异步编程的一种解决方案。

## Promise

特点：

- 对象的状态不受外界影响，promise 对象代表一个异步操作，有三种状态：pending（进行中）、fulfilled（已成功）和 rejected（已失败），只有异步操作的结果可以决定当前是哪一种状态，任何其他操作都无法改变这个状态。
- 一旦状态改变，就不会再变，promise 对象的状态改变只有两种可能：从 pending 变为 fulfilled 和从 pending 变为 rejected，只要这两种情况发生，状态就凝固了，不会再变了，这时称为 resolved（已定型）。

基本用法：

```js
const promise = new Promise((resolve, reject) => {
  // 异步操作
  if (/* 异步操作成功 */) {
    resolve(value) // 将异步操作的结果作为参数传递出去
  } else {
    reject(error) // 将异步操作报出的错误作为参数传递出去
  }
})

promise.then(value => {
  // 异步操作成功时执行
}, error => {
  // 异步操作失败时执行
})
```

promise 生成实例后可以使用 `then` 方法接收 `resolved` 状态和 `rejected` 状态的回调函数。`then` 方法可以接收两个参数，第一个参数是 `resolved` 状态的回调函数，第二个参数是 `rejected` 状态的回调函数，两个参数都是可选的，如果不传，会被忽略。`then` 方法返回一个新的 `promise` 实例，因此可以采用链式写法。

promise 原型上具有 `catch` 方法，用于捕获 `rejected` 状态的回调函数，相当于 `then(null, error => {})`。

```js
promise
  .then((value) => {
    // 异步操作成功时执行
  })
  .catch((error) => {
    // 异步操作失败时执行
  })
```

promise 原型上具有 `finally` 方法，用于指定不管 `promise` 对象最后状态如何，都会执行的操作，该方法的回调函数不接收任何参数。

```js
promise
  .then((value) => {
    // 异步操作成功时执行
  })
  .catch((error) => {
    // 异步操作失败时执行
  })
  .finally(() => {
    // 不管异步操作成功还是失败都会执行
  })
```

## Promise.all

`Promise.all` 方法用于将多个 `promise` 实例包装成一个新的 `promise` 实例，接收一个数组作为参数，数组中的元素都是 `promise` 实例，如果不是，会调用 `Promise.resolve` 方法将其转为 `promise` 实例。当数组中所有的 `promise` 实例都变为 `resolved` 状态时，新的 `promise` 实例才会变为 `resolved` 状态，此时 `then` 方法的回调函数接收到的参数是一个数组，数组中的元素是每个 `promise` 实例的返回值。如果数组中有一个 `promise` 实例变为 `rejected` 状态，新的 `promise` 实例就会变为 `rejected` 状态，此时 `catch` 方法的回调函数接收到的参数是第一个变为 `rejected` 状态的 `promise` 实例的返回值。

```js
const p1 = new Promise((resolve, reject) => {
  setTimeout(() => {
    resolve("p1")
  }, 1000)
})

const p2 = new Promise((resolve, reject) => {
  setTimeout(() => {
    resolve("p2")
  }, 2000)
})

const p3 = new Promise((resolve, reject) => {
  setTimeout(() => {
    resolve("p3")
  }, 3000)
})

Promise.all([p1, p2, p3])
  .then((value) => {
    console.log(value) // ["p1", "p2", "p3"]
  })
  .catch((error) => {
    console.log(error)
  })
```

特点：

- 参数都是 promise 实例，如果不是，会调用 `Promise.resolve` 方法将其转为 `promise` 实例。
- 返回一个新的 promise 实例，该实例的状态由参数中的所有 promise 实例决定。
  - 只有参数中的所有 promise 实例都变为 `resolved` 状态时，新的 promise 实例才会变为 `resolved` 状态。
  - 如果参数中有一个 promise 实例变为 `rejected` 状态，新的 promise 实例就会变为 `rejected` 状态。

## 实现

```js
class MyPromise {
  constructor(executor) {
    this.status = "pending" // 状态
    this.value = undefined // 成功的值
    this.reason = undefined // 失败的原因
    this.onResolvedCallbacks = [] // 成功的回调函数
    this.onRejectedCallbacks = [] // 失败的回调函数

    const resolve = (value) => {
      if (this.status === "pending") {
        this.status = "resolved"
        this.value = value
        this.onResolvedCallbacks.forEach((fn) => fn())
      }
    }

    const reject = (reason) => {
      if (this.status === "pending") {
        this.status = "rejected"
        this.reason = reason
        this.onRejectedCallbacks.forEach((fn) => fn())
      }
    }

    try {
      executor(resolve, reject)
    } catch (error) {
      reject(error)
    }
  }

  then(onResolved, onRejected) {
    onResolved =
      typeof onResolved === "function" ? onResolved : (value) => value
    onRejected =
      typeof onRejected === "function"
        ? onRejected
        : (error) => {
            throw error
          }

    const promise2 = new MyPromise((resolve, reject) => {
      if (this.status === "resolved") {
        setTimeout(() => {
          try {
            const x = onResolved(this.value)
            resolvePromise(promise2, x, resolve, reject)
          } catch (error) {
            reject(error)
          }
        }, 0)
      }

      if (this.status === "rejected") {
        setTimeout(() => {
          try {
            const x = onRejected(this.reason)
            resolvePromise(promise2, x, resolve, reject)
          } catch (error) {
            reject(error)
          }
        }, 0)
      }

      if (this.status === "pending") {
        this.onResolvedCallbacks.push(() => {
          setTimeout(() => {
            try {
              const x = onResolved(this.value)
              resolvePromise(promise2, x, resolve, reject)
            } catch (error) {
              reject(error)
            }
          }, 0)
        })

        this.onRejectedCallbacks.push(() => {
          setTimeout(() => {
            try {
              const x = onRejected(this.reason)
              resolvePromise(promise2, x, resolve, reject)
            } catch (error) {
              reject(error)
            }
          }, 0)
        })
      }
    })

    return promise2
  }

  catch(onRejected) {
    return this.then(null, onRejected)
  }

  finally(onFinally) {
    return this.then(
      (value) => MyPromise.resolve(onFinally()).then(() => value),
      (error) =>
        MyPromise.resolve(onFinally()).then(() => {
          throw error
        })
    )
  }

  static resolve(value) {
    return new MyPromise((resolve, reject) => {
      resolve(value)
    })
  }

  static reject(reason) {
    return new MyPromise((resolve, reject) => {
      reject(reason)
    })
  }

  static all(promises) {
    return new MyPromise((resolve, reject) => {
      const result = []
      let count = 0

      for (let i = 0; i < promises.length; i++) {
        promises[i].then(
          (value) => {
            result[i] = value
            if (++count === promises.length) {
              resolve(result)
            }
          },
          (reason) => {
            reject(reason)
          }
        )
      }
    })
  }
}

function resolvePromise(promise2, x, resolve, reject) {
  if (promise2 === x) {
    return reject(
      new TypeError("Chaining cycle detected for promise #<Promise>")
    )
  }

  if (x instanceof MyPromise) {
    x.then(resolve, reject)
  } else {
    resolve(x)
  }
}
```
