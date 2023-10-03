<!--
 * @Author: wictory
 * @Date: 2023-10-03 15:19:37
 * @LastEditors: wictory
 * @LastEditTime: 2023-10-03 15:25:04
 * @Description: file content
-->
# Vue.use 中都发生了什么？

详见：[vue2 源码解读（4）](./vue2源码解读（4）.md)

## 总结

Vue.use() 的作用是注册插件，它做了以下几件事：

1. 判断插件是否已经被注册过，如果注册过则直接结束
2. 如果没有注册过，则判断插件是否有 install 方法
3. 有则执行 install 方法，没有则将插件本身作为 install 方法，第一个参数始终为 Vue 对象
4. 执行完 install 方法后，将插件添加到 Vue 的 \_installedPlugins 属性上，用来标记该插件已经被注册过
5. 最后返回 Vue 以便链式调用
