<!--
 * @Author: wictory
 * @Date: 2023-09-24 15:52:37
 * @LastEditors: wictory
 * @LastEditTime: 2023-09-24 16:08:18
 * @Description: file content
-->

# vue 中 keep-alive 怎么理解？

## keep-alive

keep-alive 是 Vue 内置的一个组件，可以使被包含的组件保留状态，避免重新渲染

## 使用场景

- 保留组件状态，避免重新渲染
- 保留组件状态，避免重新请求接口

## 原理

keep-alive 组件包含两个生命周期钩子函数：activated 和 deactivated，分别会在组件被激活和被移除时调用

- activated：被 keep-alive 缓存的组件激活时调用
- deactivated：被 keep-alive 缓存的组件停用时调用

## 用法

```html
<template>
  <div>
    <keep-alive>
      <router-view v-if="$route.meta.keepAlive"></router-view>
    </keep-alive>
    <router-view v-if="!$route.meta.keepAlive"></router-view>
  </div>
</template>

<script>
  export default {
    name: "App",
  }
</script>
```

## 参数

- include：字符串或正则表达式。只有匹配的组件会被缓存
- exclude：字符串或正则表达式。任何匹配的组件都不会被缓存
- max：数字。最多可以缓存多少组件实例

例子：

```html
<!-- 只缓存组件 name 为 a 或 b 的组件 -->
<keep-alive include="a,b">
  <component :is="currentView"></component>
</keep-alive>

<!-- 缓存所有组件，除了 name 为 c 的组件 -->
<keep-alive exclude="c">
  <component :is="currentView"></component>
</keep-alive>

<!-- 只缓存组件 name 为 a 或 b 的组件，且最多缓存 10 个组件实例 -->
<keep-alive include="a,b" :max="10">
  <component :is="currentView"></component>
</keep-alive>

<!-- 如果同时使用 include 和 exclude，那么 exclude 优先级会高于 include，下面的例子也就是只缓存 a 组件 -->
<keep-alive include="a,b" exclude="b">
  <component :is="currentView"></component>
</keep-alive>
```
