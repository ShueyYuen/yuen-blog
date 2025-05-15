---
author: "Shuey Yuen"
date: 2024-11-17T18:58:12+08:00
title: "TypeScript类型体操（brainfuck）"
description: 如何一步步解决类型体操，以及分解的基本问题。
tags: ["TypeScript"]
categories: ["Web"]
toc: true
cover: /images/2024/1117/title-bg.webp
draft: true
---

## Brainfuck

语法如下：

| 字符 | 含义 |
|------|------|
| >    | 指针加一 |
| <    | 指针减一 |
| +    | 指针所指字节的值加一 |
| -    | 指针所指字节的值减一 |
| .    | 输出指针所指字节内容（ASCII码） |
| ,    | 向指针所指的字节输入内容（ASCII码） |
| [    | 若指针所指字节的值为零，则向后跳转，跳转到其对应的]的下一个指令处 |
| ]    | 若指针所指字节的值不为零，则向前跳转，跳转到其对应的[的下一个指令处 |

## 实现Brainfuck解释


