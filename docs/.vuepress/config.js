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
    ],
  },
}
