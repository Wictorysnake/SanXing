/*
 * @Author: wictory
 * @Date: 2023-09-14 20:12:05
 * @LastEditors: wictory
 * @LastEditTime: 2023-09-19 12:56:26
 * @Description: file content
 */
const path = require("path")
const { sidebarHelper } = require("../../utils/index.js")

const rootPath = path.dirname(path.dirname(path.dirname(__dirname)))
const ignoreDir = [".vuepress"]

const sidebar = sidebarHelper.genSideBarObj(rootPath, ignoreDir, 'md')
console.log(sidebar)
module.exports = sidebar
