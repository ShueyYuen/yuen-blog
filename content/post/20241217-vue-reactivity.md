---
author: "Shuey Yuen"
date: 2024-12-17T11:36:48+08:00
title: "Vue 响应式设计原理"
description: vue/reactivity 包的设计以及原理介绍。
tags: ["TypeScript", "Vue"]
categories: ["Vue"]
toc: true
cover: /images/2024/1022/title-bg.webp
draft: true
---

这段代码可以很直接的展示 vue 中如何获取到所有内容的响应式.

```ts
const proxy = new Proxy([], {
    get(target, key, receiver) {
        console.log('get', key);
        const result = Reflect.get(target, key, target);
        if (typeof result === 'function') {
            return function(...args) {
                console.group(`${key} 执行ing`, target[key], args);
                const res = target[key].apply(this, args);
                console.log(`${key} 执行完成`, this, receiver)
                console.groupEnd();
                return res;
            };
        }
        console.log('return result', result);
        return result;
    },
    set(target, key, value, receiver) {
        console.log(`set ${key}, value: ${value}`);
        return Reflect.set(target, key, value, target);
    },
});

// https://262.ecma-international.org/#sec-array.prototype.push
console.log('do push', proxy.push(1));
console.log('do unshift', proxy.unshift(2));
console.log('do reverse', proxy.reverse());
console.log('do map', proxy.map((i) => console.log('map', i)));
console.log('do values', proxy.values());
console.log('do Array.from(values)', Array.from(proxy.values()));
```

## 参考
