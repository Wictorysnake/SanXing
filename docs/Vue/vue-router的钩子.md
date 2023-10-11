<!--
 * @Author: wictory
 * @Date: 2023-10-09 15:26:57
 * @LastEditors: wictory
 * @LastEditTime: 2023-10-09 15:47:21
 * @Description: file content
-->

# vue-router 有哪些钩子？使用场景？

## vue-router 的钩子

- 全局守卫
- 路由独享守卫
- 组件内守卫

### 全局守卫

全局守卫就是能监听到全局的 router 动作。

- router.beforeEach 路由前置时触发

```js
const router = new VueRouter({...})
// to 要进入的目标路由对象
// from 当前导航正要离开的路由
// next resolve 这个钩子，next 执行效果其参数决定
// next() 进入管道中的下一个钩子
// next(false) 中断当前导航
// next({path}) 当前导航会中断，跳转到指定 path
// next(error) 中断导航且错误传递给 router.onError()
// 确保前置守卫要调用 next，否则钩子不会进入下一个管道
router.beforeEach((to, from, next) => {
  // ...
})
```

- router.afterEach 路由后置时触发

```js
// 与前置守卫基本相同，不同是没有 next 参数
router.afterEach((to, from) => {
  // ...
})
```

- router.beforeResolve
  跟 router.beforeEach 类似，在所有组件内守卫及异步组件解析后触发。

### 路由独享守卫

参数及意义同全局守卫，只是定义的位置不同。

```js
const router = new VueRouter({
  routes: [
    {
      path: "/",
      components: Demo,
      beforeEnter: (to, from, next) => {
        // ...
      },
      afterEnter: (to, from, next) => {
        // ...
      },
    },
  ],
})
```

### 组件内守卫

```js
const Foo = {
  template: `...`,
  beforeRouteEnter(to, from, next) {
    // 在渲染该组件的对应路由被 confirm 前调用
    // 不！能！获取组件实例 `this`
    // 因为当守卫执行前，组件实例还没被创建
  },
  beforeRouteUpdate(to, from, next) {
    // 在当前路由改变，但是该组件被复用时调用
    // 举例来说，对于一个带有动态参数的路径 /foo/:id，在 /foo/1 和 /foo/2 之间跳转的时候，
    // 由于会渲染同样的 Foo 组件，因此组件实例会被复用。而这个钩子就会在这个情况下被调用。
    // 可以访问组件实例 `this`
  },
  beforeRouteLeave(to, from, next) {
    // 导航离开该组件的对应路由时调用
    // 可以访问组件实例 `this`
  },
}
```

## 使用场景

路由进入前最典型的可以做一些权限控制，路由离开时清除或存储一些信息，任务等等。
