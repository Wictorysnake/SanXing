# 响应式原理

> Talk is cheap. Show me the code.

## 源码解读

### initState

> src/core/instance/state.ts

```ts
// 响应式原理入口，处理了 props、methods、data、computed 和 watch 选项
export function initState(vm: Component) {
  const opts = vm.$options
  // 初始化 props
  // 对 props 做响应式处理
  // 将 props 上的属性代理到 vm 实例上，这样就可以通过 vm.key 访问到 props.key 的值了
  if (opts.props) initProps(vm, opts.props)

  // Composition API
  initSetup(vm)

  // 初始化 methods
  // 遍历 methods， 判重处理，methods 中的属性不能和 props 中的属性重复，而且不能和 Vue 实例上的方法重复，因为 Vue 实例上的方法会被代理到 vm 实例上，可以通过 vm[key] 访问到
  // 将 methods 上的方法代理到 vm 实例上，这样就可以通过 vm[key] 访问到 methods[key] 的值了
  if (opts.methods) initMethods(vm, opts.methods)
  // 初始化 data
  // 获取 data 配置项，对配置项进行处理，确保 data 是一个纯对象
  // 遍历 data 上的属性，判重处理，data 中的属性不能和 methods 中的属性重复，而且不能和 props 中的属性重复
  // 对 data 做响应式处理
  if (opts.data) {
    initData(vm)
  } else {
    const ob = observe((vm._data = {}))
    ob && ob.vmCount++
  }
  // 初始化 computed
  // 遍历 computed，为 computed 属性创建 watcher 实例，这个 watcher 是惰性的，即默认不会执行求值函数
  // 代理 computed 中的属性到 vm 实例上，这样就可以通过 vm[key] 访问到 computed 中的属性了
  if (opts.computed) initComputed(vm, opts.computed)
  // 初始化 watch
  // 遍历 watch，如果 handler 是数组，则遍历数组，分别调用 createWatcher 函数
  if (opts.watch && opts.watch !== nativeWatch) {
    initWatch(vm, opts.watch)
  }
}
```

### initProps

> src/core/instance/state.ts

```ts
function initProps(vm: Component, propsOptions: Object) {
  // 从配置项中获取 propsData
  const propsData = vm.$options.propsData || {}
  // 初始化 props 对象
  const props = (vm._props = shallowReactive({}))
  // cache prop keys so that future props updates can iterate using Array
  // instead of dynamic object key enumeration.
  const keys: string[] = (vm.$options._propKeys = [])
  const isRoot = !vm.$parent
  // root instance props should be converted
  if (!isRoot) {
    toggleObserving(false)
  }
  for (const key in propsOptions) {
    keys.push(key)
    const value = validateProp(key, propsOptions, propsData, vm)
    // 对 props 做响应式处理
    defineReactive(props, key, value)
    // static props are already proxied on the component's prototype
    // during Vue.extend(). We only need to proxy props defined at
    // instantiation here.
    if (!(key in vm)) {
      // 将 props 上的属性代理到 vm 实例上，这样就可以通过 vm.key 访问到 props.key 的值了
      proxy(vm, `_props`, key)
    }
  }
  toggleObserving(true)
}
```

### initMethods

> src/core/instance/state.ts

