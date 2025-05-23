---
author: "Shuey Yuen"
date: 2020-02-16
title: "WASM学习笔记"
description: 因为项目的一些需求,打算学习WASM来完善项目的性能方面的缺陷.
tags: [
    "WASM", "C++", "Emscripten"
]
categories: [
    "Web",
]
cover: '/images/2020/0216/title-bg.jpg'
cover_author: 海島千本
cover_source: https://www.pixiv.net/artworks/25340935
---

## 安装准备
- Git. Linux和OS X系统自带Git.这里可以参考这篇博客[Windows下安装Git](https://www.cnblogs.com/wj-1314/p/7993819.html). 安装后可以使用检查是否安装正确.
```bash
> git --version
git version 2.24.0.windows.2
```
- CMake. 自己搜安装过程呗.

# Emscripten安装
```bash
git clone https://github.com/juj/emsdk.git
git pull
cd .\emsdk\
.\emsdk install --global latest
```
既然下来就是日常迫害大陆用户的时候,大陆用户的访问速度会很慢,尤其的在下载dependence中的Node的时候(此时需要注意的是,没有必要自己提前下载Node,因为会装一个Emscripten特定版本的Node),我安装的时候正好赶上国内的特殊时期,所以,大概用B的速度下载30MB+的东西,大概花费了半天的时间吧,才下好一个Node.
```bash
(base) PS D:\emsdk> .\emsdk install --global latest
Installing SDK 'sdk-releases-upstream-9e60f34accb4627d7358223862a7e74291886ab6-64bit'..
Installing tool 'node-12.9.1-64bit'..
```
我找了找,我应该算是第一个傻到遇到这个问题的人......毕竟真的大佬都去Docker了. 附上Docker的使用方式,不要太简单.
```bash
docker run --rm -it -v `pwd`:/src apiaryio/emcc emcc
```
### 加速下载
那么就提出解决这个问题的方式, 首先第一个想到的是VPN,这个是最简单的方法也是最有效的. 接下来就是很麻烦的不翻墙的方法:
1. 首先运行
    ```bash
    .\emsdk install --global latest
    ```
    发现下载会开在一个位置, 链接如下: https://storage.googleapis.com/webassembly/emscripten-releases-builds/deps/*

2. 找到Git下来的emsdk文件夹,找到emsdk.py文件,
    ```python
    emsdk_master_server = 'https://storage.googleapis.com/webassembly/emscripten-releases-builds/deps/'
    emsdk_packages_url = emsdk_master_server
    ```
    修改其中的链接为 **"file:///(你的emsdk的位置)/localsource/"**
    类似如下:
    ```python
    emsdk_master_server = 'file:///D:/emsdk/localsource/'
    emsdk_packages_url = emsdk_master_server
    ```
    同时在emsdk文件夹下建立localsource

3. 使用离线下载工具下载出现的文件, 比如我出现的是:
    - https://storage.googleapis.com/webassembly/emscripten-releases-builds/deps/node-v12.9.1-win-x64.zip
    - https://storage.googleapis.com/webassembly/emscripten-releases-builds/deps/python-3.7.4-embed-amd64-patched.zip
    - https://storage.googleapis.com/webassembly/emscripten-releases-builds/deps/portable_jre_8_update_152_64bit.zip

    这里建议大家先看看自己的文件是对应的是那个版本在使用离线工具下载, 移动到刚刚建立的localsource目录下(因为前面改了emsdk_master_server的值,所以看到的也会是我们修改之后的地址,把内容替换会原来的再离线下载)

4. 重复上面的步骤三次之后, https://storage.googleapis.com/webassembly/emscripten-releases-builds/deps/ 这个里面的文件我们就下载结束.之后安装的是wasm-binaries.zip,这个的下载速度我这边很快,如果比较慢可以类似上面的方法操作, 将变量`emscripten_releases_download_url_template`变为文件地址即可.
    - https://storage.googleapis.com/webassembly/emscripten-releases-builds/win/9e60f34accb4627d7358223862a7e74291886ab6/wasm-binaries.zip

之后每次打开命令行都需要cd到emsdk所在的文件夹下,然后使用`emsdk activate latest`激活环境,之后才可以使用emcc命令, 可以说自己安装的使用体验相当的恶心,简直就是恶心,所以我安装完之后投奔docker的怀抱......

以下是我个人制作的docker镜像：docker pull cofalconer/emsdk:sdl2, 其中包括emsdk以及配套的OpenGL环境，可以直接编译C++软件到web端运行！

{
    不建议加入环境变量, 比如我电脑上许多的环境版本和他的不一样,加入环境变量后就会很麻烦.
}