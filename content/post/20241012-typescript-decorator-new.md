---
author: "Shuey Yuen"
date: 2024-10-12T15:32:25+08:00
title: "TypeScript装饰器（5.0）"
description: 这个提案已经十年了，还是没有被实际使用！！！
tags: ["TypeScript", "Decorator", "Design Pattern"]
categories: ["Web"]
toc: true
plantuml: true
cover: /images/2024/1012/title-bg.webp
---

## TS 装饰器更新

{{< notice notice-tip >}}
关于 `TypeScript` 装饰器的知识请先阅读 [TypeScript装饰器（旧）]({{< ref "./20240930-typescript-decorator.md" >}})
{{< /notice >}}

### 旧版装饰器

在 TypeScript 5.0 之前，装饰器的使用方式如下：

```typescript
function Log(target: any, propertyKey: string, descriptor: PropertyDescriptor) {
  const originalMethod = descriptor.value;
  descriptor.value = function (...args: any[]) {
    console.log(`Calling ${propertyKey} with arguments:`, args);
    return originalMethod.apply(this, args);
  };
  return descriptor;
}
```
这种装饰器的写法虽然功能强大，但存在一些问题，比如类型检查不够严格，装饰器的应用场景有限等。

### 新版装饰器

TypeScript 5.0 引入了全新的装饰器写法，解决了旧版装饰器的一些问题，并且提供了更强大的功能和更好的类型支持。新的装饰器写法如下：

```typescript
function Log<This, Args extends any[], Return>(
  originalMethod: (this: This, ...args: Args) => Return,
  context: ClassMethodDecoratorContext<This, (this: This, ...args: Args) => Return>
) {
  const methodName = String(context.name);
  return function (this: This, ...args: Args) {
    console.log(`Calling ${String(methodName)} with arguments:`, args);
    const result = originalMethod.call(this, ...args);
    return result;
  };
}
```

### 区别

**新旧装饰器的区别**

- **类型支持**：新版装饰器提供更好的类型支持！通过与 `TypeScript` 的类型系统结合，可以对被装饰的对象做严格的类型约束，减少类型错误。
- **入参**：旧版依赖 `descriptor` 获取信息，现在通过 `context` 获取信息以及进行元编程。
- **返回值**：旧版返回 `descriptor`，现在返回被修饰的实体。
- **MetaData**: `metadata` 单独被抽离到另一个提案[Decorator Metadata](https://github.com/tc39/proposal-decorator-metadata)。
- **参数装饰器被移除**：于是新增提案[ECMAScript Decorators for Class Method and Constructor Parameters](https://github.com/tc39/proposal-class-method-parameter-decorators)。

{{< notice notice-warning >}}
如果项目中使用到**参数装饰器**，则目前无法迁移到新版装饰器。例如：[`NestJS`](https://nestjs.com/)、[`TypeORM`](https://typeorm.io/)、[`InversifyJS`](https://inversify.io/)，以及我们大名鼎鼎的 [VSCode](https://github.com/microsoft/vscode)。
{{< /notice >}}

**新装饰器的优势**

- **更好的类型检查**：新版装饰器能够更好地与 TypeScript 的类型系统结合，提供更严格的类型检查。
- **更加优雅的元编程**：

## 新类型

详情参考 [Decorators](https://github.com/tc39/proposal-decorators) 以及 [decorators.d.ts](https://github.com/microsoft/TypeScript/blob/v5.6.3/src/lib/decorators.d.ts)。

### 类装饰器

```typescript
interface ClassDecoratorContext<
  Class extends abstract new (...args: any) => any = abstract new (...args: any) => any,
> {
  readonly kind: "class";
  // 被装饰器类的名称
  readonly name: string | undefined;
  // 添加在类定义完成后调用的回调。
  addInitializer(initializer: (this: Class) => void): void;
  readonly metadata: DecoratorMetadata;
}

type ClassDecoratorFunction<
  Class extends abstract new (...args: any) => any = abstract new (...args: any) => any,
> = (value: Class, context: ClassDecoratorContext<Class>) => Class | void;
```

重写上篇中的`Seal`：

```typescript
function Seal<Class extends new (...args: any) => any>(value: Class, context: ClassDecoratorContext) {
  context.addInitializer(() => console.log('Initializer'));
  Object.seal(value);
  Object.seal(value.prototype);
  return class extends value {
    constructor(...args: any[]) {
      super(...args);
      Object.seal(this);
    }
  }
};

@Seal
class MyClass {}
```

### 方法装饰器

## 参考文献

- [Decorators](https://github.com/tc39/proposal-decorators)
- [Decorator Metadata](https://github.com/tc39/proposal-decorator-metadata)
- [Writing Well-Typed Decorators](https://devblogs.microsoft.com/typescript/announcing-typescript-5-0/#writing-well-typed-decorators)
- [TypeScript 5.0 将支持全新的装饰器写法！](https://mp.weixin.qq.com/s?__biz=MzkyMjQzNjMxNQ==&mid=2247484057&idx=2&sn=9af9009a56de9315c7f60d090e5db1c9)
- [TypeScript 5+装饰器变更的影响](https://juejin.cn/post/7277835425960099874)
- [全新 JavaScript 装饰器实战下篇：实现依赖注入](https://cloud.tencent.com/developer/article/2347383)
