/*
 * @Author: wictory
 * @Date: 2023-09-18 15:57:57
 * @LastEditors: wictory
 * @LastEditTime: 2023-09-19 13:14:36
 * @Description: file content
 */
const path = require("path")
const fs = require("fs")

// 文件助手工具类
const fileHelper = {
  /**
   * @description: 获取目录下所有文件路径
   * @param {String} rpath 目录路径
   * @param {Array} ignoreDir 忽略的目录
   * @param {Array} suffixIncludes 需要处理的文件后缀
   * @returns {Array} 目录下所有文件路径
   */
  getAllFiles: function getAllFiles(rpath, ignoreDir, suffixIncludes) {
    let items = fs.readdirSync(rpath)
    let result = []
    items.map((item) => {
      const temp = path.join(rpath, item)
      if (
        fs.statSync(temp).isFile() &&
        !ignoreDir.includes(item) &&
        suffixIncludes.includes(item.split(".")[1])
      ) {
        let filename = ""
        if (item === "README.md" || item === "readme.md") {
          filename = ""
        } else {
          filename = item.split(".")[0]
        }
        result.push(filename)
      }
    })
    return result
  },
  /**
   * @description: 获取目录下所有文件夹路径
   * @param {String} rpath 目录路径
   * @param {Array} ignoreDir 忽略的目录
   * @returns {Array} 目录下所有文件夹路径
   */
  getAllDirs: function getAllDirs(rpath, ignoreDir) {
    // 获取目录数据
    const items = fs.readdirSync(rpath)

    // 若在 docs 目录下执行，得到的 items 为 [ '.vuepress', 'Guide', 'HTML', 'OperationMaintenance', 'README.md' ]
    // console.log(items)

    let result = []

    items.map((item) => {
      const temp = path.join(rpath, item)
      if (fs.statSync(temp).isDirectory() && !ignoreDir.includes(item)) {
        result.push(`${rpath}\\${item}\\`)
        result = result.concat(getAllDirs(temp, ignoreDir))
      }
    })

    return result
  },
}

// 侧边栏创建工具类
const sidebarHelper = {
  // 简单的分组
  genSideBar(rpath, ignoreDir, suffixIncludes) {
    let sidebar = {}
    const dirs = fileHelper.getAllDirs(rpath, ignoreDir)
    dirs.map((dir) => {
      let dirFiles = fileHelper.getAllFiles(dir, ignoreDir, suffixIncludes)
      let dirName = dir.replace(rpath, "").replace(/\\/g, "/")
      if (dirFiles.length) {
        sidebar[dirName] = dirFiles
      }
    })
    return sidebar
  },
  // 复杂的分组
  genGroupSideBar(rootpath, ignoreDir, suffixIncludes) {
    const dirData = readDirToObjTree(rootpath, ignoreDir, suffixIncludes)
    // console.log(dirData)
    const sidebar = []
    const recursive = (rpath, data) => {
      const _data = []
      data.forEach((item) => {
        const temp = `${rpath}/${item.name}`
        if (item.isDir) {
          _data.push({
            title: item.name,
            collapsable: true,
            children: recursive(temp, item.children),
          })
          return
        }
        if (item.name === "README.md" || item.name === "readme.md") {
          _data.unshift(["", "开始"])
          return
        }
        _data.push([temp, item.name.slice(0, item.name.lastIndexOf("."))])
      })
      return _data
    }
    dirData.forEach((item) => {
      const path = `/${item.name}`
      let obj = {
        title: item.name.replace('.md', ''),
        collapsable: true,
        sidebarDepth: 2,
      }
      if (item.isDir) {
        obj.children = recursive(path, item.children)
      }
      if (item.name === "README.md" || item.name === "readme.md") {
        // 根目录的 readme 不做处理
      } else {
        sidebar.push(obj)
      }
    })
    return sidebar
  },
  // genGroupSideBar(rootpath, ignoreDir, suffixIncludes) {
  //   let sidebar = []
  //   let allDirs = fileHelper.getAllDirs(rootpath, ignoreDir)
  //   allDirs.forEach((dir) => {
  //     let children = fileHelper.getAllFiles(dir, ignoreDir, suffixIncludes)
  //     let dirName = dir.replace(rootpath, "").replace(/\\/g, "/")
  //     let title = dir.replace(rootpath, "").replace(/\\/g, "")
  //     if (children.length > 1) {
  //       children = children.flatMap((vo) => [[dirName + vo, vo]])
  //     }
  //     let obj = {
  //       title,
  //       collapsable: true,
  //       sidebarDepth: 2,
  //       children: children.length > 1 ? children : [dirName],
  //     }
  //     sidebar.push(obj)
  //   })
  //   return sidebar
  // },
  /**
   * @description: 生成侧边栏
   * @param {String} rpath 目录路径
   * @param {Array} ignoreDir 忽略的目录
   * @param {Array} suffixIncludes 需要处理的文件后缀
   * @returns [Object] 侧边栏对象数组
   * @example
   * [
   *   {
   *     title: '指南',
   *     collapsable: true,
   *     children: [
   *       { title: '开始', path: '/Guide/getting-started' }
   *     ]
   *   },
   * ]
   */
  genSideBarObj(rootpath, ignoreDir, suffixIncludes) {
    const sidebar = []
    
    function recursive(rpath, data) {
      const items = fs.readdirSync(rpath)

      items.forEach((item) => {
        const temp = path.join(rpath, item)
        const isDir = fs.statSync(temp).isDirectory()

        if (isDir && !ignoreDir.includes(item)) {
          data.push({
            title: item,
            // path: `/${item}/`,
            collapsable: true,
            children: recursive(temp, []),
          })
        } else if (!isDir && suffixIncludes.includes(item.split(".")[1])) {
          if (item === "README.md" || item === "readme.md") {
            if (rootpath === rpath) return
            data.unshift({
              title: "开始",
              path: ``,
            })
            return
          }
          const basename = path.basename(rpath)
          const title = item.split(".")[0]
          data.push({
            title,
            path: `/${basename}/${title}`,
          })
        }
      })
      // console.log(data)
      return data
    }

    recursive(rootpath, sidebar)
    return sidebar
  },
}

function readDirToObjTree(rootpath, ignoreDir, suffixIncludes) {
  let result = []

  const recursive = (rpath, data) => {
    const items = fs.readdirSync(rpath)

    items.map((item) => {
      let temp = path.join(rpath, item)
      let isDir = fs.statSync(temp).isDirectory()

      if (isDir && !ignoreDir.includes(item)) {
        data.push({
          name: item,
          children: [],
          path: `${rpath}/${item}`,
          isDir,
        })
      } else if (!isDir && suffixIncludes.includes(item.split(".")[1])) {
        data.push({
          name: item,
          isDir,
        })
      }
    })

    data.forEach((item) => {
      if (item.isDir) {
        recursive(item.path, item.children)
      }
    })
  }

  recursive(rootpath, result)

  return result
}

module.exports = {
  fileHelper,
  sidebarHelper,
}
