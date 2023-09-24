# 全局 API

> Talk is cheap. Show me the code.

## 源码解读

### 入口

> src/core/global-api/index.ts

```ts
export function initGlobalAPI(Vue: GlobalAPI) {
  // config
  const configDef: Record<string, any> = {}
  configDef.get = () => config
  if (__DEV__) {
    configDef.set = () => {
      warn(
        "Do not replace the Vue.config object, set individual fields instead."
      )
    }
  }
  // 为 Vue.config 添加 getter 和 setter 方法
  Object.defineProperty(Vue, "config", configDef)

  // exposed util methods.
  // NOTE: these are not considered part of the public API - avoid relying on
  // them unless you are aware of the risk.
  // 暴露一些工具方法，但是不建议使用
  Vue.util = {
    warn,
    // 扩展目标对象的属性
    extend,
    // 合并选项
    // 1. 标准化 props、inject、directives
    // 2. 将 extends、mixins 合并到 parent 中
    // 3. 遍历 parent 和 child，将 child 中有而 parent 中没有的属性合并到 parent 中
    mergeOptions,
    // 定义响应式属性
    // 1. 创建 dep 实例
    // 2. 获取 obj[key] 的属性描述符
    // 3. 记录 getter 和 setter
    // 4. 递归调用 observe，处理 val 的响应式
    // 5. 拦截 obj[key] 的读取和设置操作，依赖收集和派发更新
    defineReactive,
  }

  // 设置对象的属性。添加新属性并在属性不存在时触发更改通知。
  Vue.set = set
  // 删除对象的属性。如果对象是响应式的，确保删除能触发更新视图。
  Vue.delete = del
  // 异步执行回调函数
  Vue.nextTick = nextTick

  // 2.6 explicit observable API
  // 2.6 显式的 observable API
  Vue.observable = <T>(obj: T): T => {
    observe(obj)
    return obj
  }

  // 初始化 Vue.options 对象，并添加 components、directives、filters 属性
  Vue.options = Object.create(null)
  ASSET_TYPES.forEach((type) => {
    Vue.options[type + "s"] = Object.create(null)
  })

  // this is used to identify the "base" constructor to extend all plain-object
  // components with in Weex's multi-instance scenarios.
  // 用于在 Weex 的多实例场景中扩展所有纯对象组件的“基础”构造函数。
  Vue.options._base = Vue

  // 将 keep-alive 组件添加到 Vue.options.components 中
  extend(Vue.options.components, builtInComponents)

  // 定义 Vue.use 方法
  initUse(Vue)
  // 定义 Vue.mixin 方法，本质上就是合并选项
  initMixin(Vue)
  // 定义 Vue.extend 方法，使用基础 Vue 构造器，创建一个“子类”。参数是一个包含组件选项的对象。
  initExtend(Vue)
  // 定义 Vue.component、Vue.directive、Vue.filter 方法
  initAssetRegisters(Vue)
}
```

### Vue.use

> src/core/global-api/use.ts

```ts
Vue.use = function (plugin: Function | any) {
  // 已经安装过的插件
  const installedPlugins =
    this._installedPlugins || (this._installedPlugins = [])
  // 如果已经安装过，则直接返回，确保插件只被安装一次
  if (installedPlugins.indexOf(plugin) > -1) {
    return this
  }

  // additional parameters
  const args = toArray(arguments, 1)
  args.unshift(this)
  // 如果插件是一个对象，则必须提供 install 方法
  if (isFunction(plugin.install)) {
    plugin.install.apply(plugin, args)
  } else if (isFunction(plugin)) {
    // 如果插件是一个函数，则直接调用
    plugin.apply(null, args)
  }
  // 将插件添加到已安装列表中
  installedPlugins.push(plugin)
  return this
}
```

### Vue.mixin

> src/core/global-api/mixin.ts

```ts
Vue.mixin = function (mixin: Object) {
  // 合并选项
  this.options = mergeOptions(this.options, mixin)
  return this
}
```

#### mergeOptions

> src/core/util/options.ts

