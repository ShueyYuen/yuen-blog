---
author: Shuey Yuen
date: 2025-09-19T10:00:00+08:00
title: "深入理解CSS Paged Media"
description: "详细介绍CSS Paged Media模块，包括@page规则、打印媒体查询、分页控制等高级特性，助你创建完美的打印样式。"
categories: ["Web"]
tags: ["CSS", "Web", "Print", "CSS3"]
toc: true
cover: /images/2025/0514/title-bg.webp
draft: true
---

在数字化时代，我们似乎已经习惯了屏幕上的无限滚动，但现实世界中的纸质文档依然有其不可替代的价值。从法律合同到学术论文，从产品说明书到财务报表，许多重要文档最终都需要以纸质形式呈现。然而，将网页内容简单地"打印"出来，往往会得到混乱不堪的结果：导航栏、广告、侧边栏全部出现在纸上，文字被意外截断，表格跨页断裂...

这些问题的根本原因在于：**屏幕媒体和打印媒体有着本质不同的特性**。CSS Paged Media模块正是为了解决这一矛盾而诞生的。

## 为什么需要CSS Paged Media？

### 连续媒体 vs 分页媒体的根本差异

传统的CSS设计主要面向**连续媒体**（如屏幕），内容可以无限延伸，用户通过滚动来浏览。而**分页媒体**（如纸张）则有着严格的物理边界：

- **固定尺寸**：每页都有确定的宽度和高度
- **离散性**：内容必须分割到独立的页面中
- **物理限制**：打印机无法在纸张边缘打印
- **阅读习惯**：双面打印的左右页布局不同
- **导航需求**：需要页码、页眉页脚来帮助导航

CSS Paged Media通过提供专门的规则和控制机制，让我们能够优雅地处理这些差异。

### 核心概念

在深入技术细节前，我们需要理解几个关键概念：

- **页面盒子（Page Box）**：具有有限宽度和高度的矩形区域，用于格式化文档内容
- **页面区域（Page Area）**：页面盒子中实际放置内容的区域
- **页边距盒子（Page-Margin Boxes）**：位于页面区域周围的16个区域，用于放置页眉、页脚等
- **页面表（Page Sheet）**：物理媒介的一个表面，如一张纸

## @page 规则：解决页面标准化问题

在没有统一页面标准的情况下，不同的打印机、不同的操作系统会产生截然不同的打印效果。同一份文档在A4纸上看起来完美，但在Letter纸上可能就会内容溢出或留白过多。

**@page规则的设计目标**是让开发者能够明确定义页面的物理特性，确保打印效果的一致性和可预测性。

### 基础语法：统一页面标准

```css
@page {
  size: A4;           /* 明确页面尺寸 */
  margin: 2cm;        /* 定义安全边距 */
  background: white;  /* 确保背景色 */
}
```

这样简单的几行代码解决了三个关键问题：
1. **尺寸不一致**：明确指定A4尺寸，避免跨设备差异
2. **边缘截断**：2cm边距确保内容不会被打印机的非打印区域截断
3. **背景混乱**：强制白色背景，避免屏幕样式的深色背景被打印

### 页面选择器：解决差异化需求

#### :left 和 :right 伪类：解决装订边距问题

在双面打印和装订时，内侧边距需要更大以容纳装订孔或胶水，这在传统Web CSS中是无法表达的概念：

```css
@page :left {
  margin-left: 3cm;   /* 左页的装订边（右侧）需要更大边距 */
  margin-right: 2cm;
  @bottom-left {
    content: counter(page);  /* 页码靠外侧，便于翻阅 */
  }
}

@page :right {
  margin-left: 2cm;
  margin-right: 3cm;  /* 右页的装订边（左侧）需要更大边距 */
  @bottom-right {
    content: counter(page);  /* 页码靠外侧 */
  }
}
```

**为什么这样设计？**
- **装订需求**：装订会占用内侧边距，必须预留足够空间
- **阅读体验**：页码在外侧更容易看到和定位
- **对称美感**：左右页呈现镜像对称的版式

#### :first 伪类：解决首页特殊性

许多文档的首页都有特殊要求：更大的标题区域、不显示页眉、不计入页码等：

```css
@page :first {
  margin-top: 5cm;    /* 为封面标题留出更多空间 */
  @top-center {
    content: "";      /* 首页通常不需要页眉 */
  }
}
```

