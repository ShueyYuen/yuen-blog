---
author: "Shuey Yuen"
date: 2022-03-13T22:57:32+08:00
title: "Vercel搭建博客"
description: 如何最大限度的白嫖可用的资源。
tags: [
    "Vercel", "MongoDB", "Next", "Hugo", "Waline", "Algolia"
]
categories: [
    "Web",
]
toc: true
cover: /images/2022/0313/title-bg.webp
cover_author: ArseniXC
cover_source: https://www.pixiv.net/artworks/59519837
---

## 白嫖项目

***感谢所有为开发者提供服务和便利的平台***

博客主要由[Vercel][]提供的静态网页平台搭建，[MongoDB][]提供数据库服务，以及[LeanCloud][]提供数据存储服务（~~以上是白嫖的服务~~）。

当然还有没办法白嫖的，比如希望自己的博客拥有一个容易记住的域名，例如本站的[shuey.fun](https://www.shuey.fun)，不得不花费重金购买:smiling_face_with_tear:[^note].

## Vercel

> [Vercel][] is a cloud platform for static frontends and serverless functions. Applications deployed to Vercel can connect to Atlas clusters using serverless functions that use the MongoDB Node.js driver or the Mongoose ODM library.

登录[Vercel][]注册一个账号，选择**新增项目**。

![vercel dashboard](/images/2022/0313/vercel.png)

此处使用[Hugo][][^hugo]来构建，所以在选择模板的选择**浏览所有模板**，选择Hugo，授权Github账户的访问权限，之后就可以按照Vercel的操作提示一路走下去，结果部署后，网页就会在`***.vercel.app`的地址上被部署。

![vercel new project](/images/2022/0313/project.webp)

如果希望自己的域名更加简单，需要在其他的域名服务商处购买域名绑定到vercel上。

部署Hugo的详细教程请参见[Vercel部署Hugo教程](https://vercel.com/guides/deploying-hugo-with-vercel "如何使用Vercel部署Hugo")。

## 博客美化

### 主题

本页面使用[Kagome主题][]美化，个人比较喜欢这个主题的拟态设计，因此也对页面的评论区做了拟态化设计的适配。大家的风格各不相同，可以去[Hugo主题网站](https://themes.gohugo.io/themes/ "Hugo收录主题")寻找自己喜欢的主题风格。

### 评论系统

之后就是引入评论系统，这样才方便和大家之间的交流，网上又很多提供相应功能的插件，例如[Disqus](https://disqus.com/)，但是比较在国内不是很方便，于是抱着白嫖就要白嫖的彻彻底底的原则，又开始查找可以用Vercel解决的方案——于是我找到[Waline][][^waline]。

官方的使用文档写的特别详细，大家可以前去参考使用[Waline快速上手](https://waline.js.org/guide/get-started.html "Vercel部署Waline")。此处吐槽一下自己的傻瓜行为，我看教程没有仔细看教程的配图，导致一直以为前面的步骤在教导我部署一个博客服务，实际上[Waline][]需要一个基于[Vercel][]的后台！所以官方部署后台的部分都是通过下面这个按钮进入的！！

<a href="https://vercel.com/import/project?template=https://github.com/walinejs/waline/tree/main/example" target="_blank" rel="noopener noreferrer"><img src="https://vercel.com/button" alt="Vercel"></a>

部署好服务后应该可以看到和**图一**最后一个一样的服务在运行，这里可以不绑定域名，直接绑定以`vercel.app`结尾的域名即可，如果绑定域名则需要将`serverURL`换成绑定的域名，例如我这个博客就使用的`comment.shuey.fun`。

```javascript
Waline({
  el: '#waline',
  serverURL: 'https://your-domain.vercel.app',
});
```

### 邮件服务

注意到官方文档中支持评论回复的邮件提醒，如果需要开始这个功能，就需要一个邮箱啦，例如[网易的邮箱](https://mail.163.com "163邮箱")，此处可以详细参考[Waline绑定邮箱](https://waline.js.org/guide/server/notification.html "Waline回复评论通知")。

但是我认为从我的博客回复我的消息，但是没有从我的邮箱中回复回去消息，是不是显得很掉价呢？于是我又去找白嫖的邮箱服务，于是又找到一个适合白嫖的邮箱——[腾讯企业邮箱][]。进入[腾讯企业邮箱][]后选择`立即注册`，同意开通企业微信后继续，然后就可以随便注册一个企业，不需要企业真实存在哦，可以是自己随便的一个组织，然后绑定**自己的域名**即可，就可以获得`comment-reply@shuey.fun`类似的自定义邮箱啦~~

> 提醒：目前腾讯企业邮箱的业务邮箱隐藏很深，需要在`协作`->`邮箱管理`->`业务邮箱`里面添加一个业务邮箱。

更加详细的配置可以直接参考此篇博文：[Waline 评论系统的介绍与基础配置](https://guanqr.com/tech/website/introduction-and-basic-setting-of-waline/)。基础的功能配置完成后应该包含如下图所示的环境变量。

![Vercel Envs](/images/2022/0313/envs.webp)

## FaaS

使用[Next.js][]作为后台服务的提供，数据库使用从[MongoDB][]申请到的512MB大小的数据库。

### MongoDB申请

详细的申请过程可以参考此篇博文：[Vercel搭建API 服务，无需服务器](https://www.tangly1024.com/article/vercel-free-serverless-api)，以及MongoDB官方提供的[Vercel中使用MongoDB的最佳实践](https://docs.atlas.mongodb.com/best-practices-connecting-from-vercel/)。

使用过程中推荐在[Vercel][]项目中创建一个环境变量来存储MongoDB的连结字符串，一个请求从大陆地区发起，到Vercel再到MongoDB，一直到最终结束请求，大概需要耗时2.5s左右，毕竟是国内的访问速度，还是比较慢的，也有可能是我的MongoDB集群选择再台湾地区的原因。

使用过程中出现以下问题，由于我平常上网日常连公司的VPN，结果这次使用Cloud MongoDB一直出现无法连接的问题，似乎是因为MongoDB那边屏蔽了一些VPN服务器的连接，即使使用`0.0.0.0/0`放开访问也无法连接。

![mongodb dashboard](/images/2022/0313/mongo.png)

### Next.js

直接使用Next.js部署后台服务最为简单，甚至可以同时搭建一个管理界面出来，所以岂不是很好么（~~虽然我不会写React~~）！！！可以直接通过下面的按键部署Next.js。

<a href="https://vercel.com/new/clone?s=https%3A%2F%2Fgithub.com%2Fvercel%2Fvercel%2Ftree%2Fmain%2Fexamples%2Fnextjs&template=nextjs&id=67753070&b=main" target="_blank" rel="noopener noreferrer"><img src="https://vercel.com/button" alt="Vercel"></a>

部署后的默认开发语言是JavaScript，但是不是强类型编程语言，做后台的开发还是很不方便的，于是我增加了TypeScript、MongoDB相关的依赖。

```shell
yarn add --dev @types/mongodb
yarn add --dev @types/react
yarn add --dev @vercel/node
yarn add mongodb
yarn add typescript
```

之后再`pages/api`目录下新增`hello.ts`。下面代码的功能是从MongoDB中访问数据库`vercel`，然后查找集合`demo`中的所有文档，并且返回结果。

```typescript
import { VercelRequest, VercelResponse } from '@vercel/node';
import { MongoClient } from 'mongodb'
const CONNECTION_STRING = process.env.MONGO
module.exports = async (req: VercelRequest, res: VercelResponse) => {
  const client = await MongoClient.connect(CONNECTION_STRING, { minPoolSize: 1 });
  const db = await client.db('vercel');
  var result = await db.collection("demo").find().toArray();
  res.status(200).json(result);
}
```

访问对应的地址`/api/hello`可以获得以下结果：

```json
[
  {
    "_id": "622de8b38f0f0000a6005983",
    "name": "Vercel"
  }
]
```

## 内容搜索

网站已经搭建好了，但是没有搜索功能很不方便用户使用！ 如果是需要某些动态搜索的能力，那么就需要我们按照前段的[Next.js][]方式，配合后端的MongoDB实现接口，当然网上还有很多提供虚拟服务器空间的云厂商，但是大多环境都是Php，可以搭建很多Php后台来处理动态请求。

### Algolia搜索

依然去[Algolia][]上去注册一个账号，里面有免费方案，支持10,000个文档的索引，对于我们搭建网站来说已经完全够用，我觉得大家基本上都写不到10,000个文档页面。

![Algolia New Application](/images/2022/0313/algolia.png)

这一步之后，大家一定要记得去选择Data Center，不然默认会被分配到欧洲的节点，到国内一个数据延迟都要半秒钟，很影响用户的使用体验，别问我怎么知道这件事的。

创建完引用后需要去创建索引，我这边创建的索引名称是`post`，之后在项目的配置中都需要被使用到。其余的配置可以在左下角的`Setting`->`API Keys`中找到，页面中配置的`apiKey`只需要是只读秘钥即可！！！

可以找一个页面会加载的公共部分，插入以下代码：

```html
{{- if .Site.Params.algolia.appId -}}
<script src="https://fastly.jsdelivr.net/npm/docsearch.js@2/dist/cdn/docsearch.min.js"></script>
<script>
    docsearch({
      apiKey: {{ .Site.Params.algolia.searchOnlyKey }},
      indexName: {{ .Site.Params.algolia.indexName }},
      appId: {{ .Site.Params.algolia.appId }},
      inputSelector: '.docsearch-input',
      debug: false,
    });
</script>
{{- end -}}
```

对应的项目配置如下：

```toml
[params]
  [params.algolia]
    vars = ["title", "summary", "date", "publishdate", "expirydate", "permalink"]
    params = ["categories", "tags"]
    appId = "your app id"
    indexName = "your index name"
    searchOnlyKey = "must ensure your search only key"

[outputs]
  home = ['HTML', 'RSS', 'Algolia']
  page = ['HTML']

[outputFormats]
  [outputFormats.Algolia]
    baseName = "algolia"
    isPlainText = true
    mediaType = "application/json"
    notAlternative = true
```

配置中还增加了`output`相关的配置，因为我们需要在生成项目的同时生成对应的查找文档，类似`ElasticSearch`，对应的我们需要创建一个生成模板。

在主题目录下添加文件`layouts/_default/list.algolia.json`，内容为：

```json
{{- $.Scratch.Add "index" slice -}}
{{- range where (where .Site.Pages "Type" "in" (slice "post")) "IsPage" true -}}
  {{- if not .Draft -}}
    {{- $.Scratch.Add "index" (dict "objectID" .File.UniqueID "url" .Permalink "content" (.Summary | plainify) "tags" .Params.Tags "lvl0" .Title "lvl1" .Params.Categories "lvl2" .Description) -}}
  {{- end -}}
{{- end -}}
{{- $.Scratch.Get "index" | jsonify -}}
```

每次生成的文档都需要手动上传，目前我正在思考解决方案，不如`hexo`可以方便的的引入各种`node`包来解决这个问题。不知道[Vercel][]的[Hugo][]环境中是否可以正常的使用npm,稍后研究，哈哈。

## 总结

白嫖的日常完成啦！！**最后还是要感谢所有为开发者提供服务和便利的平台**！！

| 网站 | 地址 |
|-----|-----|
| Vercel | https://vercel.app/ |
| MongoDB | https://cloud.mongodb.com/ |
| LeanCloud | https://leancloud.app/ |
| Hugo | https://gohugo.io/ |
| Waline | https://waline.js.org/ |
| Kagome主题 | https://github.com/miiiku/hugo-theme-kagome |
| 腾讯企业邮箱 | https://work.weixin.qq.com/mail/ |
| Next.js | https://nextjs.org/ |
| Algolia | https://www.algolia.com/ |

[Vercel]: https://vercel.app/ "Vercel官网"
[MongoDB]: https://cloud.mongodb.com/ "MongoDB Cloud官网"
[LeanCloud]: https://leancloud.app/ "LeanCloud官网"
[Hugo]: https://gohugo.io/ "Hogo官网"
[Waline]: https://waline.js.org/ "Waline插件"
[Kagome主题]: https://github.com/miiiku/hugo-theme-kagome "Kagome主题"
[腾讯企业邮箱]: https://work.weixin.qq.com/mail/ "腾讯企业邮箱"
[Next.js]: https://nextjs.org/ "Next.js"
[Algolia]: https://www.algolia.com/ "Algolia搜索"

[^note]: 花费重金购买，阿里云的域名注册服务
[^hugo]: Hugo is one of the most popular open-source static site generators. With its amazing speed and flexibility, Hugo makes building websites fun again.
[^waline]: 一款基于 Valine 衍生的简洁、安全的评论系统。