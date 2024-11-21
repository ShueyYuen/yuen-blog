---
author: "Shuey Yuen"
date: 2024-11-30T18:58:12+08:00
title: "quickjs源码解读（一）"
description: 深度解析quickjs源码，基础定义部分。
tags: ["JavaScript", "quickjs"]
categories: ["QuickJS"]
toc: true
cover: /images/2024/1022/title-bg.webp
draft: true
---

## 环境类型

### JSRuntime

`JSRuntime` 是 QuickJS 引擎的核心结构，包含了 JavaScript 运行时的全部状态信息。以下是该结构中各个属性的功能：

- **内存管理**

  - `mf`: `JSMallocFunctions`，内存分配函数集合，用于自定义内存管理行为。
  - `malloc_state`: `JSMallocState`，内存分配器的状态信息。
  - `malloc_gc_threshold`: `size_t`，触发垃圾回收的内存阈值。

- **原子（Atom）管理**

  - `atom_hash_size`: `int`，原子哈希表的大小，必须是 2 的幂。
  - `atom_count`: `int`，当前已使用的原子数量。
  - `atom_size`: `int`，原子数组的总容量。
  - `atom_count_resize`: `int`，当原子数量达到该值时，重新调整哈希表大小。
  - `atom_hash`: `uint32_t*`，原子哈希表，用于快速查找原子。
  - `atom_array`: `JSAtomStruct**`，存储原子数据的数组。
  - `atom_free_index`: `int`，下一个可用的空闲原子索引。

- **类（Class）管理**

  - `class_count`: `int`，已注册的类数量，也是 `class_array` 的大小。
  - `class_array`: `JSClass*`，已注册类的数组。

- **上下文与执行**

  - `context_list`: `struct list_head`，`JSContext` 的链表，记录所有执行上下文。
  - `current_stack_frame`: `JSStackFrame*`，当前执行的栈帧指针。

- **垃圾回收（GC）**

  - `gc_obj_list`: `struct list_head`，所有需要垃圾回收的对象列表。
  - `gc_zero_ref_count_list`: `struct list_head`，引用计数为零的对象列表，待释放。
  - `tmp_obj_list`: `struct list_head`，垃圾回收过程中的临时对象列表。
  - `gc_phase`: `JSGCPhaseEnum`，垃圾回收的当前阶段。

- **异常处理**

  - `current_exception`: `JSValue`，当前未捕获的异常对象。
  - `in_out_of_memory`: `BOOL`，标识是否正处于内存不足的处理中，防止递归。

- **堆栈限制**

  - `stack_size`: `uintptr_t`，堆栈的最大大小（字节），为 0 时表示不限制。
  - `stack_top`: `uintptr_t`，堆栈的起始地址。
  - `stack_limit`: `uintptr_t`，堆栈的下限地址，用于检测堆栈溢出。

- **中断与异步处理**

  - `interrupt_handler`: `JSInterruptHandler*`，中断处理函数指针，用于处理长时间执行任务的中断。
  - `interrupt_opaque`: `void*`，中断处理函数的用户数据。
  - `job_list`: `struct list_head`，待执行的异步任务列表。

- **模块加载**

  - `module_normalize_func`: `JSModuleNormalizeFunc*`，模块路径规范化函数。
  - `module_loader_func`: `JSModuleLoaderFunc*`，模块加载函数。
  - `module_loader_opaque`: `void*`，模块加载函数的用户数据。
  - `module_async_evaluation_next_timestamp`: `int64_t`，模块异步评估的下一个时间戳。

- **共享数组缓冲区**

  - `can_block`: `BOOL`，表示 `Atomics.wait` 是否可以阻塞。
  - `sab_funcs`: `JSSharedArrayBufferFunctions`，用于操作 `SharedArrayBuffer` 的函数集合。

- **属性形状（Shape）管理**

  - `shape_hash_bits`: `int`，形状哈希表的位数。
  - `shape_hash_size`: `int`，形状哈希表的大小。
  - `shape_hash_count`: `int`，当前已哈希的形状数量。
  - `shape_hash`: `JSShape**`，形状哈希表，用于优化对象属性访问。

- **大数运算**

  - `bf_ctx`: `bf_context_t`，BigFloat 运算的上下文。
  - `bigint_ops`: `JSNumericOperations`，BigInt 数值操作的函数集合。