**解决的问题**：
- **视觉层次**：首页需要突出，更大的上边距创造视觉重点
- **信息冗余**：首页标题本身就是"页眉"，避免重复信息
- **专业外观**：符合传统出版物的设计惯例

#### :blank 伪类：解决空白页处理

在自动分页过程中，可能产生完全空白的页面（比如章节必须从奇数页开始），这些页面需要特殊标识：

```css
@page :blank {
  @top-center {
    content: "此页故意留白";  /* 避免读者以为是打印错误 */
  }
}
```

**为什么需要这个设计？**
- **用户体验**：空白页可能让读者误以为打印出错
- **专业性**：正式文档中的空白页通常会有标识
- **版权保护**：防止有人误以为可以撕掉"多余"的页面

### 命名页面：解决内容类型差异

不同类型的内容往往需要不同的页面设计。比如：章节页面需要章节信息，附录页面需要不同的页眉，索引页面可能需要更小的边距来容纳更多内容。

```css
@page chapter {
  @bottom-center {
    content: "第" counter(chapter) "章";  /* 章节特定的页脚 */
  }
}

.chapter {
  page: chapter;                        /* 应用章节页面样式 */
  page-break-before: always;           /* 每章从新页开始 */
}
```

**解决的核心问题**：
- **内容分类**：不同类型内容需要不同的页面设计
- **导航辅助**：读者能够通过页面样式快速识别内容类型
- **版式统一**：同类内容保持一致的页面风格

## 页面尺寸和方向：适应物理世界的约束

### size 属性：跨越地域和行业的标准化

不同国家、不同行业有着不同的纸张标准。美国常用Letter（8.5×11英寸），欧洲使用A4（210×297毫米），法律文件可能用Legal纸（8.5×14英寸）。size属性的设计就是为了让同一份Web文档能够适应这些现实世界的物理约束。

```css
@page {
  /* 预定义尺寸 - 解决地域差异 */
  size: A4;          /* 国际标准，210×297mm */
  size: letter;      /* 美国标准，8.5×11英寸 */
  size: legal;       /* 法律文档标准，8.5×14英寸 */
  
  /* 自定义尺寸 - 解决特殊需求 */
  size: 210mm 297mm; /* 精确控制，适应特殊打印设备 */
  size: 8.5in 11in;  /* 英制单位，适应美式环境 */
  
  /* 方向控制 - 适应内容特性 */
  size: A4 portrait;  /* 纵向：适合文字文档 */
  size: A4 landscape; /* 横向：适合表格、图表 */
}
```

**为什么需要这些选项？**

1. **地域适应性**：避免文档在不同国家打印时出现格式问题
2. **行业兼容性**：法律、医疗等行业有特定的纸张标准
3. **内容优化**：横向布局更适合宽表格，纵向更适合文本
4. **设备兼容**：适应不同打印机的纸张支持

### page-orientation 属性：解决内容与纸张方向的冲突

有时候，整个文档是纵向的，但某些页面（如大表格）需要横向显示。传统方案是让用户手动旋转纸张，但这破坏了阅读连续性。

```css
@page {
  page-orientation: upright;      /* 默认：保持原始方向 */
  page-orientation: rotate-left;  /* 左转90度：让横向内容正向显示 */
  page-orientation: rotate-right; /* 右转90度：另一种旋转方向 */
}
```

**设计理念**：
- **用户友好**：避免用户手动旋转纸张
- **阅读连续性**：保持文档的整体阅读流程
- **内容适应**：让页面方向服务于内容，而非相反

## 分页控制：解决内容断裂的美学和可读性问题

想象一下，你正在阅读一份重要报告，突然发现一个标题孤零零地出现在页面底部，而相关内容却在下一页开始。或者一个段落被强行切断，只有一行文字留在页面底部。这些问题在自动分页中极其常见，严重影响阅读体验和文档的专业性。

### page-break 属性：智能控制内容分布

分页控制的核心思想是**让分页服务于内容的逻辑结构，而不是机械地按页面空间切割**。

```css
.chapter {
  page-break-before: always; /* 每章必须从新页开始 - 建立清晰层次 */
  page-break-after: avoid;   /* 章节后避免立即分页 - 保持连贯性 */
  page-break-inside: avoid;  /* 章节标题区不被分割 - 维护视觉完整性 */
}

/* 现代语法 - 更直观的语义 */
.chapter {
  break-before: page;      /* 明确的语义：在页面上开始 */
  break-after: avoid-page; /* 避免在页面边界断开 */
  break-inside: avoid;     /* 内部不要分页 */
}
```

