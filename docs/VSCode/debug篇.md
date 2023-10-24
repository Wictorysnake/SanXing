# VSCode-debug 篇

## 1. 前言

VSCode 是一款非常优秀的编辑器，它的插件生态也非常丰富，可以满足大部分开发者的需求。本文主要介绍 VSCode 的调试功能，以及如何调试 Node.js、TypeScript 等项目。

## 2. 正文

1. 首先确保本机已安装 Node.js。
2. 找到要调试的项目，执行 `npm init -y` 初始化项目，然后执行 `npm i -D typescript ts-node` 安装 TypeScript 依赖。
3. 在 `src` 目录下新增 `ts` 文件（ps: 目录没创的自己创下，ts 文件内容随意）。
4. 在 VSCode 中点击左侧的调试工具栏，选择“显示所有自动调试配置”，点击“添加配置”。
5. 选择 Node.js。
6. 之后在项目根目录下，默认会创建一个.vscode 的目录，下面包括一个名为 launch.
   json 文件。修改其内容如下：

```json
{
  // Use IntelliSense to learn about possible attributes.
  // Hover to view descriptions of existing attributes.
  // For more information, visit: https://go.microsoft.com/fwlink/?linkid=830387
  "version": "0.2.0",
  "configurations": [
    {
      "type": "node",
      "request": "launch",
      "name": "调试ts",
      "program": "${workspaceFolder}/node_modules/ts-node/dist/bin.js",
      "args": ["--esm", "${relativeFile}"],
      "cwd": "${workspaceFolder}"
    }
  ]
}

ps： args中的--esm是为了支持ES6的模块化语法，也就是用到了import和export。
```

7. 根目录下，我们创建一个名为 `tsconfig.json` 的文件，内容如下：

```json
{

  "compilerOptions": {
    "module": "commonjs",
    "target": "es6",
    "noImplicitAny": true,
    "outDir": "./dist",
    "sourceMap": true
  },

  "include": [
    "src/**/*"
  ]
}

ps: 如果遇到 `TypeError [ERR_UNKNOWN_FILE_EXTENSION]: Unknown file extension “.ts” for xxx.ts` 的错误，可以在上述的"compilerOptions"中添加如下配置：
{
  "noEmit": true,
  "allowImportingTsExtensions": true
}
```

8. 打开某个 ts 文件，在需要跟踪调试的代码行前面点击下会出现一个小红点，说明成功创建了一个断点。
9. 左侧工具栏中点击调试按钮，在运行和调试右侧出现一个绿色三角形，点击开始调试。
10. 测试程序会停止在刚设置断点的地方，并且上方会出现一个调试工具栏面板。
11. 调试过程中，可以在监视选项中添加要跟踪监视的变量。
12. 单步调试过程中，我们也可以将鼠标移入到程序变量上查看变量的值。

## 3. 参考

- [【TypeScript】在 ts 文件中导入其它模块，报错：Unknown file extension “.ts“ for XXX.ts](https://blog.csdn.net/qq_28255733/article/details/132738770)
- [Visual Studio Code 中配置并调试 TypeScript 代码](https://baijiahao.baidu.com/s?id=1725357374176756545&wfr=spider&for=pc)
- [VsCode 各场景高级调试技巧！](https://blog.csdn.net/cqcre/article/details/128024692)
