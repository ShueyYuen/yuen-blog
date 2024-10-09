declare var APlayer: any;
declare var DPlayer: any;

declare var reloadPlantUML: (isDark: boolean) => void

(function () {
  const themeMedia: MediaQueryList = window.matchMedia("(prefers-color-scheme: light)");

  function toCamel(str: string) {
    const arrs = str.split('-')
    if (arrs.length === 1) return arrs[0]
    return arrs.reduce((accumulator: string, currentValue: string) => {
      return accumulator + currentValue.toLowerCase().replace(/( |^)[a-z]/g, v => v.toUpperCase())
    })
  }

  /**
   * 处理aplayer || dplayer 参数
   * @param el aplayer || dplayer dom
   * @returns 配置项参数
   */
  function formatAttr(el: Element): object {
    const config = {}
    const numberList = ['lrcType']
    const boolMap = new Map([
      ['true', true],
      ['false', false],
      [null, undefined],
    ])
    const attrs = el.getAttributeNames().filter(key => key.startsWith('config-'))
    attrs.forEach(attr => {
      const key = toCamel(attr.replace('config-', ''))
      const value = el.getAttribute(attr)
      const toBool = boolMap.get(value)

      if (toBool !== undefined) {             /** 处理bool值 */
        config[key] = toBool
      } else if (numberList.includes(key)) {  /** 处理number值 */
        config[key] = parseInt(value || '0')
      } else {                                /** string */
        config[key] = value
      }
    })
    return config
  }

  function querySelectorArrs(selector: string): Array<Element> {
    return Array.from(document.querySelectorAll(selector))
  }

  function switchTheme(theme: string) {
    const rootDom: Element = document.documentElement
    switch (theme) {
      case "auto":
        autoSwitchTheme({
          matches: themeMedia.matches, media: ""
        } as MediaQueryListEvent);
        themeMedia.addEventListener("change", autoSwitchTheme);
        break;
      default:
        themeMedia.removeEventListener("change", autoSwitchTheme);
        rootDom.classList.remove(`theme-${theme == "light" ? "dark" : "light"}`);
        rootDom.classList.add(`theme-${theme == "light" ? "light" : "dark"}`);
        rootDom.setAttribute(`data-theme`, theme == "light" ? "light" : "dark");
        window.reloadPlantUML && window.reloadPlantUML(theme == "light");
    }
    window.localStorage.setItem('theme', theme)
  }

  function autoSwitchTheme(e: MediaQueryListEvent) {
    const rootDom: Element = document.documentElement
    rootDom.classList.remove(`theme-${e.matches ? "dark" : "light"}`);
    rootDom.classList.add(`theme-${e.matches ? "light" : "dark"}`);
    rootDom.setAttribute(`data-theme`, e.matches ? "light" : "dark");
    window.reloadPlantUML && window.reloadPlantUML(e.matches)
  }

  interface PlantUMLEncoder {
    encode(code: string): string
  }

  /**
   * footnote tooltip
   */
  function footNoteTooltip() {
    document.querySelectorAll(".footnote-ref").forEach(
      function (elem: Element) {
        let id: string = elem.getAttribute("href")!.substring(1);
        let outerWrapper = <HTMLSpanElement>document.createElement("SPAN");
        outerWrapper.className = "fn-content";
        let innerWrapper = <HTMLSpanElement>document.createElement("SPAN");
        innerWrapper.className = "fn-text";
        innerWrapper.setAttribute("style", "display: none;");
        let footnotes = document.getElementById(id)!.children;
        for (let i = 0; i < footnotes.length; i++) {
          let cloned = footnotes.item(i)!.cloneNode();
          cloned.textContent = footnotes.item(i)!.textContent!.replace("↩︎", "");
          innerWrapper.appendChild(cloned);
        }
        outerWrapper.appendChild(innerWrapper);
        elem.parentElement!.appendChild(outerWrapper);
      });
  }


  function aplayerInit() {
    const aplayers = querySelectorArrs('.aplayer-box')
    if (aplayers.length && APlayer) {
      aplayers.forEach(el => {
        const params = { container: el, audio: { ...el.dataset } }
        const config = formatAttr(el)
        new APlayer(Object.assign({}, config, params))
      })
    }
  }

  function dplayerInit() {
    const dplayers = querySelectorArrs('.dplayer-box')
    if (dplayers.length && DPlayer) {
      dplayers.forEach(el => {
        const params = { container: el, video: { ...el.dataset } }
        const config = formatAttr(el)
        new DPlayer(Object.assign({}, config, params))
      })
    }
  }

  const currentTheme: string = window.localStorage.getItem('theme') || ''
  currentTheme && switchTheme(currentTheme);

  window.addEventListener('DOMContentLoaded', () => {
    /** moble click toggle menu */
    const mobileMenuBtn: Element = document.querySelector('.header-nav--btn')!;
    mobileMenuBtn.addEventListener('click', function () {
      this.classList.toggle('open')
    })

    /** theme change click */
    const themeLightBtn = document.querySelector('#theme-light')!;
    const themeDarkBtn = document.querySelector('#theme-dark')!;
    const themeAuto = document.querySelector('#theme-auto')!;
    themeLightBtn.addEventListener('click', () => switchTheme('light'))
    themeDarkBtn.addEventListener('click', () => switchTheme('dark'))
    themeAuto.addEventListener('click', () => switchTheme('auto'))

    /** background image lazy */
    const lazyBackgrounds = querySelectorArrs('[background-image-lazy]')
    let lazyBackgroundsCount = lazyBackgrounds.length
    if (lazyBackgroundsCount > 0) {
      let lazyBackgroundObserver = new IntersectionObserver(function (entries, observer) {
        entries.forEach(function ({ isIntersecting, target }) {
          if (isIntersecting) {
            let img = target.dataset.img
            if (img) {
              target.style.backgroundImage = `url(${img})`
            }
            lazyBackgroundObserver.unobserve(target)
            lazyBackgroundsCount--
          }
          if (lazyBackgroundsCount <= 0) {
            lazyBackgroundObserver.disconnect()
          }
        })
      })

      lazyBackgrounds.forEach(function (lazyBackground) {
        lazyBackgroundObserver.observe(lazyBackground)
      })
    }

    footNoteTooltip();

    /** aplayer init */
    aplayerInit()
    /** dplayer init */
    dplayerInit()
  });
})();

(function () {
  
  window.addEventListener('DOMContentLoaded', () => {
    const headers = document.querySelectorAll('.markdown-body h2, .markdown-body h3');
    const tocLinks = Array.from(document.querySelectorAll<HTMLAnchorElement>('#TableOfContents a')).reduce((acc, link) => {
      acc.set(link.getAttribute('href')!, link);
      return acc;
    }, new Map<string, HTMLAnchorElement>());

    function highlightTocLink() {
      let index = 0;
      headers.forEach((header, i) => {
        const rect = header.getBoundingClientRect();
        if (rect.top <= window.innerHeight / 4) {
          index = i;
        }
      });

      const header = headers[index];
      tocLinks.forEach(link => link.classList.remove('active'));
      const tocLink = tocLinks.get('#' + header.id);
      if (tocLink) {
        tocLink.classList.add('active');
      }
    }

    highlightTocLink();
    window.addEventListener('scroll', highlightTocLink);
  });
})();