- **用户数据**

  - `user_opaque`: `void*`，用户自定义的数据指针，可用于存储与运行时关联的自定义信息。

- **调试与泄漏检测**

  - `rt_info`: `const char*`，运行时信息字符串。
  - `string_list`（仅在 `DUMP_LEAKS` 定义时存在）：`struct list_head`，字符串对象列表，用于检测内存泄漏。

这些属性共同维护了 JavaScript 运行时的状态，包括内存管理、垃圾回收、模块加载、异常处理和异步任务等功能，确保引擎能够正确、高效地执行 JavaScript 代码。

### JSThreadState

`JSThreadState` 结构体用于存储与 JavaScript 线程状态相关的数据。以下是该结构体中各个成员的详细说明：

- `os_rw_handlers`: 存储与读写操作相关的处理程序的链表。
- `os_signal_handlers`: 存储与信号处理相关的处理程序的链表。
- `os_timers`: 存储定时器的链表。
- `port_list`: 存储与工作线程消息处理相关的处理程序的链表。
- `eval_script_recurse`: 仅在主线程中使用，用于记录脚本递归执行的深度。
- `next_timer_id`: 用于 `setTimeout()` 函数的下一个定时器 ID。
- `recv_pipe` 和 `send_pipe`: 不在主线程中使用，分别表示接收和发送消息的管道。

这些成员变量共同维护了线程的各种状态和处理程序，确保线程能够正确处理读写操作、信号、定时器和消息传递等任务。

### JSClass

该结构体 `JSClass` 存储了与 JavaScript 类相关的信息，包括类的标识、名称、生命周期管理和特殊行为等。具体成员如下：

- `uint32_t class_id;`：类的唯一标识符。值为 `0` 表示该条目未被使用。
- `JSAtom class_name;`：类的名称，类型为 `JSAtom`，用于标识类名。
- `JSClassFinalizer *finalizer;`：指向类的终结器函数的指针。当对象被垃圾回收时，会调用此函数进行清理操作。
- `JSClassGCMark *gc_mark;`：指向垃圾回收标记函数的指针。在垃圾回收的标记阶段，用于标记与当前对象相关的其他对象。
- `JSClassCall *call;`：指向调用函数的指针。如果对象是可调用的（类似函数），调用时会使用此函数。
- `const JSClassExoticMethods *exotic;`：指向特殊行为方法的指针，类型为 `JSClassExoticMethods`。用于定义对象的特殊操作（如自定义属性访问、迭代行为等）。如果没有特殊行为，可以为 `NULL`。

这个结构体用于在 JavaScript 引擎中定义自定义类的行为，包括对象的创建、销毁、垃圾回收、调用方式以及特殊的操作方法等。

### JSStackFrame

`JSStackFrame` 结构体用于表示 JavaScript 的调用堆栈帧，存储了函数调用时的重要上下文信息。以下是该结构体中各个成员的含义：

- `struct JSStackFrame *prev_frame;`：指向前一个堆栈帧的指针，如果是第一个堆栈帧，则为 `NULL`。

- `JSValue cur_func;`：当前正在执行的函数对象，如果堆栈帧已分离（detached），则为 `JS_UNDEFINED`。
- `JSValue *arg_buf;`：指向函数参数的缓冲区，存储传递给函数的参数。
- `JSValue *var_buf;`：指向函数局部变量的缓冲区，存储函数内部的局部变量。
- `struct list_head var_ref_list;`：维护一个 `JSVarRef` 的链表，用于处理闭包中的变量引用。
- `const uint8_t *cur_pc;`：仅用于字节码函数，指向当前函数的下一条要执行的指令（程序计数器）。
- `int arg_count;`：参数的数量，即传递给函数的参数个数。
- `int js_mode;`：JavaScript 模式标志，对于 C 函数，可能仅设置 `JS_MODE_MATH`。
- `JSValue *cur_sp;`：仅用于生成器函数，表示当前的堆栈指针值。如果函数正在运行，则为 `NULL`。

这个结构体保存了函数调用时的各种信息，包括调用链、当前函数、参数、局部变量、执行位置等，用于支持 JavaScript 运行时的函数调用和执行流程管理。

### JSGCObjectHeader

该结构体 `JSGCObjectHeader` 存储了以下数据：

