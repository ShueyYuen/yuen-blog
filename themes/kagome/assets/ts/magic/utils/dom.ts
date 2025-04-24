import { Emitter, type BaseEvent } from "./emitter";
import type { IDisposable } from './disposable';

export interface DOMEventMap extends HTMLElementEventMap, DocumentEventMap, WindowEventMap { }

export class DOMEmitter<T extends keyof DOMEventMap> implements IDisposable {
  private emitter: Emitter<DOMEventMap[T]>;

  get event(): BaseEvent<DOMEventMap[T]> {
    return this.emitter.event;
  }

  constructor(element: Window | HTMLElement, type: T, useCapture?: boolean) {
    const fn = (e: Event) => this.emitter.fire(e as DOMEventMap[T]);
    this.emitter = new Emitter({
      onWillAddFirstListener: () => element.addEventListener(type, fn, useCapture),
      onDidRemoveLastListener: () => element.removeEventListener(type, fn, useCapture),
    });
  }

  dispose(): void {
    this.emitter.dispose();
  }
}

/**
 * 事件监听器，不具有DOMEmitter的懒加载特性
 */
export class DomListener implements IDisposable {
  constructor(
    private node: EventTarget,
    private readonly type: string,
    private handler: (e: any) => void,
    private readonly options: boolean | AddEventListenerOptions = false
  ) {
    this.node.addEventListener(this.type, this.handler, this.options);
  }

  dispose(): void {
    if (!this.handler) {
      // Already disposed
      return;
    }
    this.node.removeEventListener(this.type, this.handler, this.options);
    // Prevent leakers from holding on to the dom or handler func
    this.node = null!;
    this.handler = null!;
  }
}
