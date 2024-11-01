---
author: "Shuey Yuen"
date: 2024-10-22T12:22:03+08:00
title: "TypeScript类型体操"
description: 如何一步步解决类型体操，以及分解的基本问题。
tags: ["TypeScript"]
categories: ["Web"]
toc: true
cover: /images/2024/1022/title-bg.webp
draft: true
---

## 为什么做类型体操

TypeScript类型体操是一种在TypeScript中运用复杂类型定义和操作来实现更强大和灵活类型检查的方法。学习类型体操有助于提升代码的健壮性和可维护性，捕捉更多的潜在错误，并使代码更加自文档化。

耐心看完本文，相信 [type-challenges](https://github.com/type-challenges/type-challenges/) 无所畏惧！

## 类型体操基础知识

### 基础类型

**JavaScript**: 
`number`, `boolean`, `string`, `symbol`, `object`, `undefined`, `bigint`, `null`.

**TypeScript**:
`tuple`, `enum`, `Interface`, `字面量类型`, `unknown`, `void`, `any`, `never`.

### 基础运算

- **条件**：T extends U ? X : Y
- **约束**：extends
- **推导**：infer
- **联合**：|
- **交叉**：&
- **索引查询**：keyof T
- **索引访问**：T[K]
- **索引遍历**：infer
- **索引重映射**：as

### 修饰符

- **readonly**：将属性设置为只读，不能被重新赋值。
- **?**：将属性设置为可选。
- **\-**：从类型中移除属性修饰符。

### 断言

- as const
- satisfies

### 工具类型

#### Partial

将类型的所有属性变为可选。

```typescript
type Partial<T> = {
    [P in keyof T]?: T[P];
};
// { name?: string; age?: number }
type PartialPerson = Partial<{
    name: string;
    age: number;
}>;
```

#### Required

将类型的所有属性变为必选。

```typescript
type Required<T> = {
    [P in keyof T]-?: T[P];
};
// { name: string; age: number }
type RequiredPerson = Partial<{
    name?: string;
    age: number;
}>;
```

#### Readonly

将类型的所有属性变为只读。

```typescript
type Readonly<T> = {
    readonly [P in keyof T]: T[P];
};

// { readonly name: string; readonly age: number }
type ReadonlyPerson = Readonly<{
    name: string;
    age: number;
}>
```

#### Pick

从类型中选择一组属性。

```typescript
type Pick<T, K extends keyof T> = {
    [P in K]: T[P];
};

// { name: string; age: number }
type BasicPerson = Pick<{
    name: string;
    age: number;
    gender: string;
}, "name" | "age">
```

#### Record

构造一个类型，其属性名为K，属性值为T。

```typescript
type Record<K extends keyof any, T> = {
    [P in K]: T;
};

const nameAgeMap: Record<string, number> = { Alice: 30, Bob: 25 }; // Record<string, number>
```

#### Exclude

从类型T中排除可以赋值给类型U的类型。

```typescript
type Exclude<T, U> = T extends U ? never : T;

type T = string | number | boolean;
type U = Exclude<T, boolean>; // string | number
```

#### Extract

从类型T中提取可以赋值给类型U的类型。

```typescript
type Extract<T, U> = T extends U ? T : never;

type T = string | number | boolean;
type U = Extract<T, boolean | number>; // number | boolean
```

#### Omit

从类型中排除一组属性。

```typescript
type Omit<T, K extends keyof any> = Pick<T, Exclude<keyof T, K>>;

interface Person {
    name: string;
    age: number;
    gender: string;
}

const omittedPerson: Omit<Person, "gender"> = { name: "Alice", age: 30 }; // Omit<Person, "gender">
```

#### NonNullable

从类型T中排除null和undefined。

```typescript
type NonNullable<T> = T & {};

type T = string | number | null | undefined;
type U = NonNullable<T>; // string | number
```

#### Parameters

获取函数类型的参数类型组成的元组类型。

```typescript
type Parameters<T extends (...args: any) => any> = T extends (...args: infer P) => any ? P : never;

function fn(a: string, b: number): void {}
type Params = Parameters<typeof fn>; // [string, number]
```

#### ConstructorParameters

获取构造函数类型的参数类型组成的元组类型。

```typescript
type ConstructorParameters<T extends abstract new (...args: any) => any> =
    T extends abstract new (...args: infer P) => any ? P : never;

class Person {
    constructor(public name: string, public age: number) {}
}

type Params = ConstructorParameters<typeof Person>; // [string, number]
```

#### ReturnType

获取函数类型的返回类型。

```typescript
type ReturnType<T extends (...args: any) => any> = T extends (...args: any) => infer R ? R : any;

function fn(): string {
    return "hello";
}

type R = ReturnType<typeof fn>; // string
```

#### InstanceType

获取构造函数类型的实例类型。

```typescript
type InstanceType<T extends abstract new (...args: any) => any> =
    T extends abstract new (...args: any) => infer R ? R : any;

class Person {
    constructor(public name: string, public age: number) {}
}

type Instance = InstanceType<typeof Person>; // Person
```

#### Uppercase

将字符串字面量类型的所有字符转换为大写。

```typescript
type Uppercase<S extends string> = intrinsic;

type T = Uppercase<"hello">; // "HELLO"
```

#### Lowercase

将字符串字面量类型的所有字符转换为小写。

```typescript
type Lowercase<S extends string> = intrinsic;

type T = Lowercase<"HELLO">; // "hello"
```

#### Capitalize

将字符串字面量类型的第一个字符转换为大写。

```typescript
type Capitalize<S extends string> = intrinsic;

type T = Capitalize<"hello">; // "Hello"
```

#### Uncapitalize

将字符串字面量类型的第一个字符转换为小写。

```typescript
type Uncapitalize<S extends string> = intrinsic;

type T = Uncapitalize<"Hello">; // "hello"
```

#### NoInfer

防止类型推断。

```typescript
type NoInfer<T> = intrinsic;

function example<T>(arg: NoInfer<T>): T {
    return arg;
}

const result = example<string>("hello"); // string
```

#### ThisType

用于指定上下文对象的类型。

```typescript
interface ThisType<T> {}

// 示例
type ObjectDescriptor<D, M> = {
    data?: D;
    methods?: M & ThisType<D & M>;
};

function makeObject<D, M>(desc: ObjectDescriptor<D, M>): D & M {
    let data: object = desc.data || {};
    let methods: object = desc.methods || {};
    return { ...data, ...methods } as D & M;
}

let obj = makeObject({
    data: { x: 0, y: 0 },
    methods: {
        moveBy(dx: number, dy: number) {
            this.x += dx; // this has type { x: number, y: number, moveBy: (dx: number, dy: number) => void }
            this.y += dy;
        }
    }
});
```

### 小技巧

- type KeyType = keyof any;

## 类型体操问题分解

## 参考文献

- [业务代码里的 TypeScript 小技巧](https://blog.csdn.net/Taobaojishu/article/details/140731853)