```ts
function initMethods(vm: Component, methods: Object) {
  // 从配置项中获取 props
  const props = vm.$options.props
  // 遍历 methods
  for (const key in methods) {
    if (__DEV__) {
      if (typeof methods[key] !== "function") {
        warn(
          `Method "${key}" has type "${typeof methods[
            key
          ]}" in the component definition. ` +
            `Did you reference the function correctly?`,
          vm
        )
      }
      // 判重，methods 中的属性不能和 props 中的属性重复，而且不能和 Vue 实例上的方法重复，因为 Vue 实例上的方法会被代理到 vm 实例上，可以通过 vm[key] 访问到
      if (props && hasOwn(props, key)) {
        warn(`Method "${key}" has already been defined as a prop.`, vm)
      }
      if (key in vm && isReserved(key)) {
        warn(
          `Method "${key}" conflicts with an existing Vue instance method. ` +
            `Avoid defining component methods that start with _ or $.`
        )
      }
    }
    // 将 methods 上的方法代理到 vm 实例上，这样就可以通过 vm[key] 访问到 methods[key] 的值了
    vm[key] = typeof methods[key] !== "function" ? noop : bind(methods[key], vm)
  }
}
```

### initData

> src/core/instance/state.ts

```ts
function initData(vm: Component) {
  // 获取 data 配置项
  let data: any = vm.$options.data
  // 如果 data 是函数，则调用 getData 函数，否则直接返回 data
  data = vm._data = isFunction(data) ? getData(data, vm) : data || {}
  // 如果 data 不是纯对象，则赋值为空对象并警告
  if (!isPlainObject(data)) {
    data = {}
    __DEV__ &&
      warn(
        "data functions should return an object:\n" +
          "https://v2.vuets.org/v2/guide/components.html#data-Must-Be-a-Function",
        vm
      )
  }
  // proxy data on instance
  const keys = Object.keys(data)
  const props = vm.$options.props
  const methods = vm.$options.methods
  let i = keys.length
  while (i--) {
    const key = keys[i]
    if (__DEV__) {
      // 判重处理，data 中的属性不能和 methods 中的属性重复
      if (methods && hasOwn(methods, key)) {
        warn(`Method "${key}" has already been defined as a data property.`, vm)
      }
    }
    // 判重处理，data 中的属性不能和 props 中的属性重复
    if (props && hasOwn(props, key)) {
      __DEV__ &&
        warn(
          `The data property "${key}" is already declared as a prop. ` +
            `Use prop default value instead.`,
          vm
        )
    } else if (!isReserved(key)) {
      // 将 data 上的属性代理到 vm 实例上，这样就可以通过 vm.key 访问到 data.key 的值了
      proxy(vm, `_data`, key)
    }
  }
  // observe data
  // 对 data 做响应式处理
  const ob = observe(data)
  ob && ob.vmCount++
}
```

### proxy

> src/core/instance/state.ts

```ts
export function proxy(target: Object, sourceKey: string, key: string) {
  sharedPropertyDefinition.get = function proxyGetter() {
    return this[sourceKey][key]
  }
  sharedPropertyDefinition.set = function proxySetter(val) {
    this[sourceKey][key] = val
  }
  Object.defineProperty(target, key, sharedPropertyDefinition)
}
```

### initComputed

> src/core/instance/state.ts

```ts
function initComputed(vm: Component, computed: Object) {
  // $flow-disable-line
  const watchers = (vm._computedWatchers = Object.create(null))
  // computed properties are just getters during SSR
  const isSSR = isServerRendering()

  // 遍历 computed
  for (const key in computed) {
    const userDef = computed[key]
    const getter = isFunction(userDef) ? userDef : userDef.get
    if (__DEV__ && getter == null) {
      warn(`Getter is missing for computed property "${key}".`, vm)
    }

    if (!isSSR) {
      // create internal watcher for the computed property.
      // 为 computed 属性创建 watcher 实例，这个 watcher 是惰性的，即默认不会执行求值函数
      watchers[key] = new Watcher(
        vm,
        getter || noop,
        noop,
        computedWatcherOptions
      )
    }

    // component-defined computed properties are already defined on the
    // component prototype. We only need to define computed properties defined
    // at instantiation here.
    if (!(key in vm)) {
      // 代理 computed 中的属性到 vm 实例上，这样就可以通过 vm[key] 访问到 computed 中的属性了
      defineComputed(vm, key, userDef)
    } else if (__DEV__) {
      // 判重处理，computed 中的属性不能和 data、props 中的属性重复，而且不能和 Vue 实例上的方法重复，因为 Vue 实例上的方法会被代理到 vm 实例上，可以通过 vm[key] 访问到
      if (key in vm.$data) {
        warn(`The computed property "${key}" is already defined in data.`, vm)
      } else if (vm.$options.props && key in vm.$options.props) {
        warn(`The computed property "${key}" is already defined as a prop.`, vm)
      } else if (vm.$options.methods && key in vm.$options.methods) {
        warn(
          `The computed property "${key}" is already defined as a method.`,
          vm
        )
      }
    }
  }
}
```

### initWatch

> src/core/instance/state.ts

```ts
function initWatch(vm: Component, watch: Object) {
  // 遍历 watch
  for (const key in watch) {
    const handler = watch[key]
    // 如果 handler 是数组，则遍历数组，分别调用 createWatcher 函数
    if (isArray(handler)) {
      for (let i = 0; i < handler.length; i++) {
        createWatcher(vm, key, handler[i])
      }
    } else {
      createWatcher(vm, key, handler)
    }
  }
}
```

### observe

> src/core/observer/index.ts

```ts
/**
 * Attempt to create an observer instance for a value,
 * returns the new observer if successfully observed,
 * or the existing observer if the value already has one.
 * 尝试为值创建一个 Observer 实例，如果成功观察，则返回新的 Observer，如果值已经有一个，则返回现有的 Observer。
 */