### 分页值详解：精确控制分页逻辑

每个分页值都对应着现实世界中的具体排版需求：

```css
.section {
  /* auto: 让浏览器自动决定 - 适用于普通内容 */
  page-break-before: auto;
  
  /* always: 强制分页 - 适用于章节、重要分隔 */
  page-break-before: always;
  
  /* avoid: 避免分页 - 适用于紧密相关的内容 */
  page-break-before: avoid;
  
  /* left: 强制在左页开始 - 适用于需要双页展示的内容 */
  page-break-before: left;
  
  /* right: 强制在右页开始 - 适用于重要章节开头 */
  page-break-before: right;
}
```

**为什么需要这么多选项？**

- **always**: 解决**层次混乱**问题，确保重要内容有独立的开始
- **avoid**: 解决**逻辑断裂**问题，保持相关内容的连续性
- **left/right**: 解决**版面美学**问题，让重要内容占据视觉焦点位置

### 孤儿和寡妇控制：解决最常见的排版灾难

在传统排版学中，"孤儿行"（orphans）和"寡妇行"（widows）被视为最严重的排版错误之一。

```css
p {
  orphans: 3;  /* 页面底部至少保留3行 */
  widows: 3;   /* 页面顶部至少保留3行 */
}
```

**为什么孤立行是个问题？**

1. **阅读连贯性破坏**：
   - 只有1-2行的段落片段让读者难以理解上下文
   - 强迫读者频繁翻页来理解完整意思

2. **视觉美感破坏**：
   - 孤立的短行让页面看起来不平衡
   - 破坏了页面的整体视觉韵律

3. **认知负担增加**：
   - 读者需要额外的心理努力来重新连接被分割的内容
   - 降低了阅读效率和理解准确性

**实际案例对比**：

❌ **没有孤儿寡妇控制的糟糕效果**：
```
页面A底部：
从这个例子我们可以看出，良好的排版
设计不仅仅是美观问题，更是

[翻页]

页面B顶部：
关乎信息传达效率的关键因素。
```

✅ **有孤儿寡妇控制的良好效果**：
```
页面A底部：
[适当的空白]

[翻页]

页面B顶部：
从这个例子我们可以看出，良好的排版
设计不仅仅是美观问题，更是关乎信息
传达效率的关键因素。
```

通过设置 `orphans: 3; widows: 3;`，我们确保：
- 页面底部不会只剩下1-2行孤立文字
- 页面顶部不会只有1-2行延续文字
- 保持段落的视觉完整性和阅读连贯性

## 页边距盒子：解决导航和上下文信息缺失问题

想象你拿到一叠打印出来的文档，但没有页码、没有标题、没有任何标识。你如何知道当前在读哪一章？如何快速定位到特定内容？如何确定文档的完整性？在数字世界中，我们有浏览器的地址栏、标题栏、滚动条来提供这些信息，但在纸质世界中，这些信息必须印在纸上。

**页边距盒子的设计理念**：将数字世界的导航和上下文信息映射到物理纸张上。

### 16个区域的精心设计

```
┌───────────────────┬────────────────┬────────────────────┐
│@top-left-corner   │  @top-center   │@top-right-corner   │
├───────────────────┼────────────────┼────────────────────┤
│@left-top          │                │@right-top          │
│@left-middle       │     content    │@right-middle       │
│@left-bottom       │                │@right-bottom       │
├───────────────────┼────────────────┼────────────────────┤
│@bottom-left-corner│ @bottom-center │@bottom-right-corner│
└───────────────────┴────────────────┴────────────────────┘
```

这个设计并非随意划分，而是基于几百年来传统出版业的经验：

- **角落区域**：通常用于装饰性元素或次要信息
- **中心区域**：用于最重要的导航信息（如页码、文档标题）
- **侧边区域**：用于章节信息或动态内容
- **多层次布局**：不同重要性的信息有不同的位置优先级

### 解决核心导航问题

```css
@page {
  @top-center {
    content: "文档标题";        /* 解决：我在读什么文档？ */
    font-size: 12pt;
    font-weight: bold;
  }
  
  @bottom-center {
    content: counter(page) " / " counter(pages);  /* 解决：当前进度如何？ */
  }
  
  @bottom-left {
    content: "© 2025 Company Name";  /* 解决：文档来源和版权 */
    font-size: 10pt;
    color: #666;
  }
  
  @bottom-right {
    content: string(chapter-title);  /* 解决：我在读哪一章？ */
    font-style: italic;
  }
}
```

