---
author: "Shuey Yuen"
date: 2024-11-08T16:07:15+08:00
title: "TypeScript类型体操（进阶）"
description: 如何一步步解决类型体操，以及分解的基本问题。
tags: ["TypeScript"]
categories: ["Web"]
toc: true
cover: /images/2024/1022/title-bg.webp
draft: true
---

## 类型体操问题分解

### 模式匹配

在类型体操中，**模式匹配**是一种利用 TypeScript 条件类型和 `infer` 关键字，对类型进行模式化拆解和提取的技巧。通过模式匹配，我们可以对复杂类型进行解析、重组，达到类型转换和提取的目的。

**模式匹配**主要依赖于以下两个特性：**条件类型**，**类型推断（infer）**。

```typescript
type ParametersType<T> = T extends (...args: infer P) => any ? P : never;
type Func = (x: number, y: string) => void;
type Params = ParametersType<Func>; // [number, string]

type PromiseType<T> = T extends Promise<infer U> ? U : T;
type PT = PromiseType<Promise<number>>; // number

type T1 = RemovePrefix<'prefix_home'>; // 'home'
type T2 = RemovePrefix<'prefix_user'>; // 'user'
type T3 = RemovePrefix<'about'>;       // 'about'
```

### 练手

#### 加减运算

首先，我们可以操作的类型系统里面，我们唯一可以取得数字字面量类型的就是 `元组`

#### Union to Intersection

```typescript
type UnionToIntersection<U> = (U extends any ? (k: U) => void : never) extends (k: infer I) => void
  ? I
  : never;
```

#### IsAny

```typescript
type IsAny<T, A = true, B = false> = 0 extends (1 & T) ? A : B
```

#### Equal

如果要判断`X`和`Y`相同，我们是否只需要判断 `A ≦ B` 且 `B ≦ A`。这足以应付绝大多数类型的情况了。

```typescript
type Equal<X, Y, A = true, B = false> = X extends Y ? (Y extends X ? A : B) : B;

type T1 = AssertFalsy<Equal<string, number>>;
type T2 = AssertFalsy<Equal<never, unknown>>;
type T3 = AssertFalsy<Equal<unknown, 1>>;
// Type 'boolean' does not satisfy the constraint 'false'.(2344) 
type T4 = AssertFalsy<Equal<string, any>>;
// Type 'boolean' does not satisfy the constraint 'true'.(2344)
type T5 = AssertTruthy<Equal<1 | 2 | 3, 2 | 3 | 1>>;
```

我们发现，到 `X` 或 `Y` 中存在 `any` 时结果不正确。详情参考[条件类型]({{< relref "#条件类型" >}})中的 `Top Type`。

同时，当比较对象为联合类型时，结果也不正确。详情参考[联合类型]({{< relref "#联合类型" >}})中的 `分布式条件类型`。

为了解决这些问题，我们需要增加判断不全为 `any` 则返回 `falsy`，同时将传入的泛型增加一层包裹。

```typescript
type Equal<X, Y, A = true, B = false> =
  IsAny<X, IsAny<Y, A, B>, IsAny<Y, B, [X] extends [Y] ? ([Y] extends [X] ? A : B) : B>>;
```

继续优化，我们是否需要使用俩个 `extends` 才能判断 `A ≦ B` 且 `B ≦ A`？

```typescript
type Equal<X, Y, A = true, B = false> =
  IsAny<X, IsAny<Y, A, B>, IsAny<Y, B, ((n: X) => X) extends ((n: Y) => Y) ? A : B>>;
```

结合前面说的函数参数是双向可变的。我们会发现如下的错误：

```typescript
// Type 'true' does not satisfy the constraint 'false'.(2344)
type T6 = AssertFalsy<Equal<{ func(n: any): void }, { func(n: number): void }>>;
```

## 参考文献

- [在 TypeScript 中判断两个类型相等到底有多难？](https://juejin.cn/post/7365401190895714304)
- [接近天花板的TS类型体操，看懂你就能玩转TS了](https://juejin.cn/post/7061556434692997156)
- [图灵完备及TypeScript图灵完备性验证](https://juejin.cn/post/6927088564194770951)
- [TypeScript 类型体操天花板，用类型运算写一个 Lisp 解释器](https://zhuanlan.zhihu.com/p/427309936)

- https://juejin.cn/post/7066030424937463816
- https://zhuanlan.zhihu.com/p/423175613

