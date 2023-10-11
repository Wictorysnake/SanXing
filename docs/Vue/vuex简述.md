# 什么情况下适合使用 vuex，vuex 使用中有几个步骤？

## vuex 定义

引用官网的话：

> Vuex 是一个专为 Vue.js 应用程序开发的状态管理模式。它采用集中式存储管理应用的所有组件的状态，并以相应的规则保证状态以一种可预测的方式发生变化。

背后思想：

当我们的应用遇到多个组件共享状态时，单向数据流的简洁性很容易被破坏：

- 多个视图依赖于同一状态。
- 来自不同视图的行为需要变更同一状态。

对于问题一，传参的方法对于多层嵌套的组件将会非常繁琐，并且对于兄弟组件间的状态传递无能为力。对于问题二，我们经常会采用父子组件直接引用或者通过事件来变更和同步状态的多份拷贝。以上的这些模式非常脆弱，通常会导致无法维护的代码。

因此，我们为什么不把组件的共享状态抽取出来，以一个全局单例模式管理呢？在这种模式下，我们的组件树构成了一个巨大的“视图”，不管在树的哪个位置，任何组件都能获取状态或者触发行为！

通过定义和隔离状态管理中的各种概念并通过强制规则维持视图和状态间的独立性，我们的代码将会变得更结构化且易维护。

## 什么情况下使用？

Vuex 可以帮助我们管理共享状态，并附带了更多的概念和框架。这需要对短期和长期效益进行权衡。

如果您不打算开发大型单页应用，使用 Vuex 可能是繁琐冗余的。确实是如此——如果您的应用够简单，您最好不要使用 Vuex。一个简单的 store 模式就足够您所需了。但是，如果您需要构建一个中大型单页应用，您很可能会考虑如何更好地在组件外部管理状态，Vuex 将会成为自然而然的选择。引用 Redux 的作者 Dan Abramov 的话说就是：

> Flux 架构就像眼镜：您自会知道什么时候需要它。

## 使用步骤

先看一张图：

<img :src="$withBase('/Vue/vuex.png')" alt="vuex">

从图中可知 vuex 包含了 3 个关键词：

- state
- mutations
- actions

### state

字面意思就是状态。可以理解为全局的数据。

组件中获取 state 的方式：

```js
const Counter = {
  template: `<div>{{ count }}</div>`,
  computed: {
    count () {
      return store.state.count
    }
  }
}

// 也可以通过 mapState 辅助函数
computed: mapState({
  count: state => state.count,
  // 传字符串参数 'count' 等同于 `state => state.count`
  countAlias: 'count',
  // 为了能够使用 `this` 获取局部状态，必须使用常规函数
  countPlusLocalState(state) {
    return state.count + this.localCount
  }
})

// 引入多个 state 可以通过对象展开运算符
computed: {
  localComputed () { /* ... */ },
  // 使用对象展开运算符将此对象混入到外部对象中
  ...mapState({
    // ...
  })
}
```

### mutations

更改 Vuex 的 store 中的状态的唯一方法是提交 mutation。Vuex 中的 mutation 非常类似于事件：每个 mutation 都有一个字符串的 事件类型 (type) 和 一个 回调函数 (handler)。这个回调函数就是我们实际进行状态更改的地方，并且它会接受 state 作为第一个参数：

```js
const store = new Vuex.Store({
  state: {
    count: 1,
  },
  mutations: {
    increment(state) {
      // 变更状态
      state.count++
    },
  },
})
```

使用方式:

```js
store.commit('increment')

// 也可以通过 mapMutations 辅助函数
methods: {
  ...mapMutations([
    'increment', // 将 `this.increment()` 映射为 `this.$store.commit('increment')`

    // `mapMutations` 也支持载荷：
    'incrementBy' // 将 `this.incrementBy(amount)` 映射为 `this.$store.commit('incrementBy', amount)`
  ]),
  ...mapMutations({
    add: 'increment' // 将 `this.add()` 映射为 `this.$store.commit('increment')`
  })
}
```

Mutation 需遵守 Vue 的响应规则：

1. 最好提前在你的 store 中初始化好所有所需属性。

2. 当需要在对象上添加新属性时，你应该

- 使用 Vue.set(obj, 'newProp', 123), 或者

- 以新对象替换老对象。例如，利用对象展开运算符，我们可以这样写：

```js
state.obj = { ...state.obj, newProp: 123 }
```

mutation **必须是同步函数**。如果是异步的，就无法知道状态是何时更新的，也就无法很好的进行状态跟踪，给调试带来困难。

### actions

Action 类似于 mutation，不同在于：

- Action 提交的是 mutation，而不是直接变更状态。
- Action 可以包含任意异步操作。

让我们来注册一个简单的 action：

```js
const store = new Vuex.Store({
  state: {
    count: 0,
  },
  mutations: {
    increment(state) {
      state.count++
    },
  },
  actions: {
    increment(context) {
      context.commit("increment")
    },
  },
})
```

Action 函数接受一个与 store 实例具有相同方法和属性的 context 对象，因此你可以调用 context.commit 提交一个 mutation，或者通过 context.state 和 context.getters 来获取 state 和 getters

使用方式：

```js
store.dispatch('increment')

// 也可以通过 mapActions 辅助函数
methods: {
  ...mapActions([
    'increment', // 将 `this.increment()` 映射为 `this.$store.dispatch('increment')`

    // `mapActions` 也支持载荷：
    'incrementBy' // 将 `this.incrementBy(amount)` 映射为 `this.$store.dispatch('incrementBy', amount)`
  ]),
  ...mapActions({
    add: 'increment' // 将 `this.add()` 映射为 `this.$store.dispatch('increment')`
  })
}

// 支持异步
actions: {
  incrementAsync ({ commit }) {
    setTimeout(() => {
      commit('increment')
    }, 1000)
  }
}
```

## 总结

vuex 是一种状态管理机制，将全局组件的共享状态抽取出来作为一个 store，以一个单例模式存在，应用任何一个组件都可以使用，vuex 更改 state 的唯一途径是通过提交 mutation，action 实际是提交 mutation，mutation 处理同步任务，action 处理异步任务。
