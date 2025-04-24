import { DisposableStore } from "./magic/utils/disposable";

function isLucky() {
  const luck = Math.random();
  return luck > 0.1;
}

function loadScript(url: string, integrity: string, crossorigin: string) {
  return new Promise<void>((resolve, reject) => {
    const script = document.createElement('script');
    script.src = url;
    script.integrity = integrity;
    script.crossOrigin = crossorigin;
    script.onload = () => {
      script.remove();
      resolve();
    }
    script.onerror = () => reject(new Error(`Failed to load script: ${url}`));
    document.body.appendChild(script);
  });
}

let _onDeactive: () => Promise<void> | void, _context: DisposableStore;
async function onDeactive(cb?: () => Promise<void> | void) {
  if (typeof cb === 'function') {
    _onDeactive = cb;
  } else {
    _onDeactive && await _onDeactive();
    _context && _context.dispose();
    _onDeactive = null!; // 清空回调函数
  }
}
window.onDeactive = onDeactive;
window.onActive = function onActive(cb) {
  _context = new DisposableStore();
  cb(_context);
}

const magicSource = document.getElementById('magic-source') as HTMLScriptElement;
const magicData = JSON.parse(magicSource.text);

const authorCard = document.getElementById('author-card');
if (authorCard) {
  const magicKeys = Object.keys(magicData);
  const shownMagic = JSON.parse(localStorage.getItem('shown-magic') || '{}');

  let isBusy = false;
  authorCard.addEventListener('click', async function () {
    if (isBusy) return;
    isBusy = true;
    await onDeactive();
    if (Object.keys(shownMagic).length >= magicKeys.length) {
      // 清空对象
      for (const key in shownMagic) {
        delete shownMagic[key];
      }
    }
    const notShownMagic = magicKeys.filter(key => !shownMagic[key]);
    const randomKey = notShownMagic[Math.floor(Math.random() * notShownMagic.length)];
    const magicScript = magicData[randomKey];
    loadScript(magicScript.url, magicScript.integrity, magicScript.crossorigin)
      .then(() => {
        console.log(`Loaded magic: ${randomKey}`);
        // 在这里可以执行魔法脚本的相关操作
      })
      .catch(error => {
        console.error(`Error loading magic: ${error}`);
      });
    if (isLucky()) {
      shownMagic[randomKey] = true; // 使用对象属性记录已显示的魔法
    }
    localStorage.setItem('shown-magic', JSON.stringify(shownMagic));
    isBusy = false;
  });
}

document.addEventListener('keyup', function (event) {
  if (event.key === 'Escape') {
    onDeactive();
  }
});