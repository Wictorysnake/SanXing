<!--
 * @Author: wictory
 * @Date: 2023-09-24 15:43:59
 * @LastEditors: wictory
 * @LastEditTime: 2023-09-24 15:51:59
 * @Description: file content
-->

# Vue-Router 有几种模式？如何实现？

## Vue-Router 有几种模式？

- hash 模式：使用 URL 的 hash 来模拟一个完整的 URL，于是当 URL 改变时，页面不会重新加载
- history 模式：使用 HTML5 History API 来完成 URL 跳转而无须重新加载页面

## 如何实现？

- hash 模式：利用 onhashchange 事件监听 URL 的变化，从而进行跳转

```js
class Routers {
  constructor() {
    this.routes = {}
    this.currentUrl = ""
    this.refresh = this.refresh.bind(this)
    window.addEventListener("load", this.refresh, false)
    window.addEventListener("hashchange", this.refresh, false)
  }
  route(path, callback) {
    this.routes[path] = callback || function () {}
  }
  refresh() {
    this.currentUrl = location.hash.slice(1) || "/"
    this.routes[this.currentUrl]()
  }
}

window.Router = new Routers()
const content = document.querySelector("body")
function changeBgColor(color) {
  content.style.backgroundColor = color
}
Router.route("/", function () {
  changeBgColor("yellow")
})
Router.route("/blue", function () {
  changeBgColor("blue")
})
Router.route("/green", function () {
  changeBgColor("green")
})
```

- history 模式：利用 HTML5 History API 中的 pushState() 和 replaceState() 方法来完成 URL 跳转而无须重新加载页面

```js
class Routers {
  constructor() {
    this.routes = {}
    this.listenPopState()
  }
  route(path, callback) {
    this.routes[path] = callback || function () {}
  }
  push(path) {
    history.pushState({ path }, null, path)
    this.routes[path] && this.routes[path]()
  }
  listenPopState() {
    window.addEventListener("popstate", (e) => {
      const path = e.state && e.state.path
      this.routes[path] && this.routes[path]()
    })
  }
}

window.Router = new Routers()
const content = document.querySelector("body")
function changeBgColor(color) {
  content.style.backgroundColor = color
}
Router.route("/", function () {
  changeBgColor("yellow")
})
Router.route("/blue", function () {
  changeBgColor("blue")
})
Router.route("/green", function () {
  changeBgColor("green")
})
```

## 注意点

hash 模式 url 中会带有 # 号，破坏 url 整体的美观性， history 模式需要后端配置支持，否则刷新会返回 404。