export function observe(
  value: any,
  shallow?: boolean,
  ssrMockReactivity?: boolean
): Observer | void {
  // 如果 value 上有 __ob__ 属性，并且 __ob__ 是 Observer 类型的实例，则直接返回 __ob__，说明是已经处理过的
  if (value && hasOwn(value, "__ob__") && value.__ob__ instanceof Observer) {
    return value.__ob__
  }
  if (
    shouldObserve &&
    (ssrMockReactivity || !isServerRendering()) &&
    (isArray(value) || isPlainObject(value)) &&
    Object.isExtensible(value) &&
    !value.__v_skip /* ReactiveFlags.SKIP */ &&
    !isRef(value) &&
    !(value instanceof VNode)
  ) {
    // 创建 Observer 实例
    return new Observer(value, shallow, ssrMockReactivity)
  }
}
```

### observer

> src/core/observer/index.ts

```ts
export class Observer {
  dep: Dep
  vmCount: number // number of vms that have this object as root $data

  constructor(public value: any, public shallow = false, public mock = false) {
    // this.value = value
    this.dep = mock ? mockDep : new Dep()
    this.vmCount = 0
    def(value, "__ob__", this)
    if (isArray(value)) {
      if (!mock) {
        if (hasProto) {
          /* eslint-disable no-proto */
          ;(value as any).__proto__ = arrayMethods
          /* eslint-enable no-proto */
        } else {
          for (let i = 0, l = arrayKeys.length; i < l; i++) {
            const key = arrayKeys[i]
            def(value, key, arrayMethods[key])
          }
        }
      }
      if (!shallow) {
        this.observeArray(value)
      }
    } else {
      /**
       * Walk through all properties and convert them into
       * getter/setters. This method should only be called when
       * value type is Object.
       */
      const keys = Object.keys(value)
      for (let i = 0; i < keys.length; i++) {
        const key = keys[i]
        defineReactive(value, key, NO_INITIAL_VALUE, undefined, shallow, mock)
      }
    }
  }

  /**
   * Observe a list of Array items.
   */
  observeArray(value: any[]) {
    for (let i = 0, l = value.length; i < l; i++) {
      observe(value[i], false, this.mock)
    }
  }
}
```

### defineReactive

> src/core/observer/index.ts

```ts
/**
 * Define a reactive property on an Object.
 */
