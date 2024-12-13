---
author: "Shuey Yuen"
date: 2024-12-02T19:06:42+08:00
title: "quickjs源码解读（二）"
description: 深度解析quickjs源码，常用内部函数部分。
tags: ["JavaScript", "quickjs"]
categories: ["QuickJS"]
toc: true
cover: /images/2024/1022/title-bg.webp
draft: true
---

## AddIntrinsicBaseObjects

这个函数 `JS_AddIntrinsicBaseObjects` 的主要功能是向 `JSContext` 对象中添加 JavaScript 的内置基础对象和函数。这个函数在初始化 JavaScript 运行环境时被调用，用于设置全局对象、构造函数和原型链等。

以下是这个函数的主要流程和功能：

1. **设置 `throw_type_error` 函数**：
    ```c
    ctx->throw_type_error = JS_NewCFunction(ctx, js_throw_type_error, NULL, 0);
    ```

2. **为 `Function.prototype` 添加 `caller` 和 `arguments` 属性**：
    ```c
    obj1 = JS_NewCFunction(ctx, js_function_proto_caller, NULL, 0);
    JS_DefineProperty(ctx, ctx->function_proto, JS_ATOM_caller, JS_UNDEFINED,
                      obj1, ctx->throw_type_error,
                      JS_PROP_HAS_GET | JS_PROP_HAS_SET |
                      JS_PROP_HAS_CONFIGURABLE | JS_PROP_CONFIGURABLE);
    JS_DefineProperty(ctx, ctx->function_proto, JS_ATOM_arguments, JS_UNDEFINED,
                      obj1, ctx->throw_type_error,
                      JS_PROP_HAS_GET | JS_PROP_HAS_SET |
                      JS_PROP_HAS_CONFIGURABLE | JS_PROP_CONFIGURABLE);
    JS_FreeValue(ctx, obj1);
    ```

3. **创建全局对象和全局变量对象**：
    ```c
    ctx->global_obj = JS_NewObject(ctx);
    ctx->global_var_obj = JS_NewObjectProto(ctx, JS_NULL);
    ```

4. **初始化 `Object` 构造函数和原型**：
    ```c
    obj = JS_NewGlobalCConstructor(ctx, "Object", js_object_constructor, 1,
                                   ctx->class_proto[JS_CLASS_OBJECT]);
    JS_SetPropertyFunctionList(ctx, obj, js_object_funcs, countof(js_object_funcs));
    JS_SetPropertyFunctionList(ctx, ctx->class_proto[JS_CLASS_OBJECT],
                               js_object_proto_funcs, countof(js_object_proto_funcs));
    ```

5. **初始化 `Function` 构造函数和原型**：
    ```c
    JS_SetPropertyFunctionList(ctx, ctx->function_proto, js_function_proto_funcs, countof(js_function_proto_funcs));
    ctx->function_ctor = JS_NewCFunctionMagic(ctx, js_function_constructor,
                                              "Function", 1, JS_CFUNC_constructor_or_func_magic,
                                              JS_FUNC_NORMAL);
    JS_NewGlobalCConstructor2(ctx, JS_DupValue(ctx, ctx->function_ctor), "Function",
                              ctx->function_proto);
    ```

6. **初始化 `Error` 构造函数和原型**：
    ```c
    obj1 = JS_NewCFunctionMagic(ctx, js_error_constructor,
                                "Error", 1, JS_CFUNC_constructor_or_func_magic, -1);
    JS_NewGlobalCConstructor2(ctx, obj1,
                              "Error", ctx->class_proto[JS_CLASS_ERROR]);
    ```

7. **初始化其他内置对象和函数**：
    - `Array`
    - `Number`
    - `Boolean`
    - `String`
    - `Math`
    - `Reflect`
    - `Symbol`
    - `Generator`
    - 全局属性如 `eval` 和 `globalThis`

每个内置对象和函数的初始化过程大致相同，都是通过创建构造函数、设置原型链和定义属性来完成的。

这个函数的核心思想是通过一系列的函数调用和属性定义，将 JavaScript 的内置对象和函数添加到 `JSContext` 中，从而使得这些对象和函数在 JavaScript 代码中可用。

## 创建Shape

当然可以。这个函数 `js_new_shape2` 用于创建一个新的空的 `JSShape` 对象，并将其与给定的原型 `proto` 关联。下面是这个函数的详细流程和它所做的事情：