**每个位置解决的具体问题**：

1. **@top-center（文档标题）**：
   - 问题：在多文档环境中，读者容易混淆不同文档
   - 解决：每页都清晰标识文档身份

2. **@bottom-center（页码）**：
   - 问题：无法快速定位和引用特定内容
   - 解决：提供清晰的位置参考和阅读进度

3. **@bottom-left（版权信息）**：
   - 问题：文档的来源和版权信息容易丢失
   - 解决：每页都包含必要的法律和来源信息

4. **@bottom-right（章节标题）**：
   - 问题：在长文档中容易迷失当前位置
   - 解决：动态显示当前章节，提供上下文信息

### 高级应用：动态信息系统

```css
@page {
  @top-left {
    content: url(logo.png);      /* 品牌标识 - 建立信任 */
    width: 2cm;
    vertical-align: middle;
  }
  
  @top-right {
    content: "打印时间: " date(); /* 时效性标识 - 避免过期信息混淆 */
    font-size: 10pt;
  }
}

/* 动态内容系统 */
h1 {
  string-set: chapter-title content();  /* 自动捕获章节标题 */
}

h2 {
  string-set: section-title content();  /* 自动捕获小节标题 */
}
```

**解决的深层问题**：

1. **信任建立**：logo的存在让读者确信文档的权威性
2. **时效管理**：打印时间避免了过期文档的误用
3. **自动化**：string-set实现了内容的自动同步，无需手动维护

### 为什么需要这么多区域？

这16个区域的设计反映了信息层次的复杂性：

- **主要信息**（中心区域）：页码、文档标题
- **次要信息**（侧边区域）：章节信息、日期
- **装饰信息**（角落区域）：logo、版权
- **上下文信息**（动态区域）：当前章节、当前小节

通过精细的区域划分，我们可以创建一个完整的信息生态系统，让纸质文档具备接近数字文档的导航和信息提供能力。

## 媒体查询与打印：解决"一套内容，两种体验"的挑战

Web内容天生就是为屏幕设计的：彩色背景、交互按钮、动画效果、导航菜单。但当这些内容需要打印到纸张上时，会产生严重的不适配问题。想象一下，一个深色主题的网站被打印出来会是什么样：黑色背景浪费大量墨水，白色文字在纸上根本看不见，导航菜单毫无意义地占据宝贵的纸张空间。

**@media print的设计理念**：让同一份内容能够智能地适应不同的输出媒介，而不需要创建两套完全独立的版本。

### @media print：智能内容转换

```css
@media print {
  /* 解决问题1：无用内容占用空间 */
  nav, .ads, .no-print {
    display: none !important;  /* 移除所有非内容元素 */
  }
  
  /* 解决问题2：屏幕字体在纸上的可读性问题 */
  body {
    font-size: 12pt;      /* 纸质阅读的最佳字号 */
    line-height: 1.4;     /* 适合纸质的行间距 */
    color: black;         /* 确保高对比度 */
    background: white;    /* 节省墨水，提高可读性 */
  }
  
  /* 解决问题3：链接在纸质媒体中的意义丢失 */
  a[href]:after {
    content: " (" attr(href) ")";  /* 显示实际URL */
    font-size: 10pt;
    color: #666;
  }
  
  /* 解决问题4：表格跨页断裂的数据完整性问题 */
  table {
    page-break-inside: avoid;  /* 保持表格完整性 */
  }
  
  thead {
    display: table-header-group;  /* 每页都显示表头 */
  }
  
  tfoot {
    display: table-footer-group;  /* 每页都显示表尾 */
  }
}
```

**每个规则解决的具体问题**：

### 问题1：屏幕UI元素的无意义性

在屏幕上，导航菜单、搜索框、广告横幅都有其作用，但在纸质文档中：
- **导航菜单**：无法点击，纯粹浪费空间
- **广告内容**：与主要内容无关，干扰阅读
- **交互元素**：按钮、表单在纸上失去功能

**解决方案**：选择性隐藏
```css
nav, .sidebar, .ads, button, input {
  display: none !important;
}
```

### 问题2：颜色和字体的适配性

屏幕和纸张对颜色、对比度、字体大小的要求完全不同：

**屏幕特性**：
- 发光显示，深色背景护眼
- 像素密度高，小字清晰可读
- 彩色显示成本低

**纸张特性**：
- 反射光源，白色背景最佳
- 分辨率有限，需要更大字体
- 彩色打印成本极高

