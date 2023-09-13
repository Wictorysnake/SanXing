#!/usr/bin/env sh
###
 # @Author: wictory
 # @Date: 2023-09-13 20:35:57
 # @LastEditors: wictory
 # @LastEditTime: 2023-09-14 00:35:16
 # @Description: file content
### 

# 确保脚本抛出遇到的错误
set -e

# 生成静态文件
npm run docs:build

# 进入生成的文件夹
cd docs/.vuepress/dist

# 如果是发布到自定义域名
# echo 'www.example.com' > CNAME

git add -A
git commit -m 'deploy'

# 如果发布到 https://<USERNAME>.github.io
# git push -f git@github.com:<USERNAME>/<USERNAME>.github.io.git master

# 如果发布到 https://<USERNAME>.github.io/<REPO>
git push -f git@github.com:Wictorysnake/SanXing.git main:gh-pages

cd -