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