```ts
export function mergeOptions(
  parent: Record<string, any>,
  child: Record<string, any>,
  vm?: Component | null
): ComponentOptions {
  if (__DEV__) {
    checkComponents(child)
  }

  if (isFunction(child)) {
    // @ts-expect-error
    child = child.options
  }

  // 标准化 props, 将 props 转换成对象的形式，最终得到 res[key] = object 形式
  normalizeProps(child, vm)
  // 标准化 inject, 将 inject 转换成对象的形式，最终得到 res[key] = object 形式
  normalizeInject(child, vm)
  // 标准化 directives, 将 directives 转换成对象的形式，最终得到 res[key] = object 形式
  normalizeDirectives(child)

  // Apply extends and mixins on the child options,
  // but only if it is a raw options object that isn't
  // the result of another mergeOptions call.
  // Only merged options has the _base property.
  // 处理 extends 和 mixins 选项，将处理过的结果合并到 parent 中，处理过的 child 会有 _base 属性
  if (!child._base) {
    if (child.extends) {
      parent = mergeOptions(parent, child.extends, vm)
    }
    if (child.mixins) {
      for (let i = 0, l = child.mixins.length; i < l; i++) {
        parent = mergeOptions(parent, child.mixins[i], vm)
      }
    }
  }

  const options: ComponentOptions = {} as any
  let key
  // 遍历 父选项
  for (key in parent) {
    mergeField(key)
  }
  // 遍历 子选项，如果父选项中没有该选项，则合并，否则跳过
  for (key in child) {
    if (!hasOwn(parent, key)) {
      mergeField(key)
    }
  }
  function mergeField(key: any) {
    const strat = strats[key] || defaultStrat
    options[key] = strat(parent[key], child[key], vm, key)
  }
  return options
}
```

### Vue.component、Vue.directive、Vue.filter

> src/core/global-api/assets.ts

```ts
export const ASSET_TYPES = ["component", "directive", "filter"] as const

ASSET_TYPES.forEach((type) => {
  // 定义了 Vue.component、Vue.directive、Vue.filter 方法
  // @ts-expect-error function is not exact same type
  Vue[type] = function (
    id: string,
    definition?: Function | Object
  ): Function | Object | void {
    // 如果没有定义第二个参数, 则返回对应的 id
    if (!definition) {
      return this.options[type + "s"][id]
    } else {
      /* istanbul ignore if */
      if (__DEV__ && type === "component") {
        validateComponentName(id)
      }
      // 处理组件的定义
      if (type === "component" && isPlainObject(definition)) {
        // @ts-expect-error
        definition.name = definition.name || id
        definition = this.options._base.extend(definition)
      }
      // 处理指令的定义
      if (type === "directive" && isFunction(definition)) {
        definition = { bind: definition, update: definition }
      }
      this.options[type + "s"][id] = definition
      return definition
    }
  }
})
```

### Vue.extend

> src/core/global-api/extend.ts

```ts
Vue.extend = function (extendOptions: any): typeof Component {
  extendOptions = extendOptions || {}
  // 声明一个 Super 变量，指向 Vue 构造函数，即父类
  const Super = this
  const SuperId = Super.cid
  // 缓存构造函数
  const cachedCtors = extendOptions._Ctor || (extendOptions._Ctor = {})
  // 如果缓存中存在，则直接返回
  if (cachedCtors[SuperId]) {
    return cachedCtors[SuperId]
  }

  const name =
    getComponentName(extendOptions) || getComponentName(Super.options)
  if (__DEV__ && name) {
    validateComponentName(name)
  }

  // 定义一个 Sub 构造函数，即子类
  const Sub = function VueComponent(this: any, options: any) {
    // 调用父类的 _init 方法
    this._init(options)
  } as unknown as typeof Component
  // 原型继承，Sub 继承 Super
  Sub.prototype = Object.create(Super.prototype)
  // 将 Sub 构造函数的原型对象的 constructor 属性设置为 Sub 构造函数本身
  Sub.prototype.constructor = Sub
  Sub.cid = cid++
  Sub.options = mergeOptions(Super.options, extendOptions)
  Sub["super"] = Super

  // For props and computed properties, we define the proxy getters on
  // the Vue instances at extension time, on the extended prototype. This
  // avoids Object.defineProperty calls for each instance created.
  // 对于 props 和 computed 属性，我们在扩展时在 Vue 实例上定义代理 getter，
  // 在扩展的原型上。这避免了为每个创建的实例调用 Object.defineProperty。
  if (Sub.options.props) {
    initProps(Sub)
  }
  if (Sub.options.computed) {
    initComputed(Sub)
  }

  // allow further extension/mixin/plugin usage
  // 允许进一步扩展/混合/插件使用
  Sub.extend = Super.extend
  Sub.mixin = Super.mixin
  Sub.use = Super.use

  // create asset registers, so extended classes
  // can have their private assets too.
  // 创建资源注册，以便扩展类也可以拥有它们的私有资源。
  ASSET_TYPES.forEach(function (type) {
    Sub[type] = Super[type]
  })
  // enable recursive self-lookup
  // 启用递归自查找
  if (name) {
    Sub.options.components[name] = Sub
  }

  // keep a reference to the super options at extension time.
  // later at instantiation we can check if Super's options have
  // been updated.
  // 在扩展时保留对 super options 的引用。
  // 稍后在实例化时，我们可以检查 Super 的选项是否已更新。
  Sub.superOptions = Super.options
  Sub.extendOptions = extendOptions
  Sub.sealedOptions = extend({}, Sub.options)

  // cache constructor
  // 缓存构造函数
  cachedCtors[SuperId] = Sub
  return Sub
}
```

