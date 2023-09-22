# 异步更新

> Talk is cheap. Show me the code.

## 源码解读

### dep.notify

> src/core/observer/dep.ts

```ts
notify(info?: DebuggerEventExtraInfo) {
    // stabilize the subscriber list first
    const subs = this.subs.filter(s => s) as DepTarget[]
    // 遍历 subs 数组，调用每个 Watcher 实例的 update 方法，触发响应式更新
    for (let i = 0, l = subs.length; i < l; i++) {
      const sub = subs[i]
      // 调用 Watcher 实例的 update 方法，触发响应式更新
      // 其实调用的还是 run 方法，run 方法调用的是 get 方法，也就是求值，本质调用的还是 getter 函数
      sub.update()
    }
  }
```

### watcher.update

> src/core/observer/watcher.ts

```ts
update() {
  /* istanbul ignore else */
  if (this.lazy) {
    // 懒执行时走这里，比如 computed

    // 将 dirty 置为 true，可以让 computedGetter 执行时重新计算 computed 回调函数的执行结果
    this.dirty = true
  } else if (this.sync) {
    // 同步执行，在使用 vm.$watch 或者 watch 选项时可以传一个 sync 选项，
    // 当为 true 时在数据更新时该 watcher 就不走异步更新队列，直接执行 this.run
    // 方法进行更新
    // 这个属性在官方文档中没有出现
    this.run()
  } else {
    queueWatcher(this)
  }
}
```

### queueWatcher

> src/core/observer/scheduler.ts

```ts
/**
 * Push a watcher into the watcher queue.
 * Jobs with duplicate IDs will be skipped unless it's
 * pushed when the queue is being flushed.
 */
export function queueWatcher(watcher: Watcher) {
  const id = watcher.id
  // 队列中已存在该 watcher，直接返回
  if (has[id] != null) {
    return
  }

  if (watcher === Dep.target && watcher.noRecurse) {
    return
  }

  // 标记该 watcher 已经入队
  has[id] = true
  if (!flushing) {
    // 如果没有在刷新队列，直接将 watcher 入队
    queue.push(watcher)
  } else {
    // if already flushing, splice the watcher based on its id
    // if already past its id, it will be run next immediately.
    // 如果已经在刷新队列，根据 watcher 的 id 将 watcher 插入到队列中的合适位置
    // 确保队列中的 watcher 按照 id 从小到大排序
    let i = queue.length - 1
    while (i > index && queue[i].id > watcher.id) {
      i--
    }
    queue.splice(i + 1, 0, watcher)
  }
  // queue the flush
  if (!waiting) {
    waiting = true

    if (__DEV__ && !config.async) {
      // 如果不是异步更新，直接刷新队列，即同步更新
      flushSchedulerQueue()
      return
    }
    // 通过 nextTick 将 flushSchedulerQueue 放入微任务队列中，异步更新
    // 一般是走这里
    nextTick(flushSchedulerQueue)
  }
}
```

### flushSchedulerQueue

> src/core/observer/scheduler.ts