export function defineReactive(
  obj: object,
  key: string,
  val?: any,
  customSetter?: Function | null,
  shallow?: boolean,
  mock?: boolean
) {
  // 创建 dep 实例
  const dep = new Dep()

  // 获取 obj[key] 的属性描述符
  const property = Object.getOwnPropertyDescriptor(obj, key)
  // 如果 obj[key] 是不可配置的，则直接返回
  if (property && property.configurable === false) {
    return
  }

  // cater for pre-defined getter/setters
  // 记录 getter 和 setter
  const getter = property && property.get
  const setter = property && property.set
  if (
    (!getter || setter) &&
    (val === NO_INITIAL_VALUE || arguments.length === 2)
  ) {
    val = obj[key]
  }

  // 递归调用 observe，处理 val 的响应式
  let childOb = !shallow && observe(val, false, mock)
  Object.defineProperty(obj, key, {
    enumerable: true,
    configurable: true,
    // 其实做了依赖收集，当访问 obj[key] 时，会触发 getter，收集依赖
    get: function reactiveGetter() {
      const value = getter ? getter.call(obj) : val
      if (Dep.target) {
        dep.depend()
        if (childOb) {
          childOb.dep.depend()
          if (isArray(value)) {
            dependArray(value)
          }
        }
      }
      return isRef(value) && !shallow ? value.value : value
    },
    // 其实做了派发更新，当修改 obj[key] 时，会触发 setter，派发更新
    set: function reactiveSetter(newVal) {
      const value = getter ? getter.call(obj) : val
      if (!hasChanged(value, newVal)) {
        return
      }
      if (setter) {
        setter.call(obj, newVal)
      } else if (getter) {
        // #7981: for accessor properties without setter
        return
      } else if (!shallow && isRef(value) && !isRef(newVal)) {
        value.value = newVal
        return
      } else {
        val = newVal
      }
      childOb = !shallow && observe(newVal, false, mock)
      dep.notify()
    },
  })

  return dep
}
```

### 数组响应式

> /src/core/observer/array.ts

```ts
import { def } from "../util/index"

const arrayProto = Array.prototype
// 基于数组原型创建一个新的对象
export const arrayMethods = Object.create(arrayProto)

// 需要增强的数组方法
const methodsToPatch = [
  "push",
  "pop",
  "shift",
  "unshift",
  "splice",
  "sort",
  "reverse",
]

/**
 * Intercept mutating methods and emit events
 */
methodsToPatch.forEach(function (method) {
  // cache original method
  // 缓存原始方法
  const original = arrayProto[method]
  def(arrayMethods, method, function mutator(...args) {
    // 调用原始方法，取得结果
    const result = original.apply(this, args)
    const ob = this.__ob__
    let inserted
    switch (method) {
      case "push":
      case "unshift":
        inserted = args
        break
      case "splice":
        inserted = args.slice(2)
        break
    }
    // 如果有新增的元素，需要对新增的元素进行响应式处理
    if (inserted) ob.observeArray(inserted)
    // notify change
    // 触发更新
    if (__DEV__) {
      ob.dep.notify({
        type: TriggerOpTypes.ARRAY_MUTATION,
        target: this,
        key: method,
      })
    } else {
      ob.dep.notify()
    }
    return result
  })
})
```

### Dep

> src/core/observer/dep.ts

```ts
import config from "../config"
import { DebuggerOptions, DebuggerEventExtraInfo } from "v3"

let uid = 0

const pendingCleanupDeps: Dep[] = []

export const cleanupDeps = () => {
  for (let i = 0; i < pendingCleanupDeps.length; i++) {
    const dep = pendingCleanupDeps[i]
    dep.subs = dep.subs.filter((s) => s)
    dep._pending = false
  }
  pendingCleanupDeps.length = 0
}

/**
 * @internal
 */
export interface DepTarget extends DebuggerOptions {
  id: number
  addDep(dep: Dep): void
  update(): void
}

/**
 * A dep is an observable that can have multiple
 * directives subscribing to it.
 * @internal
 */
export default class Dep {
  static target?: DepTarget | null
  id: number
  subs: Array<DepTarget | null>
  // pending subs cleanup
  _pending = false

  constructor() {
    this.id = uid++
    this.subs = []
  }

  addSub(sub: DepTarget) {
    this.subs.push(sub)
  }

  removeSub(sub: DepTarget) {
    // #12696 deps with massive amount of subscribers are extremely slow to
    // clean up in Chromium
    // to workaround this, we unset the sub for now, and clear them on
    // next scheduler flush.
    this.subs[this.subs.indexOf(sub)] = null
    if (!this._pending) {
      this._pending = true
      pendingCleanupDeps.push(this)
    }
  }

