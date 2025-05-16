---
author: "Shuey Yuen"
date: 2024-10-22T12:22:03+08:00
title: "TypeScript类型体操（基础）"
description: 如何一步步解决类型体操，以及分解的基本问题。
tags: ["TypeScript"]
categories: ["Web"]
toc: true
cover: /images/2024/1022/title-bg.webp
cover_author: Jimmy
cover_source: https://www.pixiv.net/artworks/78045300
---

## 为什么做类型体操

TypeScript类型体操是一种在TypeScript中运用复杂类型定义和操作来实现更强大和灵活类型检查的方法。学习类型体操有助于提升代码的健壮性和可维护性，捕捉更多的潜在错误，并使代码更加自文档化。

如果已经熟练使用 `TypeScript`，请直接跳转[类型体操问题分解]({{< relref "#类型体操问题分解" >}}) 。耐心看完本文，相信 [type-challenges](https://github.com/type-challenges/type-challenges/) 无所畏惧！

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

`void` 意味着函数的返回值不会被观察到。

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

{{< notice notice-warning >}}
`null` 以及 `undefined` 在非严格检查下（`strictNullChecks` off），会被作为其他类型的子类（除 `never`）。
{{< /notice >}}

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

成立条件如下：

- 字面量及其原始类型，例如 `1 extends number`。
- 结构化类型系统判断得到的子类型关系（包含派生）。
- Top Type（any, unknown） 与 Bottom Type（never）。
- 联合类型及其分支，例如 `'a' | 'b' extends 'a' | 'b' | 'c'`。
- 分布式条件类型，见[联合类型]({{< relref "#联合类型" >}})

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

使用 `infer` 做类型推断时，同一个候选值能有**多个**推断位置。

当 `infer` 处于协变位置时，结果为[交叉类型]({{< relref "#交叉类型" >}})。

{{< blockquote link="https://www.typescriptlang.org/docs/handbook/release-notes/typescript-2-8.html#conditional-types" title="TypeScript 2.8 Conditional Types" >}}
For a given infer type variable `V`, if any candidates were inferred from co-variant positions, the type inferred for `V` is a union of those candidates. Otherwise, if any candidates were inferred from contra-variant positions, the type inferred for `V` is an intersection of those candidates. Otherwise, the type inferred for `V` is never.
{{</ blockquote >}}

```typescript
type CovariantInfer<T> = T extends { a: infer U; b: infer U } ? U : never;
type Result1 = CovariantInfer<{ a: string; b: string }>; // string
type Result2 = CovariantInfer<{ a: string; b: number }>; // string | number
```

当 `infer` 处于逆变位置时，结果为[联合类型]({{< relref "#联合类型" >}})。

```typescript
type ContravariantInfer<T> = T extends { a: (x: infer U) => void; b: (x: infer U) => void }
  ? U
  : never;
// string
type Result1 = ContravariantInfer<{ a: (x: string) => void; b: (x: string) => void }>;
// string & { n: number }
type Result2 = ContravariantInfer<{ a: (x: string) => void; b: (x: { n: number }) => void }>;
```

#### 联合类型

联合类型表示一个值可以是几种类型之一。使用【`|`】符号来定义联合类型。联合类型进行条件运算时，会对每个成员进行分布式处理，这种行为被称为“[分布式条件类型](https://juejin.cn/post/7068947287593975815#heading-5)”。

```typescript
type ExtractedKey1 = Extract<'a' | 'b' | 'c', 'a' | 'b'>; // 'a' | 'b'
type ExtractedKey2 = 'a' | 'b' | 'c' extends 'a' | 'b' ? true : false; // false

type Naked<T> = T extends boolean ? 'Y' : 'N';
type ArrayWrapped = [T] extends [boolean] ? 'Y' : 'N';

type Result1 = Naked<number | boolean>; // 'N' | 'Y'
type Result2 = ArrayWrapped<number | boolean>; // 'N'
```
> 泛型中，**对于属于裸类型参数的检查类型，条件类型会在实例化时期自动分发到联合类型上。**

{{< blockquote link="https://www.typescriptlang.org/docs/handbook/release-notes/typescript-2-8.html#distributive-conditional-types" title="TypeScript 2.8 Distributive conditional types" >}}
Conditional types in which the checked type is a naked type parameter are called distributive conditional types. Distributive conditional types are automatically distributed over union types during instantiation. For example, an instantiation of `T extends U ? X : Y` with the type argument `A | B | C` for `T` is resolved as `(A extends U ? X : Y) | (B extends U ? X : Y) | (C extends U ? X : Y)`.
{{</ blockquote >}}

#### 交叉类型

交叉类型表示一个值可以同时是几种类型。使用【`&`】符号来定义交叉类型。

```typescript
type A = { name: string };
type B = { age: number };

type AB = A & B;

let person: AB = { name: "Alice", age: 30 }; // OK
```

#### 索引查询

索引查询操作符【`keyof`】用于获取某个类型的所有键，返回一个联合类型。关于 `keyof (A & B)` 的计算详见[链接](https://www.typescriptlang.org/docs/handbook/release-notes/typescript-2-8.html#improved-keyof-with-intersection-types)

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

【`as`】关键字用于在映射类型中重映射键。

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
- **+/\-**：从类型中添加/移除属性修饰符。

```typescript
type Required<T> = {
  // 遍历 key，移除可选属性
  [P in keyof T]-?: T[P];
};
```

### 断言

- as const
- satisfies

#### `as const`

用于将变量或对象的类型断言为最严格的字面量类型。这在定义不可变数据时非常有用，特别是在定义常量对象或数组时。


```typescript
// 类型推断为：`readonly ["red", "green", "blue"]`
const colors = ["red", "green", "blue"] as const;
// ColorDimension 的类型为 "red" | "green" | "blue"
type ColorDimension = typeof colors[number];
```
**用法：**

- 使用 `as const` 可以在类型层面确保数据的不可变性。
- 常用于定义枚举类型的取值集合。

#### `satisfies`

它可以确保一个表达式满足某个类型约束，而不改变其被推断的类型。

```typescript
interface RouterOption {
    redirect: boolean | string;
};

// router 的类型推断和 const 保持一致
const router = {
    '/user': { redirect: false },
    '/login': '', // Type 'string' is not assignable to type 'RouterOption'.(2322)
} satisfies Record<string, RouterOption>;
```

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

#### `keyof any`

`keyof any` 的结果类型是 `string | number | symbol`，表示所有可能的对象键类型。这在需要泛型键类型时非常有用。

```typescript
type KeyType = keyof any; // string | number | symbol
```

#### 类型交叉 `(string & {})`

交叉类型 `(string & {})` 可以将基础类型转化为非原始类型，从而触发类型兼容性的细微差别。常用于防止泛型参数过于宽泛，确保类型的精确性。

```typescript
type Size = 'small' | 'medium' | 'large';
// 这样可以提示 Size，也可以传入普通字符串
function calculateSize(size: Size | (string & {})) {}
```

#### Brand Type

用于在类型系统中创建具有独特标识的类型，防止不同类型之间的混用。通过在类型中添加一个独特的属性（通常是私有的符号或唯一的字符串字面量），可以使逻辑上相同的类型在类型系统中被视为不同的类型。

```typescript
type Brand<K, T> = K & { __brand: T };

type USD = Brand<number, 'USD'>;
type EUR = Brand<number, 'EUR'>;

const makeTyped = <T extends number>(amount: number) => amount as T;
const addPrices = (a: USD, b: USD) => makeTyped<USD>(a + b);

const priceUSD = makeTyped<USD>(10), priceEUR = makeTyped<EUR>(10);

addPrices(priceUSD, priceUSD); // 正确
addPrices(priceUSD, priceEUR); // 错误，Type '"EUR"' is not assignable to type '"USD"'
```

{{< notice notice-info >}}
在编译后不会影响生成的 JavaScript 代码，只在类型检查阶段生效。代码中不要对类型标志做任何赋值访问！！
{{< /notice >}}

## 协变与逆变

`协变（Covariance）` 和 `逆变（Contravariance）` 是与类型兼容性和子类型关系相关的重要概念。

先约定如下的标记：

- 【`A ≦ B`】意味着 A 是 B 的子类型。
- 【`A → B`】指的是以 A 为参数类型，以 B 为返回值类型的函数类型。
- 【`C<A>`】泛型。

解释名词：

- `协变`：如果它依然保持子类型序关系。`A ≦ B`，则 `ReadonlyArray<A> ≦ ReadonlyArray<B>`，`() → A ≦ () → B`。
- `逆变`：如果它逆转了子类型序关系。`A ≦ B`，则 `B → void ≦ A → void`。
- `不变`（invariant）：如果上述两种均不适用。

对于函数类型，我们可以总结为： **对输入类型是逆变的而对输出类型是协变的**。

思考一个场景：`A ≦ B`，则 `B[] → void ≦ A[] → void`。这个是否合理呢？显然是不合理的，因为可以传入 `A[]`，但是可以在子类型 `B[] → void` 的代码中插入一个 `B` 到 `A[]` 上。那么 `A[]` 的内容就类型错误了！

给一个类似的简化代码：

```typescript
interface Example {
  // 属性定义（且开启 strict 或 strictFunctionTypes）的方式是逆变的。
  // fun: (n: 1 | 2 | 3) => void

  // 方法定义的方式，参数是双向可变的。
  fun(n: 1 | 2 | 3): void;
}
const e1: Example = {
  fun(n: 1 | 2 | 3 | 4) {}
}
const e2: Example = {
  // 这在属性定义的时候会报错。
  fun(n: 1 | 2) {}
}
```

{{< notice notice-info >}}
由于没有类似 `Dart` 中的 `convariant` 关键字，`TypeScript` 对函数参数采用的时候双向可变的方案。详见 [Why are function parameters bivariant?](https://github.com/Microsoft/TypeScript/wiki/FAQ#why-are-function-parameters-bivariant)
{{< /notice >}}

## 参考文献

- [[Web Dev] null and undefined](https://web.dev/learn/javascript/data-types/null-undefined)
- [业务代码里的 TypeScript 小技巧](https://blog.csdn.net/Taobaojishu/article/details/140731853)
- [Microsoft Typescript FAQ](https://github.com/Microsoft/TypeScript/wiki/FAQ)
- [Covariance and contravariance (computer science)](https://en.wikipedia.org/wiki/Covariance_and_contravariance_(computer_science))

[^undefined]: `TypeScript` 官方的代码风格中要求使用 `undefined`，这个因团队而异。`TypeScript` 官方也不推荐使用 `const enum`，但是代码里面也到处飞啊！