```ts
/**
 * Flush both queues and run the watchers.
 */
function flushSchedulerQueue() {
  currentFlushTimestamp = getNow()
  // 标记正在刷新队列
  flushing = true
  let watcher, id

  // Sort queue before flush.
  // This ensures that:
  // 1. Components are updated from parent to child. (because parent is always
  //    created before the child)
  // 2. A component's user watchers are run before its render watcher (because
  //    user watchers are created before the render watcher)
  // 3. If a component is destroyed during a parent component's watcher run,
  //    its watchers can be skipped.
  // 对队列进行排序，保证：
  // 1. 组件的更新顺序为从父组件到子组件，因为父组件总是在子组件之前创建
  // 2. 组件的用户 watcher 在渲染 watcher 之前执行，因为用户 watcher 在渲染 watcher 之前创建
  // 3. 如果一个组件在父组件的 watcher 执行期间被销毁，它的 watcher 可以被跳过
  queue.sort(sortCompareFn)

  // do not cache length because more watchers might be pushed
  // as we run existing watchers
  // 不要缓存 length，因为在执行现有 watcher 时可能会有更多的 watcher 被推入队列
  for (index = 0; index < queue.length; index++) {
    watcher = queue[index]
    // 执行 before 钩子函数
    if (watcher.before) {
      watcher.before()
    }
    id = watcher.id
    // 标记该 watcher 已经不在队列中
    has[id] = null
    watcher.run()
    // in dev build, check and stop circular updates.
    if (__DEV__ && has[id] != null) {
      circular[id] = (circular[id] || 0) + 1
      if (circular[id] > MAX_UPDATE_COUNT) {
        warn(
          "You may have an infinite update loop " +
            (watcher.user
              ? `in watcher with expression "${watcher.expression}"`
              : `in a component render function.`),
          watcher.vm
        )
        break
      }
    }
  }

  // keep copies of post queues before resetting state
  const activatedQueue = activatedChildren.slice()
  const updatedQueue = queue.slice()

  resetSchedulerState()

  // call component updated and activated hooks
  callActivatedHooks(activatedQueue)
  callUpdatedHooks(updatedQueue)
  cleanupDeps()

  // devtool hook
  /* istanbul ignore if */
  if (devtools && config.devtools) {
    devtools.emit("flush")
  }
}
```

### nextTick

> src/core/util/next-tick.ts

```ts
const callbacks: Array<Function> = []
let pending = false

export function nextTick(cb?: (...args: any[]) => any, ctx?: object) {
  let _resolve
  // 将 cb 包装成函数，放入 callbacks 数组中
  callbacks.push(() => {
    if (cb) {
      try {
        cb.call(ctx)
      } catch (e: any) {
        handleError(e, ctx, "nextTick")
      }
    } else if (_resolve) {
      _resolve(ctx)
    }
  })
  if (!pending) {
    pending = true
    timerFunc()
  }
  // $flow-disable-line
  if (!cb && typeof Promise !== "undefined") {
    return new Promise((resolve) => {
      _resolve = resolve
    })
  }
}
```

### timerFunc

> src/core/util/next-tick.ts

```ts
let timerFunc

// The nextTick behavior leverages the microtask queue, which can be accessed
// via either native Promise.then or MutationObserver.
// MutationObserver has wider support, however it is seriously bugged in
// UIWebView in iOS >= 9.3.3 when triggered in touch event handlers. It
// completely stops working after triggering a few times... so, if native
// Promise is available, we will use it:
/* istanbul ignore next, $flow-disable-line */
if (typeof Promise !== "undefined" && isNative(Promise)) {
  const p = Promise.resolve()
  timerFunc = () => {
    p.then(flushCallbacks)
    // In problematic UIWebViews, Promise.then doesn't completely break, but
    // it can get stuck in a weird state where callbacks are pushed into the
    // microtask queue but the queue isn't being flushed, until the browser
    // needs to do some other work, e.g. handle a timer. Therefore we can
    // "force" the microtask queue to be flushed by adding an empty timer.
    if (isIOS) setTimeout(noop)
  }
  isUsingMicroTask = true
} else if (
  !isIE &&
  typeof MutationObserver !== "undefined" &&
  (isNative(MutationObserver) ||
    // PhantomJS and iOS 7.x
    MutationObserver.toString() === "[object MutationObserverConstructor]")
) {
  // Use MutationObserver where native Promise is not available,
  // e.g. PhantomJS, iOS7, Android 4.4
  // (#6466 MutationObserver is unreliable in IE11)
  let counter = 1
  const observer = new MutationObserver(flushCallbacks)
  const textNode = document.createTextNode(String(counter))
  observer.observe(textNode, {
    characterData: true,
  })
  timerFunc = () => {
    counter = (counter + 1) % 2
    textNode.data = String(counter)
  }
  isUsingMicroTask = true
} else if (typeof setImmediate !== "undefined" && isNative(setImmediate)) {
  // Fallback to setImmediate.
  // Technically it leverages the (macro) task queue,
  // but it is still a better choice than setTimeout.
  timerFunc = () => {
    setImmediate(flushCallbacks)
  }
} else {
  // Fallback to setTimeout.
  timerFunc = () => {
    setTimeout(flushCallbacks, 0)
  }
}
```

