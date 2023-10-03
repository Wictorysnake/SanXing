<!--
 * @Author: wictory
 * @Date: 2023-10-03 15:30:00
 * @LastEditors: wictory
 * @LastEditTime: 2023-10-03 15:32:30
 * @Description: file content
-->
# Vue 中的 nextTick 如何理解？

详见：[vue2 源码解读（4）](./vue2源码解读（4）.md)

## 总结

nextTick 会将回调函数放入 callbacks 数组中，然后调用 timerFunc 方法，该方法会将 flushCallbacks 方法放入微任务队列中，等待浏览器空闲时执行。flushCallbacks 方法会遍历 callbacks 数组，执行每一个回调函数。