- `int ref_count;`：引用计数，必须是第一个成员，32位整数。
- `JSGCObjectTypeEnum gc_obj_type : 4;`：使用4位表示的GC对象类型。
- `uint8_t mark : 4;`：使用4位表示的标记，供垃圾回收器使用。
- `uint8_t dummy1;`：未被垃圾回收器使用的占位字段。
- `uint16_t dummy2;`：未被垃圾回收器使用的占位字段。
- `struct list_head link;`：链表节点，用于链接其他GC对象。

这个结构体用于表示GC（垃圾回收）对象的头部信息，包含了引用计数、对象类型、GC标记以及链表链接等信息。

结构中的 `dummy` 是为了之后和一个匿名结构体同时存在，空出来的内存。

### JSVarRef

`JSVarRef` 结构体用于表示 JavaScript 引擎中变量的引用信息，包含以下数据：

1. **垃圾回收（GC）相关的头部信息**：
   - `JSGCObjectHeader header`：必须在结构体的开头，用于垃圾回收机制。
   - 或者匿名结构体：
     - `int __gc_ref_count`：引用计数，等同于 `header.ref_count`。
     - `uint8_t __gc_mark`：垃圾回收标记，等同于 `header.mark/gc_obj_type`。
     - **位域标志**：
       - `uint8_t is_detached : 1`：表示变量引用是否已分离。
       - `uint8_t is_arg : 1`：表示该变量是否为函数参数。
     - `uint16_t var_idx`：变量索引，对应于栈上的函数变量索引。

2. **值的指针**：
   - `JSValue *pvalue`：指向实际值的指针，可能指向栈上的值或结构体内的 `value` 字段。

3. **值或关联信息**（取决于是否已分离）：
   - **当 `is_detached = TRUE` 时**：
     - `JSValue value`：直接存储变量的值。
   - **当 `is_detached = FALSE` 时**：
     - `struct list_head var_ref_link`：链接到变量引用列表，用于管理活动的变量引用。
     - `struct JSAsyncFunctionState *async_func`：如果在异步函数的栈帧中，则此指针不为 `NULL`。

这个结构体通过联合体和匿名结构体的嵌套，灵活地管理了变量引用在不同状态下所需的数据，用于支持 JavaScript 引擎的变量作用域、垃圾回收以及异步函数等特性。

### JSContext

这个结构体 `JSContext` 是 QuickJS 引擎中的一个核心数据结构，用于存储 JavaScript 上下文的相关信息。以下是该结构体中存储的数据：

1. **垃圾回收相关**：
   - `JSGCObjectHeader header`：垃圾回收对象头，必须放在结构体的第一个位置。
   - `JSRuntime *rt`：指向运行时环境的指针。
   - `struct list_head link`：用于链接到其他上下文的链表节点。

2. **二进制对象**：
   - `uint16_t binary_object_count`：二进制对象的计数。
   - `int binary_object_size`：二进制对象的大小。

3. **对象形状**：
   - `JSShape *array_shape`：数组对象的初始形状。

4. **原型和构造函数**：
   - `JSValue *class_proto`：类的原型。
   - `JSValue function_proto`：函数的原型。
   - `JSValue function_ctor`：函数的构造函数。
   - `JSValue array_ctor`：数组的构造函数。
   - `JSValue regexp_ctor`：正则表达式的构造函数。
   - `JSValue promise_ctor`：Promise 的构造函数。
   - `JSValue native_error_proto[JS_NATIVE_ERROR_COUNT]`：原生错误的原型数组。
   - `JSValue iterator_proto`：迭代器的原型。
   - `JSValue async_iterator_proto`：异步迭代器的原型。
   - `JSValue array_proto_values`：数组原型的值。
   - `JSValue throw_type_error`：用于抛出类型错误的值。
   - `JSValue eval_obj`：eval 对象。

5. **全局对象**：
   - `JSValue global_obj`：全局对象。
   - `JSValue global_var_obj`：包含全局 let/const 定义的对象。

6. **随机数状态**：
   - `uint64_t random_state`：随机数生成器的状态。

7. **大数相关**：
   - `bf_context_t *bf_ctx`：指向运行时环境中的大数上下文。
   - `JSFloatEnv fp_env`：全局浮点环境（在启用大数扩展时）。
   - `BOOL bignum_ext`：是否启用数学模式（在启用大数扩展时）。
   - `BOOL allow_operator_overloading`：是否允许操作符重载（在启用大数扩展时）。

8. **中断计数器**：
   - `int interrupt_counter`：当计数器达到零时，调用 `JSRuntime.interrupt_handler`。

