/** @see https://zhuanlan.zhihu.com/p/668295374 */
/** @see https://soundquest.jp/quest/rhythm/rhythm-mv2/envelope1/ */

import { ElementAnimator } from './utils/animation';
import { CanvasManager } from './utils/canvas';
import { DOMEmitter } from './utils/dom';
import { Disposable, IDisposable } from './utils/disposable';

// #region Global Variables
enum PianoKeyShape {
  WHITE,
  BLACK,
}

const WHITE_KET_COUNT = 52;
const KEY_PATTERN = [
  PianoKeyShape.WHITE, PianoKeyShape.BLACK, PianoKeyShape.WHITE, PianoKeyShape.BLACK,
  PianoKeyShape.WHITE, PianoKeyShape.WHITE, PianoKeyShape.BLACK, PianoKeyShape.WHITE,
  PianoKeyShape.BLACK, PianoKeyShape.WHITE, PianoKeyShape.BLACK, PianoKeyShape.WHITE
];
const KEYBOARD_PATTERN = [
  'KeyA', 'KeyW', 'KeyS', 'KeyE', 'KeyD',
  'KeyF', 'KeyT', 'KeyG', 'KeyY', 'KeyH',
  'KeyU', 'KeyJ', 'KeyK', 'KeyO', 'KeyL',
  'KeyP', 'Semicolon', 'Quote', 'BracketRight',
  'Enter', 'Backslash'
]
const NOTE_COLORS = [
  "#E33059", "#F75839", "#F7943D", "#F3B72F",
  "#EDD929", "#95C631", "#56A754", "#11826D",
  "#3160A3", "#5B37CC", "#A347BF", "#EA57B2"
]
const PATTERN_BIAS = 9;
const PIANO_KEY_COUNTS = 88;
const CENTER_C_POSITION = 39;

const RATIO = 0.08;
const DISPLAY_OPACITY = '0.6';
const MIN_KEY_SIZE = 8;
// #endregion

class SoundGenerator {
  static INSTANCE: SoundGenerator = new SoundGenerator();
  static TWELVE_TET = 12;

  private audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
  private audioBuffer: AudioBuffer | null = null;

  public isReady: Promise<void>;

  private constructor() {
    this.isReady = fetch('/magic/piano.mp3')
      .then((response) => response.arrayBuffer())
      .then((data) => this.audioContext.decodeAudioData(data))
      .then((buffer) => {
        this.audioBuffer = buffer;
      })
      .catch((error) => console.error('Error loading sounds:', error));
  }

  public getSound(frequency: number) {
    if (!this.audioBuffer) {
      throw new Error('Sounds not loaded yet');
    }
    const bufferSource = this.audioContext.createBufferSource();
    bufferSource.buffer = this.audioBuffer;
    bufferSource.playbackRate.value = frequency;

    bufferSource.connect(this.audioContext.destination);
    return bufferSource;
  }
}

class Piano extends Disposable {
  keys: PianoKey[] = [];

  private damperPedal: DamperPedal = null!;
  private keyReleaseMap: Map<string, PianoKey> = new Map();
  private keyControlIndex = CENTER_C_POSITION;

  constructor(
    keydownEmitter: DOMEmitter<'keydown'>,
    keyupEmitter: DOMEmitter<'keyup'>
  ) {
    super();
    this._register(keydownEmitter.event((e) => {
      if (e.repeat) {
        return;
      }
      if (e.code === 'KeyZ') {
        this.keyControlIndex -= KEY_PATTERN.length;
        if (this.keyControlIndex + PATTERN_BIAS < 0) {
          this.keyControlIndex = -PATTERN_BIAS;
        }
        return;
      }
      if (e.code === 'KeyX') {
        this.keyControlIndex += KEY_PATTERN.length;
        if (this.keyControlIndex - PATTERN_BIAS > PIANO_KEY_COUNTS) {
          this.keyControlIndex = PIANO_KEY_COUNTS - PATTERN_BIAS;
        }
        return;
      }
      const key = KEYBOARD_PATTERN.indexOf(e.code);
      if (key === -1) {
        return;
      }
      const pianoKey = this.keys[key + this.keyControlIndex];
      if (pianoKey) {
        pianoKey.down();
        this.keyReleaseMap.set(e.code, pianoKey);
      }
    }));
    this._register(keyupEmitter.event((e) => {
      const toRelease = this.keyReleaseMap.get(e.code);
      if (!toRelease) {
        return;
      }
      toRelease.up();
    }));
  }

  setDamperPedal(damperPedal: DamperPedal) {
    if (this.damperPedal) {
      throw new Error("Damper pedal already set");
    }
    this.damperPedal = this._register(damperPedal);
  }

  addKey(key: PianoKey) {
    this._register(key);
    this.keys.push(key);
  }

  draw(ctx: CanvasRenderingContext2D, x: number, y: number, width: number, height: number) {
    ctx.clearRect(x, y, width, height);
    const nextDraw: Array<[PianoKey, any]> = [];
    const whiteWidth = width / WHITE_KET_COUNT;
    const blackKeyWidth = whiteWidth * 0.5;
    const blackKeyHeight = height * 0.7;
    let current = 0;
    this.keys.forEach((key) => {
      if (key.shape === PianoKeyShape.WHITE) {
        key.draw(ctx, current, whiteWidth, height);
        current += whiteWidth;
      } else {
        nextDraw.push([key, { x: current - blackKeyWidth / 2, width: blackKeyWidth, height: blackKeyHeight }]);
      }
    });
    nextDraw.forEach(([key, { x, width, height }]) => key.draw(ctx, x, width, height));

    ctx.save();
    ctx.globalCompositeOperation = 'destination-in';
    const gradient = ctx.createLinearGradient(0, 0, 0, height);

    // 设置渐变的颜色和透明度
    gradient.addColorStop(0, 'rgba(255, 255, 255, 0)'); // 顶部完全透明
    gradient.addColorStop(1, 'rgba(255, 255, 255, 1)'); // 底部完全不透明

    // 将渐变应用到画布上
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, width, height);
    ctx.restore();
  }

  public dispose(): void {
    super.dispose();
    this.keyReleaseMap.clear();
  }
}

