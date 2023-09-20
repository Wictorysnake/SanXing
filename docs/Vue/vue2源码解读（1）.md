## 前期准备

阅读源码，首先就要去[github](https://github.com/vuejs/vue)上将源码下载到本地。本源码基于当时最新的版本：v2.7.14。

源码下载下来之后，安装依赖，安装完成，在<code>package.json</code>中的<code>scripts</code>字段的<code>dev</code>命令中添加<code>--sourcemap</code>，这样在浏览器调试源码时就可以看到当前代码在源码中的位置。

```json
{
  "scripts": {
    "dev": "rollup -w -c scripts/config.js --sourcemap --environment TARGET:full-dev"
  }
}
```

接下来，就可以启动调试：

```shell
pnpm run dev
```

可以看到<code>dist</code>目录下生成了<code>vue.js.map</code>文件即为成功。到此，前期准备工作就已完成。

## 源码目录结构

```scss
|--benchmarks                       性能基准测试
|--compiler-sfc                     ???有待研究
|--dist                             打包产物
|--examples                         示例代码
|--packages                         一些额外的包
|  |--compiler-sfc
|  |--server-renderer
|  |--template-compiler
|--scripts                          配置文件目录，比如rollup的配置文件
|--src                              源码目录
|  |--compiler                      编译器
|  |--core                          运行时核心
|  |  |--components                 全局组件
|  |  |--global-api                 全局 API
|  |  |--instance                   Vue 实例相关的，比如构造函数
|  |  |--observer                   响应式原理
|  |  |--util                       工具方法
|  |  |--vdom                       虚拟 dom 相关，比如 patch
|  |  |--config.js                  一些默认配置
|  |--platforms                     平台相关
|  |  |--web
|  |--v3                            兼容vue3语法
|--test                             测试目录
|--types                            TS 类型声明
```

## Vue 初始化过程

### Vue

> /src/core/instance/index.ts

```ts
import { initMixin } from "./init"

// Vue 构造函数
function Vue(options) {
  // _init 方法定义在 Vue.prototype 上, 该方法是在 initMixin 中定义的
  this._init(options)
}
```

### Vue.prototype.\_init

> /src/core/instance/init.ts

```ts
/**
 *
 * @param Vue Vue 构造函数
 * @description 主要是定义了 Vue.prototype._init 方法
 */
export function initMixin(Vue: typeof Component) {
  Vue.prototype._init = function (options?: Record<string, any>) {
    const vm: Component = this
    // a uid
    vm._uid = uid++

    // a flag to mark this as a Vue instance without having to do instanceof
    // check
    vm._isVue = true
    // avoid instances from being observed
    vm.__v_skip = true
    // effect scope
    vm._scope = new EffectScope(true /* detached */)
    vm._scope._vm = true
    // merge options
    if (options && options._isComponent) {
      // optimize internal component instantiation
      // since dynamic options merging is pretty slow, and none of the
      // internal component options needs special treatment.
      // 优化内部组件实例化，因为动态选项合并非常慢，而且没有内部组件选项需要特殊处理。
      // 子组件初始化时，会走这里，这里只做了性能优化
      // 将组件配置对象上的一些深层次的属性放到 vm.$options 上，提高代码的执行效率
      initInternalComponent(vm, options as any)
    } else {
      // 将用户传递的 options 和 Vue.options 合并，得到 vm.$options
      // 初始化根组件时，会走这里。主要做了选项合并，合并 Vue 的全局配置到根组件的局部配置上，比如 Vue.component 注册的全局组件会合并到根组件的 components 选项中
      vm.$options = mergeOptions(
        resolveConstructorOptions(vm.constructor as any),
        options || {},
        vm
      )
    }
    /* istanbul ignore else */
    if (__DEV__) {
      // 设置代理，将 vm 上的属性代理到 vm._renderProxy 上，这样就可以通过 vm._renderProxy 访问到 vm 上的属性，这里主要是为了性能考虑
      initProxy(vm)
    } else {
      vm._renderProxy = vm
    }
    // expose real self
    vm._self = vm
    // 主要是初始化了 vm 的关系属性，比如 $parent、$root、$children 和 $refs 等
    initLifecycle(vm)
    // 主要是初始化了 vm 的事件监听器，父组件绑定在当前组件上的事件
    initEvents(vm)
    // 解析 options._renderChildren，得到 vm.$slots；定义了 vm._c 和 vm.$createElement，它们都是调用 createElement 方法，只不过第二个参数不同；定义了 vm.$attrs 和 vm.$listeners，它们都是调用 resolveScopedSlots 方法，只不过第二个参数不同
    initRender(vm)
    // 调用 beforeCreate 钩子函数
    callHook(vm, "beforeCreate", undefined, false /* setContext */)
    // 解析 inject 配置项，得到 result[key] = val 的配置对象，并对 key 做了响应式处理，这样就可以通过 vm.key 访问到 result[key] 的值了
    initInjections(vm) // resolve injections before data/props
    // 响应式原理入口，处理了 props、methods、data、computed 和 watch 选项
    initState(vm)
    // 解析 options.provide，得到 provided，然后遍历 provided，将 provided[key] 的属性描述符定义到 vm._provided[key] 上
    // 主要是初始化了 vm._provided
    initProvide(vm) // resolve provide after data/props
    // 调用 created 钩子函数
    callHook(vm, "created")

    // 如果用户传入了 el 选项，则自动调用 $mount 方法，挂载 DOM
    if (vm.$options.el) {
      vm.$mount(vm.$options.el)
    }
  }
}
```

### initInternalComponent

> /src/core/instance/init.ts

```ts
export function initInternalComponent(
  vm: Component,
  options: InternalComponentOptions
) {
  // 基于构造函数上的 options 属性创建一个新的对象，并赋值给 vm.$options
  const opts = (vm.$options = Object.create((vm.constructor as any).options))
  // doing this because it's faster than dynamic enumeration.
  // 将构造函数选项上的属性赋值给 vm.$options，这样就可以通过 vm.$options 访问到构造函数选项上的属性，提高性能
  const parentVnode = options._parentVnode
  opts.parent = options.parent
  opts._parentVnode = parentVnode

  const vnodeComponentOptions = parentVnode.componentOptions!
  opts.propsData = vnodeComponentOptions.propsData
  opts._parentListeners = vnodeComponentOptions.listeners
  opts._renderChildren = vnodeComponentOptions.children
  opts._componentTag = vnodeComponentOptions.tag

  // 如果 options 有 render 函数，则将其赋值给 vm.$options
  if (options.render) {
    opts.render = options.render
    opts.staticRenderFns = options.staticRenderFns
  }
}
```

### resolveConstructorOptions

> /src/core/instance/init.ts

```ts
export function resolveConstructorOptions(Ctor: typeof Component) {
  let options = Ctor.options
  if (Ctor.super) {
    // 存在基类，递归解析基类构造函数的选项
    const superOptions = resolveConstructorOptions(Ctor.super)
    const cachedSuperOptions = Ctor.superOptions
    if (superOptions !== cachedSuperOptions) {
      // super option changed,
      // need to resolve new options.
      // 说明基类构造函数选项已经发生改变，需要重新设置
      Ctor.superOptions = superOptions
      // check if there are any late-modified/attached options (#4976)
      // 检查 Ctor.options 上是否有任何后期修改/附加的选项（＃4976）
      const modifiedOptions = resolveModifiedOptions(Ctor)
      // update base extend options
      // 如果存在被修改或增加的选项，则合并两个选项
      if (modifiedOptions) {
        extend(Ctor.extendOptions, modifiedOptions)
      }
      // 选项合并，将合并结果赋值为 Ctor.options
      options = Ctor.options = mergeOptions(superOptions, Ctor.extendOptions)
      if (options.name) {
        options.components[options.name] = Ctor
      }
    }
  }
  return options
}
```

### resolveModifiedOptions

> /src/core/instance/init.ts

```ts
function resolveModifiedOptions(
  Ctor: typeof Component
): Record<string, any> | null {
  let modified
  // 构造函数选项
  const latest = Ctor.options
  // 密封的构造函数选项，备份
  const sealed = Ctor.sealedOptions
  // 对比两个选项，记录不一致的选项
  for (const key in latest) {
    if (latest[key] !== sealed[key]) {
      if (!modified) modified = {}
      modified[key] = latest[key]
    }
  }
  return modified
}
```

### mergeOptions

> /src/core/util/options.ts

```ts
/**
 * Merge two option objects into a new one.
 * Core utility used in both instantiation and inheritance.
 * 合并两个选项，出现相同配置项时，子选项会覆盖父选项的配置
 */
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
  // 合并选项，childVal 优先级高于 parentVal
  function mergeField(key: any) {
    const strat = strats[key] || defaultStrat
    // 值为如果 childVal 存在则优先使用 childVal，否则使用 parentVal
    options[key] = strat(parent[key], child[key], vm, key)
  }
  return options
}
```

### initInjections

> /src/core/instance/inject.ts

```ts
// 解析 inject，得到 result，然后遍历 result，对 result 的每个 key 调用 defineReactive 方法，这样就可以通过 vm.key 访问到 result[key] 的值了
export function initInjections(vm: Component) {
  const result = resolveInject(vm.$options.inject, vm)
  if (result) {
    toggleObserving(false)
    Object.keys(result).forEach((key) => {
      /* istanbul ignore else */
      if (__DEV__) {
        defineReactive(vm, key, result[key], () => {
          warn(
            `Avoid mutating an injected value directly since the changes will be ` +
              `overwritten whenever the provided component re-renders. ` +
              `injection being mutated: "${key}"`,
            vm
          )
        })
      } else {
        defineReactive(vm, key, result[key])
      }
    })
    toggleObserving(true)
  }
}
```

### resolveInject

> /src/core/instance/inject.ts

```ts
// 遍历 inject, 从 vm._provided 中取值，如果取不到值，就取 inject[key].default 的值，如果 inject[key].default 是函数，就执行函数，否则直接返回 inject[key].default 的值
// 得到 result[key] = val 的结果，最后返回 result
export function resolveInject(
  inject: any,
  vm: Component
): Record<string, any> | undefined | null {
  if (inject) {
    // inject is :any because flow is not smart enough to figure out cached
    const result = Object.create(null)
    const keys = hasSymbol ? Reflect.ownKeys(inject) : Object.keys(inject)

    for (let i = 0; i < keys.length; i++) {
      const key = keys[i]
      // #6574 in case the inject object is observed...
      if (key === "__ob__") continue
      const provideKey = inject[key].from
      if (provideKey in vm._provided) {
        result[key] = vm._provided[provideKey]
      } else if ("default" in inject[key]) {
        const provideDefault = inject[key].default
        result[key] = isFunction(provideDefault)
          ? provideDefault.call(vm)
          : provideDefault
      } else if (__DEV__) {
        warn(`Injection "${key as string}" not found`, vm)
      }
    }
    return result
  }
}
```

### initProvide

> /src/core/instance/inject.ts

```ts
// 解析 options.provide，得到 provided，然后遍历 provided，将 provided[key] 的属性描述符定义到 vm._provided[key] 上
export function initProvide(vm: Component) {
  const provideOption = vm.$options.provide
  if (provideOption) {
    const provided = isFunction(provideOption)
      ? provideOption.call(vm)
      : provideOption
    if (!isObject(provided)) {
      return
    }
    const source = resolveProvided(vm)
    // IE9 doesn't support Object.getOwnPropertyDescriptors so we have to
    // iterate the keys ourselves.
    const keys = hasSymbol ? Reflect.ownKeys(provided) : Object.keys(provided)
    for (let i = 0; i < keys.length; i++) {
      const key = keys[i]
      Object.defineProperty(
        source,
        key,
        Object.getOwnPropertyDescriptor(provided, key)!
      )
    }
  }
}
```

过程具体看源码注释，这里只做总结：

- 处理组件配置项
  - 初始化子组件时，做了性能优化，将配置项的深层次的属性放到 vm.$options 上，提高了代码执行效率
  - 初始化根组件时，做了选项合并，将全局配置合并到根组件的局部配置中，比如 Vue.component 注册的全局组件会合并到根组件的 components 选项中
- 初始化实例的关系属性等，比如 $parent、$root、$children 和 $refs 等
- 初始化自定义事件
- 解析配置项，得到 vm.$slots，定义了 vm._c 和 vm.$createElement
- 调用 beforeCreate 钩子函数
- 解析配置项的 inject 属性，得到 result[key] = val 的配置对象，并对 key 做了响应式处理，这样就可以通过 vm.key 访问到 result[key] 的值了
- 数据响应式，处理了 props、methods、data、computed 和 watch
- 解析配置项的 provide 属性，最终得到 vm.\_provided
- 调用 created 钩子函数
- 如果配置项上存在 $el 属性，则自动调用 $mount 方法
- 接下来进入挂载阶段

## 思考

provide/inject 原理：说白了，就是根据子组件中的 inject key 值去 vm.\_provided 对象上找，如果匹配，即返回 inject key 对应的值。

beforeCreate 和 created 钩子函数的区别：beforeCreate 之前只做了一些初始化工作，主要是初始化了关系属性，如 $parent、$root、$children 和 $refs等，初始化了自定义事件，定义了vm.$slots，vm.$scopedSlots，vm._c，vm.$createElement 方法，故而此时并不能访问 data 等属性，因此如果想要改变 data 中的值，须加 $nextTick，而 created 时，已经处理了 props、methods、data、computed 和 watch，故而可以操作 data。