9. **已加载模块**：
   - `struct list_head loaded_modules`：已加载模块的链表。

10. **回调函数**：
    - `JSValue (*compile_regexp)(JSContext *ctx, JSValueConst pattern, JSValueConst flags)`：编译正则表达式的回调函数。
    - `JSValue (*eval_internal)(JSContext *ctx, JSValueConst this_obj, const char *input, size_t input_len, const char *filename, int flags, int scope_idx)`：内部 eval 函数的回调。

11. **用户数据**：
    - `void *user_opaque`：用户自定义数据。

这个结构体包含了 JavaScript 上下文运行所需的各种信息，包括垃圾回收、对象形状、全局对象、随机数状态、大数支持、模块管理和回调函数等。

## 基础类型

### JSString

这个结构体 `JSString` 用于存储 JavaScript 字符串数据。以下是它存储的数据：

1. **header**: `JSRefCountHeader` 类型的头部，必须是第一个成员，用于引用计数。
2. **len**: 字符串的长度，占用 31 位。
3. **is_wide_char**: 表示字符串是否为宽字符（16 位字符），占用 1 位。0 表示 8 位字符，1 表示 16 位字符。
4. **hash**: 字符串的哈希值，占用 30 位。
5. **atom_type**: 原子类型，占用 2 位。如果不为 0，则表示这是一个原子（JS_ATOM_TYPE_x）。
6. **hash_next**: 用于哈希表中的下一个元素索引，或者在 `JS_ATOM_TYPE_SYMBOL` 类型中表示原子索引。
7. **link**: 在 `DUMP_LEAKS` 宏定义时存在，用于字符串列表的链表节点。
8. **u**: 联合体，用于存储实际的字符串数据。根据 `is_wide_char` 的值，选择存储 8 位字符数组 `str8` 或 16 位字符数组 `str16`。

这个结构体通过位域和联合体的使用，优化了内存布局和访问效率。

### JSClosureVar

这个结构体 `JSClosureVar` 用于存储与 JavaScript 闭包变量相关的数据。具体来说，它包含以下字段：

- `is_local`：1 位，表示该变量是否是局部变量。
- `is_arg`：1 位，表示该变量是否是函数参数。
- `is_const`：1 位，表示该变量是否是常量。
- `is_lexical`：1 位，表示该变量是否是词法作用域变量。
- `var_kind`：4 位，表示变量的种类（参见 `JSVarKindEnum` 枚举）。
- `var_idx`：16 位，如果 `is_local` 为 `TRUE`，则表示父函数中普通变量的索引；否则，表示父函数中闭包变量的索引。
- `var_name`：表示变量的名称（类型为 `JSAtom`）。

这些字段共同描述了一个闭包变量的各种属性和信息。

### JSVarDef

这个结构体 `JSVarDef` 用于存储有关 JavaScript 变量的信息。具体来说，它包含以下数据：

1. `JSAtom var_name`：变量的名称。
2. `int scope_level`：变量的作用域级别。
   - 如果 `scope_level` 为 0，表示变量定义的作用域。
   - 如果 `scope_level` 不为 0，表示在同一或封闭的词法作用域中下一个变量在 `fd->vars` 中的索引。
3. `int scope_next`：在字节码函数中，表示在同一或封闭的词法作用域中下一个变量在 `fd->vars` 中的索引。
4. `uint8_t is_const : 1`：标志变量是否为常量。
5. `uint8_t is_lexical : 1`：标志变量是否为词法变量。
6. `uint8_t is_captured : 1`：标志变量是否被捕获。
7. `uint8_t is_static_private : 1`：仅在解析私有类字段时使用，标志变量是否为静态私有。
8. `uint8_t var_kind : 4`：变量的种类，参见 `JSVarKindEnum` 枚举。
9. `int func_pool_idx : 24`：仅在编译期间使用，表示词法变量的函数池索引或定义 'var' 变量的作用域级别。

这个结构体主要在编译和字节码生成过程中使用，用于管理和跟踪变量的各种属性和作用域信息。

### JSFunctionBytecode

`JSFunctionBytecode` 结构体用于存储有关 JavaScript 函数字节码的信息。以下是该结构体中存储的数据：