### flushCallbacks

> src/core/util/next-tick.ts

```ts
function flushCallbacks() {
  pending = false
  const copies = callbacks.slice(0)
  // 清空 callbacks 数组
  callbacks.length = 0
  // 遍历 copies 数组，执行每个函数，即执行回调函数
  for (let i = 0; i < copies.length; i++) {
    copies[i]()
  }
}
```

### watcher.run

> src/core/observer/watcher.ts

```ts
/**
 * Scheduler job interface.
 * Will be called by the scheduler.
 * 调度程序作业接口。
 * 将由调度程序调用。
 * 由 刷新队列函数 flushSchedulerQueue 调用，完成如下几件事：
 * 1、执行实例化 watcher 传递的第二个参数，updateComponent 或者 获取 this.xx 的一个函数(parsePath 返回的函数)
 * 2、更新旧值为新值
 * 3、执行实例化 watcher 时传递的第三个参数，比如用户 watcher 的回调函数
 */
run() {
  if (this.active) {
    const value = this.get()
    if (
      value !== this.value ||
      // Deep watchers and watchers on Object/Arrays should fire even
      // when the value is the same, because the value may
      // have mutated.
      // 深度观察者和对象/数组上的观察者应该触发，即使值相同，因为值可能已经发生了变化。
      isObject(value) ||
      this.deep
    ) {
      // set new value
      const oldValue = this.value
      this.value = value
      if (this.user) {
        const info = `callback for watcher "${this.expression}"`
        invokeWithErrorHandling(
          this.cb,
          this.vm,
          [value, oldValue],
          this.vm,
          info
        )
      } else {
        this.cb.call(this.vm, value, oldValue)
      }
    }
  }
}
```

### watcher.get

> src/core/observer/watcher.ts

```ts
get() {
  pushTarget(this)
  let value
  const vm = this.vm
  try {
    value = this.getter.call(vm, vm)
  } catch (e: any) {
    if (this.user) {
      handleError(e, vm, `getter for watcher "${this.expression}"`)
    } else {
      throw e
    }
  } finally {
    // "touch" every property so they are all tracked as
    // dependencies for deep watching
    if (this.deep) {
      traverse(value)
    }
    popTarget()
    this.cleanupDeps()
  }
  return value
}
```

## 思考

### Vue 的异步更新机制是如何实现的？

核心是利用浏览器的异步任务队列，首先微任务，次之宏任务。

当响应式数据更新后，会调用 `dep.notify` 方法，去通知 `dep` 中收集的 `watcher` 去执行 `update` 方法，该方法将 `watcher` 自己放入一个 `watcher` 队列（全局的 queue 数组）中，然后调用 `nextTick` 方法，将 `flushSchedulerQueue` 方法放入微任务队列中，等待浏览器空闲时执行。`flushSchedulerQueue` 函数负责刷新 `watcher` 队列，即执行 `queue` 数组中每一个 `watcher` 的 `run` 方法，`run` 方法中会调用 `watcher` 的 `getter` 方法，即 `updateComponent` 方法，该方法会重新渲染组件，最终更新视图。

### nextTick 原理？

nextTick 会将回调函数放入 callbacks 数组中，然后调用 timerFunc 方法，该方法会将 flushCallbacks 方法放入微任务队列中，等待浏览器空闲时执行。flushCallbacks 方法会遍历 callbacks 数组，执行每一个回调函数。
