import { toEvent, toCombo } from '../extracted'
import { toImplementation } from './Listenable'
import type {
  ListenableClickcombo,
  ListenableKeycombo,
  ListenablePointercombo,
  ListenableSupportedEventType
} from './Listenable'

export type DispatchableOptions = Record<string, never>

export type DispatchableStatus = 'ready' | 'dispatched'

export type DispatchOptions<EventType extends ListenableSupportedEventType> = {
  init?:
    EventType extends ListenableClickcombo ? EventHandlersEventInitMap['mousedown'] :
    EventType extends ListenablePointercombo ? EventHandlersEventInitMap['pointerdown'] :
    EventType extends ListenableKeycombo ? EventHandlersEventInitMap['keydown'] :
    EventType extends keyof Omit<HTMLElementEventMap, 'resize'> ? EventHandlersEventInitMap[EventType] :
    EventType extends keyof Omit<DocumentEventMap, 'resize'> ? EventHandlersEventInitMap[EventType] :
    never
  target?: Window & typeof globalThis | Document | Element
} & (EventType extends ListenableKeycombo ? { keyDirection?: 'up' | 'down' } : {})

export class Dispatchable<EventType extends ListenableSupportedEventType> {
  constructor (type: EventType, options: DispatchableOptions = {}) {
    this.setType(type)
    this.ready()
  }
  private computedStatus: DispatchableStatus
  private ready () {
    this.computedStatus = 'ready'
  }

  get type () {
    return this.computedType
  }
  set type (type) {
    this.setType(type)
  }
  get cancelled () {
    return this.computedCancelled
  }
  get status () {
    return this.computedStatus
  }

  private computedType: EventType
  setType (type) {
    this.computedType = type
    return this
  }

  private computedCancelled: boolean
  dispatch (options: DispatchOptions<EventType> = {}) {
    const { target = window, ...rest } = options,
          event = toEvent(this.type, rest)
    
    this.computedCancelled = !target.dispatchEvent(event)
    this.dispatched()

    return this
  }
  private dispatched () {
    this.computedStatus = 'dispatched'
  }
}

type EventHandlersEventInitMap =
  GlobalEventHandlersEventInitMap
  & DocumentAndElementEventHandlersEventInitMap
  & DocumentEventInitMap

type GlobalEventHandlersEventInitMap = {
  "abort": UIEventInit;
  "animationcancel": AnimationEventInit;
  "animationend": AnimationEventInit;
  "animationiteration": AnimationEventInit;
  "animationstart": AnimationEventInit;
  "auxclick": MouseEventInit;
  "beforeinput": InputEventInit;
  "blur": FocusEventInit;
  "cancel": EventInit;
  "canplay": EventInit;
  "canplaythrough": EventInit;
  "change": EventInit;
  "click": MouseEventInit;
  "close": EventInit;
  "compositionend": CompositionEventInit;
  "compositionstart": CompositionEventInit;
  "compositionupdate": CompositionEventInit;
  "contextmenu": MouseEventInit;
  "cuechange": EventInit;
  "dblclick": MouseEventInit;
  "drag": DragEventInit;
  "dragend": DragEventInit;
  "dragenter": DragEventInit;
  "dragexit": EventInit;
  "dragleave": DragEventInit;
  "dragover": DragEventInit;
  "dragstart": DragEventInit;
  "drop": DragEventInit;
  "durationchange": EventInit;
  "emptied": EventInit;
  "ended": EventInit;
  "error": ErrorEventInit;
  "focus": FocusEventInit;
  "focusin": FocusEventInit;
  "focusout": FocusEventInit;
  "gotpointercapture": PointerEventInit;
  "input": EventInit;
  "invalid": EventInit;
  "keydown": KeyboardEventInit;
  "keypress": KeyboardEventInit;
  "keyup": KeyboardEventInit;
  "load": EventInit;
  "loadeddata": EventInit;
  "loadedmetadata": EventInit;
  "loadstart": EventInit;
  "lostpointercapture": PointerEventInit;
  "mousedown": MouseEventInit;
  "mouseenter": MouseEventInit;
  "mouseleave": MouseEventInit;
  "mousemove": MouseEventInit;
  "mouseout": MouseEventInit;
  "mouseover": MouseEventInit;
  "mouseup": MouseEventInit;
  "pause": EventInit;
  "play": EventInit;
  "playing": EventInit;
  "pointercancel": PointerEventInit;
  "pointerdown": PointerEventInit;
  "pointerenter": PointerEventInit;
  "pointerleave": PointerEventInit;
  "pointermove": PointerEventInit;
  "pointerout": PointerEventInit;
  "pointerover": PointerEventInit;
  "pointerup": PointerEventInit;
  "progress": ProgressEventInit;
  "ratechange": EventInit;
  "reset": EventInit;
  "resize": UIEventInit;
  "scroll": EventInit;
  "securitypolicyviolation": SecurityPolicyViolationEventInit;
  "seeked": EventInit;
  "seeking": EventInit;
  "select": EventInit;
  "selectionchange": EventInit;
  "selectstart": EventInit;
  "stalled": EventInit;
  "submit": EventInit;
  "suspend": EventInit;
  "timeupdate": EventInit;
  "toggle": EventInit;
  "touchcancel": TouchEventInit;
  "touchend": TouchEventInit;
  "touchmove": TouchEventInit;
  "touchstart": TouchEventInit;
  "transitioncancel": TransitionEventInit;
  "transitionend": TransitionEventInit;
  "transitionrun": TransitionEventInit;
  "transitionstart": TransitionEventInit;
  "volumechange": EventInit;
  "waiting": EventInit;
  "wheel": WheelEventInit;
}

type DocumentAndElementEventHandlersEventInitMap = {
  "copy": ClipboardEventInit;
  "cut": ClipboardEventInit;
  "paste": ClipboardEventInit;
}

type DocumentEventInitMap = {
  "fullscreenchange": EventInit;
  "fullscreenerror": EventInit;
  "pointerlockchange": EventInit;
  "pointerlockerror": EventInit;
  "readystatechange": EventInit;
  "visibilitychange": EventInit;
}