1. **header**: `JSGCObjectHeader` 类型，必须放在结构体的第一个位置，用于垃圾回收。
2. **js_mode**: `uint8_t` 类型，表示 JavaScript 模式。
3. **has_prototype**: `uint8_t` 类型，表示是否需要原型字段。
4. **has_simple_parameter_list**: `uint8_t` 类型，表示是否有简单参数列表。
5. **is_derived_class_constructor**: `uint8_t` 类型，表示是否为派生类构造函数。
6. **need_home_object**: `uint8_t` 类型，表示是否需要初始化 home_object。
7. **func_kind**: `uint8_t` 类型，表示函数类型。
8. **new_target_allowed**: `uint8_t` 类型，表示是否允许 new.target。
9. **super_call_allowed**: `uint8_t` 类型，表示是否允许 super 调用。
10. **super_allowed**: `uint8_t` 类型，表示是否允许 super。
11. **arguments_allowed**: `uint8_t` 类型，表示是否允许 arguments。
12. **has_debug**: `uint8_t` 类型，表示是否有调试信息。
13. **backtrace_barrier**: `uint8_t` 类型，表示是否在此函数上停止回溯。
14. **read_only_bytecode**: `uint8_t` 类型，表示字节码是否只读。
15. **is_direct_or_indirect_eval**: `uint8_t` 类型，表示是否为直接或间接的 eval。
16. **byte_code_buf**: `uint8_t*` 类型，指向字节码缓冲区的指针。
17. **byte_code_len**: `int` 类型，字节码的长度。
18. **func_name**: `JSAtom` 类型，函数名称。
19. **vardefs**: `JSVarDef*` 类型，指向变量定义的指针，包括参数和局部变量。
20. **closure_var**: `JSClosureVar*` 类型，指向闭包变量列表的指针。
21. **arg_count**: `uint16_t` 类型，参数数量。
22. **var_count**: `uint16_t` 类型，变量数量。
23. **defined_arg_count**: `uint16_t` 类型，用于函数属性的长度。
24. **stack_size**: `uint16_t` 类型，最大堆栈大小。
25. **realm**: `JSContext*` 类型，函数所属的上下文。
26. **cpool**: `JSValue*` 类型，指向常量池的指针。
27. **cpool_count**: `int` 类型，常量池的数量。
28. **closure_var_count**: `int` 类型，闭包变量的数量。
29. **debug**: 内部结构体，存储调试信息，包括：
    - **filename**: `JSAtom` 类型，文件名。
    - **line_num**: `int` 类型，行号。
    - **source_len**: `int` 类型，源代码长度。
    - **pc2line_len**: `int` 类型，PC 到行号的映射长度。
    - **pc2line_buf**: `uint8_t*` 类型，指向 PC 到行号映射缓冲区的指针。
    - **source**: `char*` 类型，源代码。

这个结构体包含了一个 JavaScript 函数执行所需的所有信息，包括字节码、变量、上下文和调试信息。

### JSArrayBuffer

`JSArrayBuffer` 结构体用于存储与 JavaScript ArrayBuffer 对象相关的数据。以下是每个成员的详细说明：

- `int byte_length;`：表示 ArrayBuffer 的字节长度。如果 ArrayBuffer 已经分离（detached），则该值为 0。
- `uint8_t detached;`：表示 ArrayBuffer 是否已分离。非零值表示已分离。
- `uint8_t shared;`：表示 ArrayBuffer 是否为共享的。如果是共享的，则不能分离。
- `uint8_t *data;`：指向实际数据的指针。如果 ArrayBuffer 已分离，则该值为 NULL。
- `struct list_head array_list;`：用于将 ArrayBuffer 链接到一个列表中，具体用途取决于实现。
- `void *opaque;`：一个通用指针，通常用于存储与 ArrayBuffer 相关的额外数据或上下文信息。
- `JSFreeArrayBufferDataFunc *free_func;`：指向一个函数指针，用于释放 ArrayBuffer 的数据。

这个结构体主要用于管理 ArrayBuffer 的内存和状态。

### JSModuleDef

`JSModuleDef` 结构体用于存储有关 JavaScript 模块的信息。以下是该结构体中存储的数据：

1. **引用计数和模块名称**
   - `JSRefCountHeader header`: 引用计数头，必须首先定义。
   - `JSAtom module_name`: 模块名称。