1. **函数签名和参数**：
    - `JSContext *ctx`: JavaScript 上下文，包含运行时环境。
    - `JSObject *proto`: 新形状的原型对象。
    - `int hash_size`: 哈希表的大小。
    - `int prop_size`: 属性表的大小。

2. **获取运行时环境**：
    ```c
    JSRuntime *rt = ctx->rt;
    ```

3. **检查并调整形状哈希表的大小**：
    ```c
    if (2 * (rt->shape_hash_count + 1) > rt->shape_hash_size) {
        resize_shape_hash(rt, rt->shape_hash_bits + 1);
    }
    ```
    如果当前形状哈希表的使用量超过了一定比例（这里是50%），则调整哈希表的大小。

4. **分配内存**：
    ```c
    sh_alloc = js_malloc(ctx, get_shape_size(hash_size, prop_size));
    if (!sh_alloc)
        return NULL;
    ```
    为新的形状分配内存，如果分配失败则返回 `NULL`。

5. **初始化形状对象**：
    ```c
    sh = get_shape_from_alloc(sh_alloc, hash_size);
    sh->header.ref_count = 1;
    add_gc_object(rt, &sh->header, JS_GC_OBJ_TYPE_SHAPE);
    ```
    从分配的内存中获取形状对象，并初始化其引用计数和垃圾回收信息。

6. **处理原型对象**：
    ```c
    if (proto)
        JS_DupValue(ctx, JS_MKPTR(JS_TAG_OBJECT, proto));
    sh->proto = proto;
    ```
    如果提供了原型对象，则增加其引用计数，并将其设置为新形状的原型。

7. **初始化哈希表和属性表**：
    ```c
    memset(prop_hash_end(sh) - hash_size, 0, sizeof(prop_hash_end(sh)[0]) * hash_size);
    sh->prop_hash_mask = hash_size - 1;
    sh->prop_size = prop_size;
    sh->prop_count = 0;
    sh->deleted_prop_count = 0;
    ```
    初始化形状的哈希表和属性表。

8. **设置形状的哈希值并插入哈希表**：
    ```c
    sh->hash = shape_initial_hash(proto);
    sh->is_hashed = TRUE;
    sh->has_small_array_index = FALSE;
    js_shape_hash_link(ctx->rt, sh);
    ```
    计算形状的初始哈希值，并将其插入到运行时的形状哈希表中。

9. **返回新创建的形状对象**：
    ```c
    return sh;
    ```

总结来说，这个函数创建了一个新的 `JSShape` 对象，初始化其各个属性，并将其插入到运行时的形状哈希表中。如果提供了原型对象，还会处理原型对象的引用计数。

## 从Shape创建对象

### JS_NewObjectProtoClass

这个函数 `JS_NewObjectProtoClass` 用于创建一个新的 JavaScript 对象，并为其指定原型和类 ID。让我们逐步分析这个函数的功能和流程：

1. **函数签名**：
    ```c
    JSValue JS_NewObjectProtoClass(JSContext *ctx, JSValueConst proto_val, JSClassID class_id)
    ```
    - `ctx`：JavaScript 上下文，包含运行时环境。
    - `proto_val`：原型对象的值。
    - `class_id`：类 ID，用于标识对象的类。

2. **变量声明**：
    ```c
    JSShape *sh;
    JSObject *proto;
    ```

3. **获取原型对象**：
    ```c
    proto = get_proto_obj(proto_val);
    ```
    - 调用 `get_proto_obj` 函数，将 `proto_val` 转换为 `JSObject` 类型的原型对象。

4. **查找或创建形状**：
    ```c
    sh = find_hashed_shape_proto(ctx->rt, proto);
    if (likely(sh)) {
        sh = js_dup_shape(sh);
    } else {
        sh = js_new_shape(ctx, proto);
        if (!sh)
            return JS_EXCEPTION;
    }
    ```
    - 调用 `find_hashed_shape_proto` 函数，在运行时环境中查找与原型对象 `proto` 相关联的形状 `sh`。
    - 如果找到了形状 `sh`，则调用 `js_dup_shape` 函数增加形状的引用计数。
    - 如果没有找到形状 `sh`，则调用 `js_new_shape` 函数创建一个新的形状。如果创建失败，返回 `JS_EXCEPTION`。

5. **创建新对象**：
    ```c
    return JS_NewObjectFromShape(ctx, sh, class_id);
    ```
    - 调用 `JS_NewObjectFromShape` 函数，根据形状 `sh` 和类 ID `class_id` 创建一个新的 JavaScript 对象，并返回该对象。

