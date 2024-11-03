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

#### `undefined` vs `null` vs `void` vs `never`

在 TypeScript 中，`undefined`、`null`、`void` 和 `never` 是四个特殊的类型，它们有各自的用途和意义。

##### `undefined`[^undefined]

`undefined` 表示未定义的值。当一个变量声明了但没有赋值、对象中没有的属性或未传递的可选参数，它的值就是 `undefined`。通常用于检查变量是否已被初始化，但不建议主动赋值为 `undefined`。

同时，由于 `undefined` 是全局对象的一部分，因此可能会被重写，存在安全隐患。许多大型框架通过使用 `void 0` 来判断 `undefined`，以确保安全性。

```typescript
let a;
let obj: { x?: number } = {};
console.log(a, obj.x); // 输出 undefined undefinedd
```

##### `null`

`null` 表示空值，通常表示一个空的对象引用。常用于释放对象或表示一个变量目前没有值。与 `undefined` 不同，`null` 是一个赋值给变量的值，表示变量已经被明确设置为空。

```typescript
let person: Person = { name: 'hannah' };
person = null!;
```

{{< notice notice-warning >}}
使用上述方式释放对象，一定要确保对象被释放后不会再被使用！！！
{{< /notice >}}

##### `void`

`void` 表示没有任何类型，通常用于函数没有返回值的情况。函数声明返回类型为 `void`，意味着函数执行完毕后不会返回任何值。

此外，`void` 也可以用来声明只允许赋值 `undefined` 的变量，但这种用法较为罕见。

在 `JavaScript` 中，`void` 操作符用于计算一个表达式但不返回任何值，通常用于立即执行函数表达式（IIFE）或确保返回 `undefined`。

```typescript
let uniqId = 0;
const increaseUniqId = (): void => void uniqId++;
const result = increaseUniqId(); // undefined
```

##### `never`

`never` 表示永不存在的值的类型、不应到达的代码路径，通常用于会抛出错误或无限循环的函数。

```typescript
function error(message: string): never {
  throw new Error(message);
}

function infiniteLoop(): never {
  while (true) {}
}

type Foo = 'A' | 'B';
function handleFoo(value: Foo) {
  switch (value) {
    case 'A':
      // 处理 A
      break;
    case 'B':
      // 处理 B
      break;
    default:
      const check: never = value;
      // 如果新增了 Foo 的类型，这里会报错，提醒处理新类型
  }
}
```

##### 总结与应用

- **`undefined`**：表示变量未初始化，可用于可选参数和可选属性。
- **`null`**：表示有意设置为空的值，可用于初始化对象为空。
- **`void`**：主要用于函数没有返回值的情况。
- **`never`**：用于不应到达的代码路径，增强类型检查的完整性。