2. **模块依赖和导出**
   - `JSReqModuleEntry *req_module_entries`: 依赖模块条目数组。
   - `int req_module_entries_count`: 依赖模块条目数量。
   - `int req_module_entries_size`: 依赖模块条目数组的大小。

   - `JSExportEntry *export_entries`: 导出条目数组。
   - `int export_entries_count`: 导出条目数量。
   - `int export_entries_size`: 导出条目数组的大小。

   - `JSStarExportEntry *star_export_entries`: 星号导出条目数组。
   - `int star_export_entries_count`: 星号导出条目数量。
   - `int star_export_entries_size`: 星号导出条目数组的大小。

   - `JSImportEntry *import_entries`: 导入条目数组。
   - `int import_entries_count`: 导入条目数量。
   - `int import_entries_size`: 导入条目数组的大小。

3. **模块对象和函数**
   - `JSValue module_ns`: 模块命名空间对象。
   - `JSValue func_obj`: 仅用于 JavaScript 模块的函数对象。
   - `JSModuleInitFunc *init_func`: 仅用于 C 模块的初始化函数。

4. **模块状态**
   - `BOOL has_tla : 8`: 如果 `func_obj` 包含 `await`，则为 true。
   - `BOOL resolved : 8`: 模块是否已解析。
   - `BOOL func_created : 8`: 函数是否已创建。
   - `JSModuleStatus status : 8`: 模块状态。

5. **临时数据**
   - `int dfs_index, dfs_ancestor_index`: 在 `js_module_link()` 和 `js_module_evaluate()` 期间使用的深度优先搜索索引。
   - `JSModuleDef *stack_prev`: 在 `js_module_evaluate()` 期间使用的前一个模块。
   - `JSModuleDef **async_parent_modules`: 异步父模块数组。
   - `int async_parent_modules_count`: 异步父模块数量。
   - `int async_parent_modules_size`: 异步父模块数组的大小。
   - `int pending_async_dependencies`: 待处理的异步依赖项数量。
   - `BOOL async_evaluation`: 是否进行异步评估。
   - `int64_t async_evaluation_timestamp`: 异步评估的时间戳。
   - `JSModuleDef *cycle_root`: 循环根模块。

6. **Promise 和异常处理**
   - `JSValue promise`: 对应于规范字段的能力。
   - `JSValue resolving_funcs[2]`: 对应于规范字段的能力。
   - `BOOL eval_has_exception : 8`: 如果评估产生异常，则为 true。
   - `JSValue eval_exception`: 评估异常。
   - `JSValue meta_obj`: 用于 `import.meta`。

这个结构体包含了一个 JavaScript 模块在运行时所需的所有信息，包括依赖关系、导出、状态和异常处理等。

### JSShape

这个结构体 `JSShape` 用于存储与 JavaScript 对象形状相关的数据。具体来说，它包含以下成员：

1. `JSGCObjectHeader header;`: 垃圾回收对象头部信息。
2. `uint8_t is_hashed;`: 标志位，指示该形状是否已插入形状哈希表。如果未插入，`JSShape.hash` 无效。
3. `uint8_t has_small_array_index;`: 标志位，指示该形状是否可能包含小数组索引属性（0 <= n <= 2^31-1）。如果为 `false`，则保证不包含小数组索引属性。
4. `uint32_t hash;`: 当前的哈希值。
5. `uint32_t prop_hash_mask;`: 属性哈希掩码，用于计算哈希表大小。
6. `int prop_size;`: 分配的属性数量。
7. `int prop_count;`: 包括已删除属性在内的属性数量。
8. `int deleted_prop_count;`: 已删除属性的数量。
9. `JSShape *shape_hash_next;`: 指向下一个形状哈希表中的形状。
10. `JSObject *proto;`: 指向原型对象。
11. `JSShapeProperty prop[0];`: 属性数组，实际大小为 `prop_size`。

这个结构体主要用于管理 JavaScript 对象的属性和形状信息，以便在运行时高效地处理对象属性的查找和操作。

### JSObject

这个结构体 `JSObject` 是 QuickJS 引擎中用于表示 JavaScript 对象的核心数据结构。它包含了多个字段和联合体，用于存储对象的各种属性和状态。以下是对该结构体中各个部分的详细解释：

1. **垃圾回收相关字段**：
    - `JSGCObjectHeader header`：垃圾回收对象头部信息。
    - `int __gc_ref_count`：引用计数，对应 `header.ref_count`。
    - `uint8_t __gc_mark`：标记位，对应 `header.mark/gc_obj_type`。