总结：
- 该函数首先获取原型对象，然后查找或创建与该原型对象相关联的形状，最后根据形状和类 ID 创建一个新的 JavaScript 对象并返回。

### JS_NewObjectFromShape

这个函数 `JS_NewObjectFromShape` 的功能是根据给定的形状（`JSShape`）和类 ID（`JSClassID`）创建一个新的 JavaScript 对象（`JSObject`）。下面是函数的详细过程：

1. **触发垃圾回收**：
    ```c
    js_trigger_gc(ctx->rt, sizeof(JSObject));
    ```
    这行代码触发垃圾回收，确保有足够的内存来分配新的对象。

2. **分配内存**：
    ```c
    p = js_malloc(ctx, sizeof(JSObject));
    if (unlikely(!p))
        goto fail;
    ```
    尝试为新的 `JSObject` 分配内存。如果分配失败，跳转到 `fail` 标签进行错误处理。

3. **初始化对象的基本属性**：
    ```c
    p->class_id = class_id;
    p->extensible = TRUE;
    p->free_mark = 0;
    p->is_exotic = 0;
    p->fast_array = 0;
    p->is_constructor = 0;
    p->is_uncatchable_error = 0;
    p->tmp_mark = 0;
    p->is_HTMLDDA = 0;
    p->first_weak_ref = NULL;
    p->u.opaque = NULL;
    p->shape = sh;
    ```
    初始化对象的基本属性，包括类 ID、可扩展性等。

4. **分配属性数组**：
    ```c
    p->prop = js_malloc(ctx, sizeof(JSProperty) * sh->prop_size);
    if (unlikely(!p->prop)) {
        js_free(ctx, p);
    fail:
        js_free_shape(ctx->rt, sh);
        return JS_EXCEPTION;
    }
    ```
    为对象的属性数组分配内存。如果分配失败，释放对象和形状的内存，并返回 `JS_EXCEPTION`。

5. **根据类 ID 初始化对象的特定属性**：
    ```c
    switch(class_id) {
    case JS_CLASS_OBJECT:
        break;
    case JS_CLASS_ARRAY:
        // 初始化数组对象的特定属性
        break;
    case JS_CLASS_C_FUNCTION:
        // 初始化 C 函数对象的特定属性
        break;
    // 其他类 ID 的初始化
    default:
        if (ctx->rt->class_array[class_id].exotic) {
            p->is_exotic = 1;
        }
        break;
    }
    ```
    根据类 ID 初始化对象的特定属性。例如，数组对象需要初始化 `fast_array` 和 `u.array` 等。

6. **设置引用计数和添加到垃圾回收列表**：
    ```c
    p->header.ref_count = 1;
    add_gc_object(ctx->rt, &p->header, JS_GC_OBJ_TYPE_JS_OBJECT);
    ```
    设置对象的引用计数为 1，并将其添加到垃圾回收列表中。

7. **返回新创建的对象**：
    ```c
    return JS_MKPTR(JS_TAG_OBJECT, p);
    ```
    返回新创建的对象。

这个函数通过一系列步骤，确保根据给定的形状和类 ID 创建并初始化一个新的 JavaScript 对象，并处理可能的内存分配失败情况。

## DefineProperty

### check_define_prop_flags

这段代码定义了一个静态函数 `check_define_prop_flags`，用于检查属性标志是否符合特定条件。函数返回一个布尔值，表示检查结果是通过（TRUE）还是不通过（FALSE）。

以下是代码的逻辑分步解释：

1. **函数签名和变量声明**：
    ```c
    static BOOL check_define_prop_flags(int prop_flags, int flags)
    {
        BOOL has_accessor, is_getset;
    ```
    函数接受两个整数参数 `prop_flags` 和 `flags`，并声明了两个布尔变量 `has_accessor` 和 `is_getset`。

