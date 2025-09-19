---
title: "关于"
date: 2017-08-20T21:38:52+08:00
lastmod: 2025-04-21T21:41:52+08:00
menu: "main"
weight: 50

# you can close something for this content if you open it in config.toml.
comment: false
mathjax: false
aplayer: true
---

### 👋 你好世界！

Hey，我是<strong style="color:#A65800;font-size:1.2em">Shuey</strong>，一名靠敲代码维生的<strong style="color:#0066CC;">代码猿</strong>，一位无可救药的<a href="/categories/二次元/"><strong style="color:#FF69B4;">二次元爱好者</strong></a>。

如果用代码来描述我的日常：

```go
for isAwake {
  if needToWork {
    writeCode()
    fixBugs()                    // 修复昨天的自己埋下的坑
    createNewBugs()              // 为明天的自己准备工作，循环不息
  } else {
    go watchAnime()              // 耗内存：高，会导致现实感知缓冲区溢出
    go readManga()               // 警告：可能引发"再看一话"死循环
    go readLightNovel()          // 异常：当老婆被NTR时可能抛出震怒异常

    // TODO: 实现社交功能，但优先级较低
    // FIXME: 睡眠模块似乎有内存泄漏
    <-time.After(time.Hour * 6)
  }
}
```

### 👨‍💻 技术与二次元双修

白天我在和 bug 玩躲猫猫，晚上我在番剧世界里畅游。我的硬盘里存满了源代码和动漫，分不清哪个占用空间更多。

喜欢用动漫角色做头像，偶尔会把最爱的女角色设为桌面背景——这可能是我写代码效率突然提高的秘密武器！

<style>
ul.carousel {
    display: flex;
    scroll-behavior: smooth;
    gap: 15px;
    overflow-x: auto;
    overflow-y: hidden;
    padding: 10px;
    overscroll-behavior-x: contain;
    scroll-snap-type: x mandatory;
    anchor-name: --carousel;
    scrollbar-width: none;
    margin-bottom: 10px;
    user-select: none;
}
.carousel::scroll-button(*) {
    position: fixed;
    position-anchor: --carousel;
    font-family: "Material Symbols Outlined";
    background-color: rgba(0,0,0,0.5);
    color: white;
    border: none;
    border-radius: 50%;
    aspect-ratio: 1;
    font-size: 20px;
    cursor: pointer;
    border: 1px solid var(--theme-border-primary);
}
.carousel::scroll-button(*):hover {
    background-color: rgba(36, 36, 36, 0.5);
    font-weight: 900;
}
.carousel::scroll-button(*):disabled {
    opacity: 0.25;
    cursor: not-allowed;
}
.carousel::scroll-button(right) {
    position-area: center span-inline-start;
    content: '→' / 'Next';
}
.carousel::scroll-button(left) {
    position-area: center span-inline-end;
    content: '←' / 'Previous';
}

.carousel li.anime-card {
    width: 160px;
    height: fit-content;
    border-radius: 8px;
    transition: transform 0.3s;
    position: relative;
    list-style: none;
    flex-shrink: 0;
    margin-top: 0;
}
.anime-card:hover {
    transform: translateY(-3px)  scale(1.05);
}
.anime-card img {
    width: 100%;
    display: block;
    aspect-ratio: 32 / 45;
    object-fit: cover;
}
@media screen and (max-width: 767px) {
    .anime-card {
        width: 100px;
    }
}
</style>

在二次元领域涉猎广泛，从载体上包括：小说，漫画，动画。但是由于渐渐的失去看小说的熬夜气势，主要还是在动画上有所奋斗。

### 💻 技术栈

<style>
.skill-container {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
  margin: 15px 0;
}

.skill-badge {
  padding: 5px 12px;
  border-radius: 4px;
  font-weight: bold;
  transition: all 0.3s;
}

.skill-badge:hover {
  transform: translateY(-2px);
}

