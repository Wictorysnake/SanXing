/*
 * @Author: wictory
 * @Date: 2023-09-13 19:19:52
 * @LastEditors: wictory
 * @LastEditTime: 2023-09-19 13:15:05
 * @Description: file content
 */
const sidebar = require('./config/sidebar/index.js')
// console.log(sidebar)
module.exports = {
  base: "/SanXing/",
  title: "SanXing",
  description: "前端个人博客",
  markdown: {
    lineNumbers: true, // 代码块显示行号
  },
  themeConfig: {
    smoothScroll: true, // 页面滚动
    nav: [
      { text: "博客", link: "/Guide/getting-started" },
      {
        text: "Github",
        link: "https://github.com/Wictorysnake/SanXing",
      },
    ],
    // 侧边栏配置
    // sidebar: [
    //   {
    //     title: "指南",
    //     path: "/Guide/getting-started",
    //     collapsable: true, // 折叠
    //     children: [{ title: "开始", path: "/Guide/getting-started" }],
    //   },
    //   {
    //     title: "HTML",
    //     path: "/HTML/DOCTYPE", // 默认激活的选项
    //     collapsable: true, // 折叠
    //     children: [{ title: "DOCTYPE", path: "/HTML/DOCTYPE" }],
    //   },
    //   {
    //     title: "OperationMaintenance",
    //     path: "/OperationMaintenance/原生之初", // 默认激活的选项
    //     collapsable: true, // 折叠
    //     children: [
    //       { title: "原生之初", path: "/OperationMaintenance/原生之初" },
    //     ],
    //   },
    // ],
    sidebar,
    lastUpdated: "Last Updated", // 最后更新时间
  },
  
  plugins: [
    ["@vuepress/back-to-top", true],
    [
      "@vuepress/pwa",
      {
        serviceWorker: true,
        updatePopup: true,
      },
    ],
    ["@vuepress/medium-zoom", true],
  ],
}
