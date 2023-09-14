/*
 * @Author: wictory
 * @Date: 2023-09-13 19:19:52
 * @LastEditors: wictory
 * @LastEditTime: 2023-09-14 17:47:32
 * @Description: file content
 */
module.exports = {
  base: "/SanXing/",
  title: "SanXing",
  description: "前端个人博客",
  themeConfig: {
    nav: [
      { text: "博客", link: "/" },
      {
        text: "Github",
        link: "https://github.com/Wictorysnake/SanXing",
      },
    ],
    // 侧边栏配置
    sidebar: [
      {
        title: "指南",
        path: "/",
      },
      {
        title: "HTML",
        path: "/HTML/DOCTYPE", // 默认激活的选项
        collapsable: true, // 折叠
        children: [{ title: "DOCTYPE", path: "/HTML/DOCTYPE" }],
      },
      {
        title: "OperationMaintenance",
        path: "/OperationMaintenance/原生之初", // 默认激活的选项
        collapsable: true, // 折叠
        children: [
          { title: "原生之初", path: "/OperationMaintenance/原生之初" },
        ],
      },
    ],
  },
}
