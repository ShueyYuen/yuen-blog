---
author: "Shuey Yuen"
date: 2024-12-05T18:10:01+08:00
title: "quickjs源码解读（三）"
description: 深度解析quickjs源码，eval部分。
tags: ["JavaScript", "quickjs"]
categories: ["QuickJS"]
toc: true
cover: /images/2024/1022/title-bg.webp
draft: true
---

## JSParseState

这个结构体 `JSParseState` 用于存储解析 JavaScript 代码时的状态信息。以下是每个属性的详细说明及其作用：

- `JSContext *ctx`: 解析上下文，指向当前的 JavaScript 上下文。
- `int last_line_num`: 上一个 token 所在的行号。
- `int line_num`: 当前偏移量所在的行号。
- `const char *filename`: 当前解析文件的文件名。
- `JSToken token`: 当前解析的 token。
- `BOOL got_lf`: 一个布尔值，指示在当前 token 之前是否遇到了换行符。
- `const uint8_t *last_ptr`: 指向上一个 token 的指针。
- `const uint8_t *buf_ptr`: 当前解析缓冲区的指针。
- `const uint8_t *buf_end`: 解析缓冲区的结束指针。
- `JSFunctionDef *cur_func`: 当前解析的函数定义。
- `BOOL is_module`: 一个布尔值，指示是否正在解析一个模块。
- `BOOL allow_html_comments`: 一个布尔值，指示是否允许 HTML 注释。
- `BOOL ext_json`: 一个布尔值，指示是否接受 JSON 超集。

这个结构体在解析过程中用于跟踪和管理解析状态，确保解析器能够正确处理 JavaScript 代码的各个部分。

## JSToken

这个结构体 `JSToken` 是一个用于表示 JavaScript 解析器中的令牌（token）的数据结构。它包含了多个属性，每个属性都有特定的作用。以下是对各个属性的详细解释：

1. `int val;`
   - 这个属性存储了令牌的类型或值。具体的值取决于解析器的实现。

2. `int line_num;`
   - 这个属性存储了令牌开始的行号，用于错误报告和调试。

3. `const uint8_t *ptr;`
   - 这个属性是一个指向令牌开始位置的指针，通常指向源代码中的位置。

4. `union { ... } u;`
   - 这个联合体包含了不同类型的令牌的具体数据，根据令牌的类型，使用不同的成员。

   - `struct { JSValue str; int sep; } str;`
     - 用于字符串类型的令牌。
     - `JSValue str;` 存储字符串的值。
     - `int sep;` 存储分隔符的信息。

   - `struct { JSValue val; #ifdef CONFIG_BIGNUM slimb_t exponent; #endif } num;`
     - 用于数值类型的令牌。
     - `JSValue val;` 存储数值的值。
     - `slimb_t exponent;`（在启用 `CONFIG_BIGNUM` 时）存储指数值，主要用于浮点数。

   - `struct { JSAtom atom; BOOL has_escape; BOOL is_reserved; } ident;`
     - 用于标识符类型的令牌。
     - `JSAtom atom;` 存储标识符的原子值。
     - `BOOL has_escape;` 表示标识符是否包含转义字符。
     - `BOOL is_reserved;` 表示标识符是否是保留字。

   - `struct { JSValue body; JSValue flags; } regexp;`
     - 用于正则表达式类型的令牌。
     - `JSValue body;` 存储正则表达式的主体。
     - `JSValue flags;` 存储正则表达式的标志。

这个结构体通过使用联合体来节省内存，因为在任何给定时间，令牌只会是其中一种类型（字符串、数值、标识符或正则表达式）中的一种。

### next_token

这段代码是 QuickJS 中的 `next_token` 函数，用于从输入的 JavaScript 源代码中解析下一个语法标记（token）。它是词法分析器的核心部分，负责将源代码转换为解析器能够理解的标记序列。

**功能与流程：**

1. **初始化与检查：**
   - 检查是否发生栈溢出，以防止运行时错误。
   - 释放先前的 token，并重置指针和标志位。

2. **跳过空白和注释：**
   - 通过循环，跳过空白字符、换行符和制表符。
   - 处理单行注释 

 和多行注释 `/*...*/`，并正确更新行号。