**解决方案**：媒体特定的视觉设计
```css
@media print {
  body {
    color: #000;          /* 最高对比度 */
    background: #fff;     /* 最省墨水 */
    font-family: serif;   /* 纸质阅读友好字体 */
    font-size: 12pt;      /* 标准阅读字号 */
  }
}
```

### 问题3：链接的语义丢失

在屏幕上，链接可以点击跳转，但在纸张上，链接只是一段有下划线的文字，读者无法知道它指向何处。

**解决方案**：URL可视化
```css
a[href]:after {
  content: " (" attr(href) ")";
}

/* 内部链接的特殊处理 */
a[href^="#"]:after {
  content: " (见本文 " attr(href) " 部分)";
}

/* 邮件链接的处理 */
a[href^="mailto:"]:after {
  content: " (" attr(href) ")";
}
```

### 问题4：表格数据的完整性保护

表格数据通常具有强烈的关联性，如果因为分页而断裂，会导致数据误读。

**问题场景**：
```
页面A底部：
| 产品名称 | 价格 | 库存 |
|---------|------|------|
| iPhone  | 999  |      

[翻页]

页面B顶部：
|         |      |  50  |
| iPad    | 799  |  23  |
```

**解决方案**：智能分页控制
```css
table {
  page-break-inside: avoid;        /* 小表格整体保持在一页 */
}

thead {
  display: table-header-group;     /* 大表格每页都显示表头 */
}

tr {
  page-break-inside: avoid;        /* 单行数据不被分割 */
}
```

### 设计理念的深层思考

@media print 的存在体现了一个重要的设计哲学：**内容的媒介无关性**。

- **内容本身**是媒介无关的（文字、数据、图像）
- **展示方式**应该根据媒介特性优化
- **用户体验**在不同媒介中应该保持一致的质量

这种理念让Web真正成为了一个universal platform——同样的内容可以在不同的设备、不同的媒介中提供最优的用户体验。

### 结合媒体查询的页面设置

```css
@media print {
  @page {
    size: A4;
    margin: 2cm;
  }
  
  @page :first {
    margin-top: 5cm;
    @top-center {
      content: "";
    }
  }
  
  @page chapter {
    @bottom-center {
      content: "第" counter(chapter) "章 - 第" counter(page) "页";
    }
  }
}
```

## 实用技巧和最佳实践

### 1. 完整的打印样式重置

```css
@media print {
  * {
    -webkit-print-color-adjust: exact !important;
    color-adjust: exact !important;
  }
  
  body {
    margin: 0;
    padding: 0;
    background: white !important;
    color: black !important;
  }
  
  .page-break {
    page-break-before: always;
  }
  
  .no-break {
    page-break-inside: avoid;
  }
}
```

### 2. 表格友好的打印处理

```css
@media print {
  table {
    border-collapse: collapse;
    width: 100%;
    page-break-inside: avoid;
  }
  
  thead {
    display: table-header-group;
  }
  
  tr {
    page-break-inside: avoid;
  }
  
  th, td {
    border: 1pt solid black;
    padding: 8pt;
  }
}
```

### 3. 图片和背景处理

```css
@media print {
  img {
    max-width: 100% !important;
    height: auto !important;
    page-break-inside: avoid;
  }
  
  /* 确保背景色和图像打印 */
  .print-background {
    -webkit-print-color-adjust: exact;
    color-adjust: exact;
  }
}
```

### 4. 多列布局的打印优化

```css
@media print {
  .multi-column {
    column-count: 1 !important;
    column-gap: 0 !important;
  }
}
```

## 高级特性

### 裁切标记和出血

```css
@page {
  size: A4;
  marks: crop cross; /* 裁切标记 */
  bleed: 3mm;       /* 出血区域 */
}
```

### 字符串函数

```css
h1 {
  string-set: chapter-title content();
}

h2 {
  string-set: section-title content();
}

@page {
  @top-left {
    content: string(chapter-title);
  }
  
  @top-right {
    content: string(section-title);
  }
}
```

## 浏览器兼容性

目前CSS Paged Media的支持情况：

- **Chrome/Edge 85+**: 支持大部分特性
- **Safari 13.1+**: 基础支持
- **Firefox**: 部分支持，页边距盒子支持有限

### 兼容性处理

```css
/* 为不支持的浏览器提供备选方案 */
@supports not (size: A4) {
  @media print {
    body {
      margin: 2cm;
    }
  }
}
```

