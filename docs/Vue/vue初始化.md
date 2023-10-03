<!--
 * @Author: wictory
 * @Date: 2023-10-03 15:26:21
 * @LastEditors: wictory
 * @LastEditTime: 2023-10-03 15:28:33
 * @Description: file content
-->
# new Vue() 中发生了什么？

详见：[vue2 源码解读（1）](./vue2源码解读（1）.md)

## 总结

new Vue() 的作用是初始化一个 Vue 实例，它做了以下几件事：

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