详见：[`any`, `unknown`, `object`, `void`, `undefined`, `null`, and `never` assignability](https://www.typescriptlang.org/docs/handbook/type-compatibility.html?#any-unknown-object-void-undefined-null-and-never-assignability)


|               | any | unknown | object | void | undefined | null | never |
|---------------|-----|---------|--------|------|-----------|------|-------|
| **any**       |     | ✓       | ✓      | ✓    | ✓         | ✓    | ✕     |
| **unknown**   | ✓   |         | ✕      | ✕    | ✕         | ✕    | ✕     |
| **object**    | ✓   | ✓       |        | ✕    | ✕         | ✕    | ✕     |
| **void**      | ✓   | ✓       | ✕      |      | ✕         | ✕    | ✕     |
| **undefined** | ✓   | ✓       | ⍻      | ✓    |           | ⍻    | ✕     |
| **null**      | ✓   | ✓       | ⍻      | ⍻    | ⍻         |      | ✕     |
| **never**     | ✓   | ✓       | ✓      | ✓    | ✓         | ✓    |       |

#### `interface` vs `type`

在 TypeScript 中，`interface` 和 `type` 都可以用于定义类型，但有一些区别：

**相同点：**
- 都可描述对象结构和扩展类型。

**区别：**
1. **声明合并**：`interface` 支持多次声明同名接口并合并，`type` 不支持。
2. **类型别名**：`type` 可声明基本类型、联合类型、元组等，`interface` 只能声明对象类型。
3. **高级类型操作**：`type` 支持类型运算，`interface` 不支持。
4. **实现**：类可 `implements` 接口，但不能 `implements` 类型别名。
5. **扩展内置对象**：`interface` 可扩展内置对象，`type` 不行。

**使用建议：**
- 用 `interface`：需要声明合并、类实现、扩展内置对象时。
- 用 `type`：定义基本类型别名、联合类型、元组、类型运算时。

**总结：**
- `interface` 适合定义对象结构和接口规范。
- `type` 更灵活，可定义任意类型。

### 基础运算

后续的类型体操就依靠这些啦！！！

#### 条件类型

条件类型是根据类型的条件来选择不同的类型。语法为【`T extends U ? X : Y`】，表示如果 `T` 能赋值给 `U`，则类型为 `X`，否则为 `Y`。

```typescript
type TypeName<T> = 
  T extends string ? "string" :
  T extends number ? "number" :
  T extends boolean ? "boolean" :
  T extends undefined ? "undefined" :
  T extends Function ? "function" :
  "object";

type T1 = TypeName<string>;  // "string"
type T2 = TypeName<42>;      // "number"
type T3 = TypeName<true>;    // "boolean"
type T4 = TypeName<() => void>; // "function"
type T5 = TypeName<{}>;      // "object"
```

#### 类型约束

类型约束用于限制泛型类型的范围。语法为【`T extends U`】，表示类型 `T` 必须是类型 `U` 的子类型。这个是后续类型体操的基础！！

```typescript
function identity<T extends number | string>(arg: T): T {
  return arg;
}

identity(10);    // OK
identity("hello"); // OK
identity(true);  // Error: Argument of type 'true' is not assignable to parameter of type 'number | string'.
```

#### 类型推导

【`infer`】关键字用于在条件类型中推导类型变量。它允许我们在条件类型的 `extends` 子句中引入一个新的类型变量。

```typescript
type ReturnType<T> = T extends (...args: any[]) => infer R ? R : any;

function fn(): string {
  return "hello";
}

type R = ReturnType<typeof fn>; // string
```

#### 联合类型

联合类型表示一个值可以是几种类型之一。使用【`|`】符号来定义联合类型。

```typescript
type Union = string | number | boolean;

let value: Union;
value = "hello"; // OK
value = 42;      // OK
value = true;    // OK
value = {};      // Error: Type '{}' is not assignable to type 'Union'.
```

#### 交叉类型

交叉类型表示一个值可以同时是几种类型。使用【`&`】符号来定义交叉类型。

```typescript
type A = { name: string };
type B = { age: number };

type AB = A & B;

let person: AB = { name: "Alice", age: 30 }; // OK
```

#### 索引查询

索引查询操作符【`keyof`】用于获取某个类型的所有键，返回一个联合类型。

```typescript
type Person = { name: string; age: number };

type Keys = keyof Person; // "name" | "age"
```

#### 索引访问

索引访问操作符【`T[K]`】用于获取某个类型的特定属性的类型。

```typescript
type Person = { name: string; age: number };

type NameType = Person["name"]; // string
```

#### 索引遍历

【`in`】用于遍历一个类型的所有键，并生成一个新的类型。常见的用法是结合 `keyof` 操作符来获取类型的所有键。

```typescript
type Mapped<T> = {
  [P in keyof T]: T[P];
};

type Person = { name: string; age: number };
type MappedPerson = Mapped<Person>; // { name: string; age: number }
```

#### 索引重映射

`as` 关键字用于在映射类型中重映射键。

```typescript
type Mapped<T> = {
  [P in keyof T as `get${Capitalize<string & P>}`]: () => T[P];
};

type Person = { name: string; age: number };
type MappedPerson = Mapped<Person>; 
// { getName: () => string; getAge: () => number }
```


### 修饰符

- **readonly**：将属性设置为只读，不能被重新赋值。
- **?**：将属性设置为可选。
- **\-**：从类型中移除属性修饰符。

### 断言

- as const
- satisfies

### 工具类型

这些工具的详情可以查看 [es5.d.ts](https://github.com/microsoft/TypeScript/blob/v5.6.3/src/lib/es5.d.ts#L1560);

#### 常用类型工具

`Partial`, `Required`, `Readonly`, `Pick`, `Record`, `Exclude`, `Extract`, `Omit`, `NonNullable`, `Parameters`, `ConstructorParameters`, `ReturnType`, `InstanceType`

#### 字符串映射工具

`Uppercase`, `Lowercase`, `Capitalize`, `Uncapitalize`

#### 进阶类型工具

`NoInfer`

#### 上下文类型工具

`ThisType`, 这个在类型体操里面用的很少，主要在实战场景。

### 小技巧

- type KeyType = keyof any;

## 类型体操问题分解

## 参考文献

- [[Web Dev] null and undefined](https://web.dev/learn/javascript/data-types/null-undefined)
- [业务代码里的 TypeScript 小技巧](https://blog.csdn.net/Taobaojishu/article/details/140731853)

[^undefined]: `TypeScript` 官方的代码风格中要求使用 `undefined`，这个因团队而异。`TypeScript` 官方也不推荐使用 `const enum`，但是代码里面也到处飞啊！