.java { background-color: #5dc8cd; color: white; }
.c { background-color: #283593; color: white; }
.python { background-color: #ffd43b; color: #333; }
.deep-learning { background-color: #FF7800; color: white; }
</style>

<div class="skill-container">
    <span class="skill-badge java">Java</span>
    <span class="skill-badge c">C/C++</span>
    <span class="skill-badge python">Python</span>
    <span class="skill-badge deep-learning">图像处理</span>
    <span class="skill-badge deep-learning">深度学习</span>
    <span class="skill-badge deep-learning">TensorFlow</span>
</div>

因为自己写的东西对别人有所帮助是让我感到高兴乃至兴奋的事情。所以开始接触网络开发，并逐渐对图像处理和深度学习产生了兴趣。目前还在学习深度学习的相关知识，所以大家也有可能在我的Blog里面看到和深度学习相关的文章。

### 🌟 我最喜欢的动画

<ul class="carousel">
    <li class="anime-card">
        <a href="https://bgm.tv/subject/282" target="blank">
            <img loading="lazy" src="/images/about/spice-and-wolf.jpg" alt="狼与香辛料">
        </a>
    </li>
    <li class="anime-card">
        <a href="https://bgm.tv/subject/9912" target="blank">
            <img loading="lazy" src="/images/about/daily.jpg" alt="日常">
        </a>
    </li>
    <li class="anime-card">
        <a href="https://bgm.tv/subject/100444" target="blank">
            <img loading="lazy" src="/images/about/your-lie-in-april.jpg" alt="四月是你的谎言">
        </a>
    </li>
    <li class="anime-card">
        <a href="https://bgm.tv/subject/283" target="blank">
            <img loading="lazy" src="/images/about/minamike.webp" alt="南家三姐妹">
        </a>
    </li>
    <li class="anime-card">
        <a href="https://bgm.tv/subject/235130" target="blank">
            <img loading="lazy" src="/images/about/grand-blue.jpeg" alt="碧蓝之海">
        </a>
    </li>
    <li class="anime-card">
        <a href="https://bgm.tv/subject/219200" target="blank">
            <img loading="lazy" src="/images/about/teasing-master-takagi-san.jpg" alt="擅长捉弄的高木同学">
        </a>
    </li>
    <li class="anime-card">
        <a href="https://bgm.tv/subject/340" target="blank">
            <img loading="lazy" src="/images/about/mushishi.jpg" alt="虫师">
        </a>
    </li>
    <li class="anime-card">
        <a href="https://bgm.tv/subject/114685" target="blank">
            <img loading="lazy" src="/images/about/plastic-memories.jpg" alt="可塑性记忆">
        </a>
    </li>
    <li class="anime-card">
        <a href="https://bgm.tv/subject/335722" target="blank">
            <img loading="lazy" src="/images/about/human-discoveries.jpg" alt="人类发现">
        </a>
    </li>
    <li class="anime-card">
        <a href="https://bgm.tv/subject/52781" target="blank">
            <img loading="lazy" src="/images/about/the-simpsons.jpg" alt="辛普森一家">
        </a>
    </li>
    <li class="anime-card">
        <a href="https://bgm.tv/subject/25961" target="blank">
            <img loading="lazy" src="/images/about/tom-and-jerry.jpg" alt="猫和老鼠">
        </a>
    </li>
    <li class="anime-card">
        <a href="https://bgm.tv/subject/247417" target="blank">
            <img loading="lazy" src="/images/about/how-clumsy-you-are.jpg" alt="笨拙之极的上野">
        </a>
    </li>
    <li class="anime-card">
        <a href="https://bgm.tv/subject/194877" target="blank">
            <img loading="lazy" src="/images/about/uzakichan.jpg" alt="宇崎学妹想要玩！">
        </a>
    </li>
    <li class="anime-card">
        <a href="https://bgm.tv/subject/194877" target="blank">
            <img loading="lazy" src="/images/about/tawawa-on-monday.jpg" alt="星期一的丰满">
        </a>
    </li>
</ul>

里面的<a href="https://bgm.tv/character/1976">赫萝</a>是我一直的追求。可能这些番极好的满足了老夫的少女心吧！

<style>
.tag-container {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin: 15px 0;
  user-select: none;
}

.tag-checkbox {
  display: none;
}

.tag-label {
  padding: 2px 10px;
  border-radius: 15px;
  background-color: #9f3ed5;
  color: white;
  font-size: 0.9em;
  cursor: pointer;
  transition: all 0.3s;
  display: inline-block;
  position: relative;
  overflow: hidden;
}

.tag-label:hover {
  transform: scale(1.05);
  box-shadow: 0 2px 4px rgba(0,0,0,0.2);
}

/* 选中时的样式 */
.tag-checkbox:checked + .tag-label {
  background-color: #FF7800;
  transform: scale(1.05);
  box-shadow: 0 2px 4px rgba(0,0,0,0.2);
}

/* 点击时的波纹效果 */
.tag-label::after {
  content: '';
  position: absolute;
  top: 50%;
  left: 50%;
  width: 5px;
  height: 5px;
  background: rgba(255, 255, 255, 0.7);
  opacity: 0;
  border-radius: 100%;
  transform: scale(1, 1) translate(-50%);
  transform-origin: 50% 50%;
}

/* 选中时的闪烁效果 */
.tag-checkbox:checked + .tag-label {
  animation: glow 1.5s ease-in-out;
}

/* 闪烁动画 */
@keyframes glow {
  0% {
    box-shadow: 0 0 5px rgba(255, 120, 0, 0.6);
  }
  50% {
    box-shadow: 0 0 20px rgba(255, 120, 0, 0.9), 0 0 30px rgba(255, 120, 0, 0.3);
  }
  100% {
    box-shadow: 0 0 5px rgba(255, 120, 0, 0.6);
  }
}
</style>

<div class="tag-container">
    <div>
        <input type="checkbox" id="funny" class="tag-checkbox">
        <label for="funny" class="tag-label">搞笑</label>
    </div>
    <div>
        <input type="checkbox" id="love" class="tag-checkbox">
        <label for="love" class="tag-label">恋爱</label>
    </div>
    <div>
        <input type="checkbox" id="tearjerker" class="tag-checkbox">
        <label for="tearjerker" class="tag-label">催泪</label>
    </div>
    <div>
        <input type="checkbox" id="cute" class="tag-checkbox">
        <label for="cute" class="tag-label">萌系</label>
    </div>
    <div>
        <input type="checkbox" id="angst" class="tag-checkbox">
        <label for="angst" class="tag-label">致郁</label>
    </div>
    <div>
        <input type="checkbox" id="sex" class="tag-checkbox">
        <label for="sex" class="tag-label">卖肉</label>
    </div>
</div>

欢迎大家和我聊动漫相关的话题！！