class DamperPedal extends Disposable {
  private _isPressed = false;
  public get isPressed() {
    return this._isPressed;
  }

  private activatedSounds: AudioBufferSourceNode[] = [];

  constructor(
    private piano: Piano,
    keydownEmitter: DOMEmitter<'keydown'>,
    keyupEmitter: DOMEmitter<'keyup'>
  ) {
    super();
    this._register(keydownEmitter.event((e) => {
      if (e.repeat) {
        return;
      }
      if (e.code === 'ShiftLeft') {
        this._isPressed = true;
        this.piano.keys.forEach((key) => {
          if (key.isPressed) {
            this.addSound(key.transSound());
          }
        });
      }
    }));
    this._register(keyupEmitter.event((e) => {
      if (e.code === 'ShiftLeft') {
        this._isPressed = false;
        this.activatedSounds.forEach((sound) => sound.stop(0));
        this.activatedSounds = [];
      }
    }));
  }

  addSound(sound?: AudioBufferSourceNode) {
    sound && this.activatedSounds.push(sound);
  }
}

class PianoKey implements IDisposable {
  public readonly frequency: number;

  private sound: AudioBufferSourceNode | null = null;

  private _isPressed = false;
  public get isPressed() {
    return this._isPressed;
  }

  constructor(
    public shape: PianoKeyShape,
    public color: string,
    TET: number,
    private damperPedal: DamperPedal
  ) {
    this.frequency = Math.pow(2, TET / SoundGenerator.TWELVE_TET);
  }

  get isCenterC() {
    return this.frequency === 1;
  }

  draw(ctx: CanvasRenderingContext2D, x: number, width: number, height: number) {
    ctx.fillStyle = this._isPressed ? this.color : this.shape === PianoKeyShape.WHITE ? 'white' : 'black';
    ctx.fillRect(x, 0, width, height);
    ctx.strokeStyle = 'black';
    ctx.strokeRect(x, 0, width, height);
    if (this.isCenterC) {
      // Draw a small circle at the bottom of the key to mark Center C
      ctx.save();
      ctx.fillStyle = 'red';
      const circleRadius = Math.min(width, height) * 0.1;
      const circleX = x + width / 2;
      const circleY = height - circleRadius * 2;
      ctx.beginPath();
      ctx.arc(circleX, circleY, circleRadius, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    }
  }

  transSound() {
    if (!this.sound) {
      return;
    }
    const sound = this.sound;
    this.sound = null;
    return sound;
  }

  down() {
    if (this._isPressed) {
      return;
    }
    this.sound = SoundGenerator.INSTANCE.getSound(this.frequency);
    this.sound.start(0);
    this._isPressed = true;

    if (this.damperPedal.isPressed) {
      this.damperPedal.addSound(this.transSound());
    }
  }

  up() {
    this.sound && this.sound.disconnect();
    this._isPressed = false;
  }

  dispose(): void {
    this.up();
  }
}

// #region Canvas Resize
onActive((context) => {
  const keydownEmitter = context.add(new DOMEmitter(window, 'keydown'));
  const keyupEmitter = context.add(new DOMEmitter(window, 'keyup'));

  const piano = context.add(new Piano(keydownEmitter, keyupEmitter));
  const damperPedal = new DamperPedal(piano, keydownEmitter, keyupEmitter);
  piano.setDamperPedal(damperPedal);

  for (let i = 0; i < PIANO_KEY_COUNTS; i++) {
    const patternIndex = (i + PATTERN_BIAS) % KEY_PATTERN.length;
    piano.addKey(new PianoKey(KEY_PATTERN[patternIndex], NOTE_COLORS[patternIndex], i - CENTER_C_POSITION, damperPedal));
  }

  const canvasManager = new CanvasManager(document.body, {
    autoResize: false,
    styles: {
      position: 'fixed',
      opacity: DISPLAY_OPACITY,
      bottom: '0',
      left: '50%',
      transform: 'translateX(-50%)',
      boxShadow: '0px 4px 6px rgba(0, 0, 0, 0.3)',
      zIndex: '9999',
    }
  });
  const canvas = canvasManager.element;
  const canvasContext = canvasManager.getContext('2d')!;
  canvasManager.linkSize(document.body, function (entry, canvas) {
    const { width } = entry.contentRect;
    const length = piano.keys.length;
    const minWidth = length * MIN_KEY_SIZE;
    canvas.width = Math.max(width, minWidth);
    canvas.height = canvas.width * RATIO;
    piano.draw(canvasContext, 0, 0, canvas.width, canvas.height);
  });
  canvasManager.startRenderLoop(() => piano.draw(canvasContext, 0, 0, canvas.width, canvas.height));

  // Replace CSS transitions with Element.animate for animations
  ElementAnimator.show(canvas, [
    { transform: 'translateX(-50%) translateY(100px)', opacity: '0' },
    { transform: 'translateX(-50%) translateY(0)', opacity: DISPLAY_OPACITY }
  ]);

  // Modify onDeactive to use disappearance animation
  onDeactive(() => ElementAnimator.hide(canvas));
})
// #endregion