  depend(info?: DebuggerEventExtraInfo) {
    if (Dep.target) {
      // 这里主要做了两件事
      // 1. 调用 Dep.target.addDep(this)，即调用 Watcher 实例的 addDep 方法，将当前 Dep 实例添加到 Watcher 实例的 deps 数组中
      // 2. 调用 Dep 实例的 addSub 方法，将当前 Watcher 实例添加到 Dep 实例的 subs 数组中
      Dep.target.addDep(this)
      if (__DEV__ && info && Dep.target.onTrack) {
        Dep.target.onTrack({
          effect: Dep.target,
          ...info,
        })
      }
    }
  }

  notify(info?: DebuggerEventExtraInfo) {
    // stabilize the subscriber list first
    const subs = this.subs.filter((s) => s) as DepTarget[]
    if (__DEV__ && !config.async) {
      // subs aren't sorted in scheduler if not running async
      // we need to sort them now to make sure they fire in correct
      // order
      subs.sort((a, b) => a.id - b.id)
    }
    // 遍历 subs 数组，调用每个 Watcher 实例的 update 方法，触发响应式更新
    for (let i = 0, l = subs.length; i < l; i++) {
      const sub = subs[i]
      if (__DEV__ && info) {
        sub.onTrigger &&
          sub.onTrigger({
            effect: subs[i],
            ...info,
          })
      }
      // 调用 Watcher 实例的 update 方法，触发响应式更新
      // 其实调用的还是 run 方法，run 方法调用的是 get 方法，也就是求值，本质调用的还是 getter 函数
      sub.update()
    }
  }
}

// The current target watcher being evaluated.
// This is globally unique because only one watcher
// can be evaluated at a time.
Dep.target = null
const targetStack: Array<DepTarget | null | undefined> = []

export function pushTarget(target?: DepTarget | null) {
  targetStack.push(target)
  Dep.target = target
}

export function popTarget() {
  targetStack.pop()
  Dep.target = targetStack[targetStack.length - 1]
}
```

### Watcher

> src/core/observer/watcher.ts

```ts
export default class Watcher implements DepTarget {
  vm?: Component | null
  expression: string
  cb: Function
  id: number
  deep: boolean
  user: boolean
  lazy: boolean
  sync: boolean
  dirty: boolean
  active: boolean
  deps: Array<Dep>
  newDeps: Array<Dep>
  depIds: SimpleSet
  newDepIds: SimpleSet
  before?: Function
  onStop?: Function
  noRecurse?: boolean
  getter: Function
  value: any
  post: boolean

  // dev only
  onTrack?: ((event: DebuggerEvent) => void) | undefined
  onTrigger?: ((event: DebuggerEvent) => void) | undefined

  constructor(
    vm: Component | null,
    expOrFn: string | (() => any),
    cb: Function,
    options?: WatcherOptions | null,
    isRenderWatcher?: boolean
  ) {
    recordEffectScope(
      this,
      // if the active effect scope is manually created (not a component scope),
      // prioritize it
      activeEffectScope && !activeEffectScope._vm
        ? activeEffectScope
        : vm
        ? vm._scope
        : undefined
    )
    if ((this.vm = vm) && isRenderWatcher) {
      vm._watcher = this
    }
    // options
    if (options) {
      this.deep = !!options.deep
      this.user = !!options.user
      this.lazy = !!options.lazy
      this.sync = !!options.sync
      this.before = options.before
      if (__DEV__) {
        this.onTrack = options.onTrack
        this.onTrigger = options.onTrigger
      }
    } else {
      this.deep = this.user = this.lazy = this.sync = false
    }
    this.cb = cb
    this.id = ++uid // uid for batching
    this.active = true
    this.post = false
    this.dirty = this.lazy // for lazy watchers
    this.deps = []
    this.newDeps = []
    this.depIds = new Set()
    this.newDepIds = new Set()
    this.expression = __DEV__ ? expOrFn.toString() : ""
    // parse expression for getter
    if (isFunction(expOrFn)) {
      this.getter = expOrFn
    } else {
      this.getter = parsePath(expOrFn)
      if (!this.getter) {
        this.getter = noop
        __DEV__ &&
          warn(
            `Failed watching path: "${expOrFn}" ` +
              "Watcher only accepts simple dot-delimited paths. " +
              "For full control, use a function instead.",
            vm
          )
      }
    }
    this.value = this.lazy ? undefined : this.get()
  }