3. **解析标记：**
   - **标识符和关键字：**
     - 识别以字母、下划线、美元符号或 Unicode 字符开头的标识符。
     - 处理可能包含的转义字符，例如 Unicode 转义序列。
     - 将标识符与关键字列表进行比较，确定其类型。
   - **数字字面量：**
     - 解析整数和浮点数，包括十进制、二进制、八进制和十六进制格式。
     - 支持数字中的下划线和 BigInt 后缀 `n`。
   - **字符串字面量：**
     - 处理以单引号 `'`、双引号 `"` 或反引号 `` ` `` 包围的字符串。
     - 支持模板字符串和转义字符。
   - **操作符和分隔符：**
     - 识别单字符和多字符的操作符，如 `+`, `-`, `*`, `/`, `==`, `===` 等。
     - 处理复合赋值操作符，如 `+=`, `-=`, `*=`, `/=` 等。
     - 识别特殊语法结构，如箭头函数 `=>`、可选链操作符 `?.`、空值合并操作符 `??` 等。

4. **错误处理：**
   - 如果在解析过程中遇到未知或不合法的字符，生成语法错误。

5. **更新状态并返回：**
   - 更新缓冲区指针位置，准备解析下一个标记。
   - 将解析到的 token 信息保存到解析器状态中，以供后续语法分析使用。

**总结：**

`next_token` 函数按照 JavaScript 的词法规则，对源代码进行逐字符解析，将其分解为一系列语法标记。这个过程是编译器前端的重要步骤，为后续的语法分析和代码生成奠定了基础。

### free_token

这个函数 `free_token` 的功能是释放 `JSToken` 结构体中所包含的资源。它根据 `JSToken` 的类型来决定如何释放资源。下面是函数的详细流程：

1. **函数签名**：
    ```c
    static void free_token(JSParseState *s, JSToken *token)
    ```
    - `JSParseState *s`：解析状态的指针，包含上下文信息。
    - `JSToken *token`：需要释放的令牌指针。

2. **switch 语句**：根据 `token->val` 的值来决定如何释放资源。
    ```c
    switch(token->val) {
    ```

3. **处理不同类型的令牌**：
    - **TOK_NUMBER**：
        ```c
        case TOK_NUMBER:
            JS_FreeValue(s->ctx, token->u.num.val);
            break;
        ```
        释放 `token->u.num.val`。

    - **TOK_STRING** 和 **TOK_TEMPLATE**：
        ```c
        case TOK_STRING:
        case TOK_TEMPLATE:
            JS_FreeValue(s->ctx, token->u.str.str);
            break;
        ```
        释放 `token->u.str.str`。

    - **TOK_REGEXP**：
        ```c
        case TOK_REGEXP:
            JS_FreeValue(s->ctx, token->u.regexp.body);
            JS_FreeValue(s->ctx, token->u.regexp.flags);
            break;
        ```
        释放 `token->u.regexp.body` 和 `token->u.regexp.flags`。

    - **TOK_IDENT** 和 **TOK_PRIVATE_NAME**：
        ```c
        case TOK_IDENT:
        case TOK_PRIVATE_NAME:
            JS_FreeAtom(s->ctx, token->u.ident.atom);
            break;
        ```
        释放 `token->u.ident.atom`。

    - **默认情况**：处理关键字范围内的令牌。
        ```c
        default:
            if (token->val >= TOK_FIRST_KEYWORD &&
                token->val <= TOK_LAST_KEYWORD) {
                JS_FreeAtom(s->ctx, token->u.ident.atom);
            }
            break;
        ```

4. **总结**：这个函数通过检查 `token->val` 的值，调用适当的释放函数来释放 `JSToken` 结构体中所包含的资源，确保内存不会泄漏。

这个函数的设计确保了根据不同的令牌类型，正确地释放相应的资源，避免内存泄漏。

### js_parse_source_element

这个函数 `js_parse_source_element` 是一个静态函数，用于解析 JavaScript 源代码中的元素。它的主要功能是根据当前的 token（标记）来决定如何解析代码元素。以下是这个函数的详细流程和功能解释：

1. **获取当前函数定义**：
   ```c
   JSFunctionDef *fd = s->cur_func;
   ```
   通过 `s->cur_func` 获取当前正在解析的函数定义。

2. **检查当前 token 是否为函数声明**：
   ```c
   if (s->token.val == TOK_FUNCTION ||
       (token_is_pseudo_keyword(s, JS_ATOM_async) &&
        peek_token(s, TRUE) == TOK_FUNCTION)) {
   ```
   如果当前 token 是 `TOK_FUNCTION` 或者是 `async function`，则调用 `js_parse_function_decl` 解析函数声明。

3. **解析函数声明**：
   ```c
   if (js_parse_function_decl(s, JS_PARSE_FUNC_STATEMENT,
                              JS_FUNC_NORMAL, JS_ATOM_NULL,
                              s->token.ptr, s->token.line_num))
       return -1;
   ```
   调用 `js_parse_function_decl` 函数来解析函数声明。如果解析失败，返回 `-1` 表示异常。

4. **检查当前 token 是否为导出声明**：
   ```c
   } else if (s->token.val == TOK_EXPORT && fd->module) {
       if (js_parse_export(s))
           return -1;
   ```
   如果当前 token 是 `TOK_EXPORT` 并且当前函数定义属于模块，则调用 `js_parse_export` 解析导出声明。

5. **检查当前 token 是否为导入声明**：
   ```c
   } else if (s->token.val == TOK_IMPORT && fd->module &&
              ((tok = peek_token(s, FALSE)) != '(' && tok != '.'))  {
       if (js_parse_import(s))
           return -1;
   ```
   如果当前 token 是 `TOK_IMPORT` 并且当前函数定义属于模块，并且下一个 token 不是 `(` 或 `.`，则调用 `js_parse_import` 解析导入声明。

6. **解析其他语句或声明**：
   ```c
   } else {
       if (js_parse_statement_or_decl(s, DECL_MASK_ALL))
           return -1;
   ```
   如果当前 token 不是上述几种情况，则调用 `js_parse_statement_or_decl` 解析其他语句或声明。

7. **返回成功**：
   ```c
   return 0;
   ```
   如果解析成功，返回 `0`。

这个函数通过检查当前 token 的类型，调用不同的解析函数来处理 JavaScript 源代码中的不同元素。如果解析过程中遇到错误，则返回 `-1` 表示异常。