## 实际应用案例

### 案例1：发票模板

```css
@media print {
  @page invoice {
    size: A4;
    margin: 2cm;
    
    @top-center {
      content: "发 票";
      font-size: 24pt;
      font-weight: bold;
    }
    
    @bottom-left {
      content: "发票号：" attr(data-invoice-number);
    }
    
    @bottom-right {
      content: "第 " counter(page) " 页";
    }
  }
  
  .invoice {
    page: invoice;
  }
  
  .invoice-header {
    page-break-after: avoid;
  }
  
  .invoice-items {
    page-break-inside: avoid;
  }
}
```

### 案例2：报告文档

```css
@media print {
  @page report {
    size: A4;
    margin: 3cm 2cm 2cm 2cm;
    
    @top-left {
      content: string(report-title);
      font-size: 14pt;
      font-weight: bold;
    }
    
    @top-right {
      content: string(report-date);
      font-size: 12pt;
    }
    
    @bottom-center {
      content: counter(page);
      font-size: 12pt;
    }
  }
  
  @page report :first {
    @top-left, @top-right {
      content: "";
    }
  }
  
  .report {
    page: report;
  }
  
  .report h1 {
    string-set: report-title content();
    page-break-before: always;
  }
  
  .report .date {
    string-set: report-date content();
  }
}
```

## 总结：从问题到解决方案的设计智慧

CSS Paged Media的每一个特性都不是凭空设计的，而是对现实世界中具体问题的深思熟虑的解决方案。回顾我们讨论的核心问题：

### 解决的根本问题矩阵

| 问题类别 | 具体问题 | CSS Paged Media解决方案 | 核心价值 |
|---------|---------|----------------------|---------|
| **物理约束** | 屏幕无限 vs 纸张有限 | `@page size`, `margin` | 标准化与预测性 |
| **导航缺失** | 数字导航 vs 物理导航需求 | 16个页边距盒子 | 信息架构完整性 |
| **内容断裂** | 机械分页 vs 逻辑分页 | `page-break`, `orphans`, `widows` | 阅读连贯性保护 |
| **媒介差异** | 单一内容 vs 多媒介输出 | `@media print` | 媒介适应性 |
| **版式混乱** | 自动布局 vs 专业排版 | `:left`, `:right`, `:first` | 出版级质量控制 |

### 设计哲学的深层价值

1. **以人为本的技术设计**
   - 不是为了技术而技术，而是为了解决用户的真实痛点
   - 每个特性都有明确的用户体验改善目标

2. **物理世界与数字世界的桥梁**
   - 尊重两种媒介的不同特性
   - 建立统一的内容管理方式

3. **专业出版经验的数字化传承**
   - 几百年出版业积累的排版智慧
   - 通过代码实现传统排版的精髓

### 实际应用的指导原则

在实际项目中应用CSS Paged Media时，建议按照以下优先级考虑：

**第一优先级 - 基础问题**：
- 使用`@media print`解决基本的媒介适配
- 设置`page-break-inside: avoid`保护关键内容
- 添加基础的页码和标题信息

**第二优先级 - 体验优化**：
- 实现`orphans`和`widows`控制
- 为不同内容类型设计专门的页面样式
- 优化链接和表格的打印表现

**第三优先级 - 专业增强**：
- 利用完整的页边距盒子系统
- 实现动态的内容引用（如章节标题）
- 添加装订、分页等专业出版特性

### 未来展望

虽然目前浏览器对CSS Paged Media的支持还在完善中，但这项技术代表了Web平台发展的重要方向：

- **内容的真正可移植性**：一份内容，多种优质体验
- **专业出版的民主化**：让每个Web开发者都能创造出版级质量的文档
- **数字化转型的完整性**：不仅仅是数字化，更是优质的数字化

CSS Paged Media告诉我们，优秀的技术设计不是追求复杂性，而是用简洁的方式解决复杂的现实问题。每当我们在代码中写下`orphans: 3`时，我们实际上是在传承几个世纪以来人类对美好阅读体验的追求。

这正是Web技术的魅力所在：让复杂的专业知识变得简单易用，让高质量的用户体验变得触手可及。

## 参考资料

- [CSS Paged Media Module Level 3](https://drafts.csswg.org/css-page/)
- [MDN Web Docs - @page](https://developer.mozilla.org/en-US/docs/Web/CSS/@page)
- [CSS-BREAK-3 Specification](https://drafts.csswg.org/css-break-3/)
