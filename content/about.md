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

<style>
ul.carousel {
    display: flex;
    scroll-behavior: smooth;
    gap: 15px;
    scroll-marker-group: after;
    overflow-x: auto;
    overflow-y: hidden;
    padding: 10px;
    overscroll-behavior-x: contain;
    scroll-snap-type: x mandatory;
    anchor-name: --carousel;
    scrollbar-width: none;
    margin-bottom: 10px;
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

.anime-card {
    min-width: 160px;
    border-radius: 8px;
    transition: transform 0.3s;
    position: relative;
    list-style: none;
    height: 225px;
}
.anime-card:hover {
    transform: translateY(-5px);
}
.anime-card img {
    width: 100%;
    height: 225px;
    object-fit: cover;
}
.anime-card .title {
    transition: bottom 0.3s;
    padding: 16px 8px 0;
    width: 100%;
    position: absolute;
    bottom: -40px;
    text-align: center;
    font-size: 0.9em;
    border-radius: 0 0 6px 6px;
    background-image: linear-gradient(to bottom, transparent, var(--theme-bg-primary) 60%);
    opacity: 0.8;
}
.anime-card:hover .title {
    bottom: -3px;
}
</style>

Hey，我是<strong>Cofal(へいぎ)</strong>，一名还在苦苦求学的渣渣。

我是一位酷爱<strong><a href="{{ site.url }}/tags/#二次元">二次元</a></strong>的活瘦宅,在二次元领域涉猎广泛，从载体上包括：小说，漫画，动画。但是由于渐渐的失去看小说的熬夜气势，主要还是在动画上有所奋斗。

### 🌟 我最喜欢的动画

<ul class="carousel">
    <a href="https://bgm.tv/subject/282" target="blank">
        <li class="anime-card">
            <img loading="lazy" src="/images/about/spice-and-wolf.webp" alt="狼与香辛料">
            <div class="title">狼与香辛料</div>
        </li>
    </a>
    <a href="https://bgm.tv/subject/114685" target="blank">
        <li class="anime-card">
            <img loading="lazy" src="/images/about/plastic-memories.jpg" alt="可塑性记忆">
            <div class="title">可塑性记忆</div>
        </li>
    </a>
    <a href="https://bgm.tv/subject/100444" target="blank">
        <li class="anime-card">
            <img loading="lazy" src="/images/about/your-lie-in-april.jpg" alt="四月是你的谎言">
            <div class="title">四月是你的谎言</div>
        </li>
    </a>
    <a href="https://bgm.tv/subject/283" target="blank">
        <li class="anime-card">
            <img loading="lazy" src="/images/about/minamike.webp" alt="南家三姐妹">
            <div class="title">南家三姐妹</div>
        </li>
    </a>
    <a href="https://bgm.tv/subject/235130" target="blank">
        <li class="anime-card">
            <img loading="lazy" src="/images/about/grand-blue.jpeg" alt="碧蓝之海">
            <div class="title">碧蓝之海</div>
        </li>
    </a>
    <a href="https://bgm.tv/subject/219200" target="blank">
        <li class="anime-card">
            <img loading="lazy" src="/images/about/teasing-master-takagi-san.jpg" alt="擅长捉弄的高木同学">
            <div class="title">擅长捉弄的高木同学</div>
        </li>
    </a>
    <a href="https://bgm.tv/subject/340" target="blank">
        <li class="anime-card">
            <img loading="lazy" src="/images/about/mushishi.jpg" alt="虫师">
            <div class="title">虫师</div>
        </li>
    </a>
    <a href="https://bgm.tv/subject/335722" target="blank">
        <li class="anime-card">
            <img loading="lazy" src="/images/about/human-discoveries.jpg" alt="人类发现">
            <div class="title">人类发现</div>
        </li>
    </a>
    <a href="https://bgm.tv/subject/52781" target="blank">
        <li class="anime-card">
            <img loading="lazy" src="/images/about/the-simpsons.jpg" alt="辛普森一家">
            <div class="title">辛普森一家</div>
        </li>
    </a>
    <a href="https://bgm.tv/subject/25961" target="blank">
        <li class="anime-card">
            <img loading="lazy" src="/images/about/tom-and-jerry.jpg" alt="猫和老鼠">
            <div class="title">猫和老鼠</div>
        </li>
    </a>
    <a href="https://bgm.tv/subject/247417" target="blank">
        <li class="anime-card">
            <img loading="lazy" src="/images/about/how-clumsy-you-are.jpg" alt="笨拙之极的上野">
            <div class="title">笨拙之极的上野</div>
        </li>
    </a>
    <a href="https://bgm.tv/subject/194877" target="blank">
        <li class="anime-card">
            <img loading="lazy" src="/images/about/tawawa-on-monday.jpg" alt="星期一的丰满">
            <div class="title">星期一的丰满</div>
        </li>
    </a>
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

.tag {
  padding: 5px 10px;
  border-radius: 15px;
  background-color: #9f3ed5;
  color: white;
  font-size: 0.9em;
  cursor: pointer;
  transition: all 0.3s;
}

.tag:hover {
  transform: scale(1.05);
  box-shadow: 0 2px 4px rgba(0,0,0,0.2);
}
</style>

<div class="tag-container">
    <div class="tag" onclick="highlightTag(this)">搞笑番</div>
    <div class="tag" onclick="highlightTag(this)">恋爱番</div>
    <div class="tag" onclick="highlightTag(this)">催泪番</div>
    <div class="tag" onclick="highlightTag(this)">萌系番</div>
</div>

欢迎大家和我聊动漫相关的话题！！

### 👨‍💻 正式的自我介绍

我是一名<span style="color:#A65800; font-size:1.2em; font-weight:bold;">打工人</span>。

和大家一样，在宿舍依靠着动漫游戏<span style="color:#090974">kill my whole time</span>。平时没有啥兴趣爱好，偶尔用自己的服务器在网上爬取一些盗版电影，简单的写点程序。

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

<p>
    &emsp;&emsp;<span style="color:#090974">因为自己写的东西对别人有所帮助是让我感到高兴乃至兴奋的事情</span>。所以开始接触网络开发，并逐渐对图像处理和深度学习产生了兴趣。目前还在学习深度学习的相关知识，所以大家也有可能在我的Blog里面看到和深度学习相关的文章。
</p>

<script>
function highlightTag(element) {
  element.style.backgroundColor = element.style.backgroundColor === 'rgb(255, 120, 0)' ? '#9f3ed5' : '#FF7800';
}
</script>