2. **检查 `JS_PROP_CONFIGURABLE` 标志**：
    ```c
    if (!(prop_flags & JS_PROP_CONFIGURABLE))
    {
        if ((flags & (JS_PROP_HAS_CONFIGURABLE | JS_PROP_CONFIGURABLE)) ==
            (JS_PROP_HAS_CONFIGURABLE | JS_PROP_CONFIGURABLE))
        {
            return FALSE;
        }
        if ((flags & JS_PROP_HAS_ENUMERABLE) &&
            (flags & JS_PROP_ENUMERABLE) != (prop_flags & JS_PROP_ENUMERABLE))
            return FALSE;
    }
    ```
    - 如果 `prop_flags` 中不包含 `JS_PROP_CONFIGURABLE` 标志：
        - 检查 `flags` 中是否同时包含 `JS_PROP_HAS_CONFIGURABLE` 和 `JS_PROP_CONFIGURABLE` 标志，如果是，则返回 FALSE。
        - 检查 `flags` 中是否包含 `JS_PROP_HAS_ENUMERABLE` 标志，并且 `JS_PROP_ENUMERABLE` 标志在 `flags` 和 `prop_flags` 中是否不一致，如果是，则返回 FALSE。

3. **检查其他标志**：
    ```c
    if (flags & (JS_PROP_HAS_VALUE | JS_PROP_HAS_WRITABLE |
                 JS_PROP_HAS_GET | JS_PROP_HAS_SET))
    {
        if (!(prop_flags & JS_PROP_CONFIGURABLE))
        {
            has_accessor = ((flags & (JS_PROP_HAS_GET | JS_PROP_HAS_SET)) != 0);
            is_getset = ((prop_flags & JS_PROP_TMASK) == JS_PROP_GETSET);
            if (has_accessor != is_getset)
                return FALSE;
            if (!has_accessor && !is_getset && !(prop_flags & JS_PROP_WRITABLE))
            {
                if ((flags & (JS_PROP_HAS_WRITABLE | JS_PROP_WRITABLE)) ==
                    (JS_PROP_HAS_WRITABLE | JS_PROP_WRITABLE))
                    return FALSE;
            }
        }
    }
    ```
    - 如果 `flags` 中包含 `JS_PROP_HAS_VALUE`、`JS_PROP_HAS_WRITABLE`、`JS_PROP_HAS_GET` 或 `JS_PROP_HAS_SET` 标志：
        - 如果 `prop_flags` 中不包含 `JS_PROP_CONFIGURABLE` 标志：
            - 计算 `has_accessor`，即 `flags` 中是否包含 `JS_PROP_HAS_GET` 或 `JS_PROP_HAS_SET` 标志。
            - 计算 `is_getset`，即 `prop_flags` 中的类型掩码是否等于 `JS_PROP_GETSET`。
            - 如果 `has_accessor` 和 `is_getset` 不一致，则返回 FALSE。
            - 如果既没有访问器也不是 `getset`，并且 `prop_flags` 中不包含 `JS_PROP_WRITABLE` 标志：
                - 检查 `flags` 中是否同时包含 `JS_PROP_HAS_WRITABLE` 和 `JS_PROP_WRITABLE` 标志，如果是，则返回 FALSE。

4. **返回 TRUE**：
    ```c
    return TRUE;
    ```
    - 如果所有检查都通过，则返回 TRUE。

总结来说，这段代码的主要目的是根据传入的标志检查属性的配置是否符合特定条件，并返回相应的布尔值。

### JSCFunctionListEntry

`JSCFunctionListEntry` 是一个结构体，包含多个属性和一个联合体。以下是每个属性的含义：

1. **name**: 
   - 类型：`const char *`
   - 含义：属性或函数的名称。

2. **prop_flags**: 
   - 类型：`uint8_t`
   - 含义：属性标志，用于指定属性的特性（例如可写、可枚举等）。

3. **def_type**: 
   - 类型：`uint8_t`
   - 含义：定义类型，用于区分联合体中的不同成员。

4. **magic**: 
   - 类型：`int16_t`
   - 含义：一个魔术数，用于存储额外的信息或标识。

5. **u**: 
   - 类型：联合体
   - 含义：根据 `def_type` 的值，联合体可以表示不同类型的数据。联合体中的成员包括：
     - **func**: 
       - 包含 `length`（函数参数个数）、`cproto`（C 函数原型类型）和 `cfunc`（C 函数指针）。
     - **getset**: 
       - 包含 `get`（getter 函数指针）和 `set`（setter 函数指针）。
     - **alias**: 
       - 包含 `name`（别名）和 `base`（基地址）。
     - **prop_list**: 
       - 包含 `tab`（属性列表指针）和 `len`（属性列表长度）。
     - **str**: 
       - 字符串常量。
     - **i32**: 
       - 32 位整数。
     - **i64**: 
       - 64 位整数。
     - **f64**: 
       - 双精度浮点数。

这个结构体用于定义 JavaScript 对象的属性和方法列表，便于在 C 语言中操作 JavaScript 对象。