  /**
   * Evaluate the getter, and re-collect dependencies.
   */
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

  /**
   * Add a dependency to this directive.
   */
  addDep(dep: Dep) {
    const id = dep.id
    if (!this.newDepIds.has(id)) {
      this.newDepIds.add(id)
      this.newDeps.push(dep)
      if (!this.depIds.has(id)) {
        dep.addSub(this)
      }
    }
  }

  /**
   * Clean up for dependency collection.
   */
  cleanupDeps() {
    let i = this.deps.length
    while (i--) {
      const dep = this.deps[i]
      if (!this.newDepIds.has(dep.id)) {
        dep.removeSub(this)
      }
    }
    let tmp: any = this.depIds
    this.depIds = this.newDepIds
    this.newDepIds = tmp
    this.newDepIds.clear()
    tmp = this.deps
    this.deps = this.newDeps
    this.newDeps = tmp
    this.newDeps.length = 0
  }

  /**
   * Subscriber interface.
   * Will be called when a dependency changes.
   */
  update() {
    /* istanbul ignore else */
    if (this.lazy) {
      this.dirty = true
    } else if (this.sync) {
      this.run()
    } else {
      queueWatcher(this)
    }
  }

  /**
   * Scheduler job interface.
   * Will be called by the scheduler.
   */
  run() {
    if (this.active) {
      const value = this.get()
      if (
        value !== this.value ||
        // Deep watchers and watchers on Object/Arrays should fire even
        // when the value is the same, because the value may
        // have mutated.
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

  /**
   * Evaluate the value of the watcher.
   * This only gets called for lazy watchers.
   */
  evaluate() {
    this.value = this.get()
    this.dirty = false
  }

  /**
   * Depend on all deps collected by this watcher.
   */
  depend() {
    let i = this.deps.length
    while (i--) {
      this.deps[i].depend()
    }
  }

  /**
   * Remove self from all dependencies' subscriber list.
   */
  teardown() {
    if (this.vm && !this.vm._isBeingDestroyed) {
      remove(this.vm._scope.effects, this)
    }
    if (this.active) {
      let i = this.deps.length
      while (i--) {
        this.deps[i].removeSub(this)
      }
      this.active = false
      if (this.onStop) {
        this.onStop()
      }
    }
  }
}
```

## 思考

Vue2 响应式是怎么实现的？

核心：数据劫持 + 发布订阅

数据劫持主要是利用了 `Object.defineProperty`，通过 `Object.defineProperty` 为对象的属性添加 getter 和 setter，从而实现对数据的劫持，当数据发生变化时，触发 setter，通知订阅者更新视图。

发布订阅主要是利用了 `Dep`，`Dep` 用来收集依赖，每个响应式对象都有一个 `Dep` 实例，当访问响应式对象的属性时，会触发 getter，收集依赖，当修改响应式对象的属性时，会触发 setter，派发更新，通知订阅者更新视图。

分为两类：对象和数组

- 对象：遍历对象的属性，为每个属性添加 getter 和 setter，如果属性值依旧为对象，则递归为属性值上的每个属性添加 getter 和 setter，当访问属性时，会触发 getter，收集依赖，当修改属性时，会触发 setter，派发更新，通知订阅者更新视图。
- 数组：增强数组的那 7 个可以改变自身的方法，然后拦截对这些方法的操作。

Vue2 响应式的缺点：

- 对象：无法检测对象属性的添加和删除，需要使用 `Vue.set` 和 `Vue.delete`，或者使用 `this.$set` 和 `this.$delete`，或者使用 `vm.$set` 和 `vm.$delete`，或者使用 `this.set` 和 `this.delete`，或者使用 `set` 和 `delete`。
- 数组：无法检测数组索引的变化，需要使用 `Vue.set` 和 `Vue.delete`，或者使用 `this.$set` 和 `this.$delete`，或者使用 `vm.$set` 和 `vm.$delete`，或者使用 `this.set` 和 `this.delete`，或者使用 `set` 和 `delete`。