### Vue.set

> src/core/observer/index.ts

```ts
export function set(
  target: any[] | Record<string, any>,
  key: any,
  val: any
): any {
  if (__DEV__ && (isUndef(target) || isPrimitive(target))) {
    warn(
      `Cannot set reactive property on undefined, null, or primitive value: ${target}`
    )
  }
  if (isReadonly(target)) {
    __DEV__ && warn(`Set operation on key "${key}" failed: target is readonly.`)
    return
  }
  const ob = (target as any).__ob__
  // 处理数组，本质上是调用 splice 方法
  if (isArray(target) && isValidArrayIndex(key)) {
    target.length = Math.max(target.length, key)
    target.splice(key, 1, val)
    // when mocking for SSR, array methods are not hijacked
    if (ob && !ob.shallow && ob.mock) {
      observe(val, false, true)
    }
    return val
  }
  // 处理对象，如果 key 已经存在，则直接修改值
  if (key in target && !(key in Object.prototype)) {
    target[key] = val
    return val
  }
  if ((target as any)._isVue || (ob && ob.vmCount)) {
    __DEV__ &&
      warn(
        "Avoid adding reactive properties to a Vue instance or its root $data " +
          "at runtime - declare it upfront in the data option."
      )
    return val
  }
  // 如果 target 不是响应式的，则直接赋值
  if (!ob) {
    target[key] = val
    return val
  }
  // 为 target 的 key 重新设置响应式
  defineReactive(ob.value, key, val, undefined, ob.shallow, ob.mock)
  // 通知更新
  ob.dep.notify()
  return val
}
```

### Vue.delete

> src/core/observer/index.ts

```ts
export function del(target: any[] | object, key: any) {
  if (__DEV__ && (isUndef(target) || isPrimitive(target))) {
    warn(
      `Cannot delete reactive property on undefined, null, or primitive value: ${target}`
    )
  }
  // 处理数组，本质上是调用 splice 方法
  if (isArray(target) && isValidArrayIndex(key)) {
    target.splice(key, 1)
    return
  }
  const ob = (target as any).__ob__
  if ((target as any)._isVue || (ob && ob.vmCount)) {
    __DEV__ &&
      warn(
        "Avoid deleting properties on a Vue instance or its root $data " +
          "- just set it to null."
      )
    return
  }
  if (isReadonly(target)) {
    __DEV__ &&
      warn(`Delete operation on key "${key}" failed: target is readonly.`)
    return
  }
  if (!hasOwn(target, key)) {
    return
  }
  // 删除属性，调用的是 delete 操作符
  delete target[key]
  if (!ob) {
    return
  }
  // 通知更新
  ob.dep.notify()
}
```

### Vue.nextTick

> src/core/util/next-tick.ts

```ts
const callbacks: Array<Function> = []
let pending = false

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

let timerFunc

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