2. **对象属性标志**：
    - `uint8_t extensible`：对象是否可扩展。
    - `uint8_t free_mark`：在释放有循环引用的对象时使用。
    - `uint8_t is_exotic`：对象是否有特殊的属性处理器。
    - `uint8_t fast_array`：是否为快速数组（用于 `JS_CLASS_ARRAY`、`JS_CLASS_ARGUMENTS` 和类型化数组）。
    - `uint8_t is_constructor`：对象是否为构造函数。
    - `uint8_t is_uncatchable_error`：错误是否不可捕获。
    - `uint8_t tmp_mark`：在 `JS_WriteObjectRec()` 中使用的临时标记。
    - `uint8_t is_HTMLDDA`：是否具有特定的 Annex B `IsHtmlDDA` 行为。
    - `uint16_t class_id`：对象的类 ID。

3. **对象形状和属性**：
    - `JSShape *shape`：对象的形状（包括原型和属性名）。
    - `JSProperty *prop`：对象的属性数组。

4. **弱引用**：
    - `struct JSMapRecord *first_weak_ref`：第一个弱引用记录。

5. **对象数据**：
    - `void *opaque`：通用指针。
    - `struct JSBoundFunction *bound_function`：绑定函数。
    - `struct JSCFunctionDataRecord *c_function_data_record`：C 函数数据记录。
    - `struct JSForInIterator *for_in_iterator`：`for-in` 迭代器。
    - `struct JSArrayBuffer *array_buffer`：数组缓冲区。
    - `struct JSTypedArray *typed_array`：类型化数组。
    - `struct JSFloatEnv *float_env`：浮点环境（在启用 `CONFIG_BIGNUM` 时）。
    - `struct JSOperatorSetData *operator_set`：操作符集合（在启用 `CONFIG_BIGNUM` 时）。
    - `struct JSMapState *map_state`：映射状态。
    - `struct JSMapIteratorData *map_iterator_data`：映射迭代器数据。
    - `struct JSArrayIteratorData *array_iterator_data`：数组迭代器数据。
    - `struct JSRegExpStringIteratorData *regexp_string_iterator_data`：正则表达式字符串迭代器数据。
    - `struct JSGeneratorData *generator_data`：生成器数据。
    - `struct JSProxyData *proxy_data`：代理数据。
    - `struct JSPromiseData *promise_data`：Promise 数据。
    - `struct JSPromiseFunctionData *promise_function_data`：Promise 函数数据。
    - `struct JSAsyncFunctionState *async_function_data`：异步函数数据。
    - `struct JSAsyncFromSyncIteratorData *async_from_sync_iterator_data`：同步到异步迭代器数据。
    - `struct JSAsyncGeneratorData *async_generator_data`：异步生成器数据。
    - `struct JSFunctionBytecode *function_bytecode`：函数字节码。
    - `JSVarRef **var_refs`：变量引用。
    - `JSObject *home_object`：用于 `super` 访问的对象。
    - `JSContext *realm`：执行上下文。
    - `JSCFunctionType c_function`：C 函数类型。
    - `uint8_t length`：函数长度。
    - `uint8_t cproto`：C 函数协议。
    - `int16_t magic`：魔术值。
    - `uint32_t size`：数组大小。
    - `JSValue *values`：数组值。
    - `void *ptr`：通用指针。
    - `int8_t *int8_ptr`：`int8` 指针。
    - `uint8_t *uint8_ptr`：`uint8` 指针。
    - `int16_t *int16_ptr`：`int16` 指针。
    - `uint16_t *uint16_ptr`：`uint16` 指针。
    - `int32_t *int32_ptr`：`int32` 指针。
    - `uint32_t *uint32_ptr`：`uint32` 指针。
    - `int64_t *int64_ptr`：`int64` 指针。
    - `uint64_t *uint64_ptr`：`uint64` 指针。
    - `float *float_ptr`：`float` 指针。
    - `double *double_ptr`：`double` 指针。
    - `uint32_t count`：数组元素数量。
    - `JSRegExp regexp`：正则表达式。
    - `JSValue object_data`：对象数据。

这个结构体通过联合体和位域的使用，尽可能高效地存储了 JavaScript 对象的各种状态和数据。

## 参考文献

- https://ming1016.github.io/2018/04/21/deeply-analyse-javascriptcore/
- https://ming1016.github.io/2021/02/21/deeply-analyse-quickjs
