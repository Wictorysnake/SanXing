# 测试-jest 篇

## 1. jest 简介

Jest 是 Facebook 推出的一款开源的 JavaScript 测试框架，它自动集成了断言、JSDOM、覆盖率报告等功能，使用起来非常简单。

## 2. 安装

```bash
npm i -D jest
```

## 3. 配置

在项目根目录下创建 `jest.config.js` 文件，内容如下：

```js
module.exports = {
  // 指定测试环境
  testEnvironment: "jsdom",
  // 指定测试文件匹配规则
  testMatch: ["**/__tests__/**/*.[jt]s?(x)"],
  // 指定测试文件忽略规则
  testPathIgnorePatterns: ["/node_modules/"],
  // 指定测试文件后缀名
  moduleFileExtensions: ["js", "jsx", "ts", "tsx"],
  // 指定测试文件覆盖率报告
  collectCoverage: true,
  // 指定测试文件覆盖率报告忽略规则
  coveragePathIgnorePatterns: ["/node_modules/"],
  // 指定测试文件覆盖率报告目录
  coverageDirectory: "coverage",
  // 指定测试文件覆盖率报告阈值
  coverageThreshold: {
    global: {
      branches: 80,
      functions: 80,
      lines: 80,
      statements: 80,
    },
  },
}
```

## 4. 测试

在项目根目录下创建 `__tests__` 目录，然后在该目录下创建 `index.test.js` 文件，内容如下：

```js
import { sum } from "../src/index"

test("adds 1 + 2 to equal 3", () => {
  expect(sum(1, 2)).toBe(3)
})
```

然后在 `package.json` 中添加如下配置：

```json
{
  "scripts": {
    "test": "jest"
  }
}
```

最后执行 `npm run test` 即可。

## 5. 参考

- [Jest](https://jestjs.io/zh-Hans/)
