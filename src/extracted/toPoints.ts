export function toMousePoint (event: MouseEvent): { x: number, y: number } {
  return {
    x: event.clientX,
    y: event.clientY,
  }
}

export function toTouchMovePoint (event: TouchEvent): { x: number, y: number } {
  return {
    x: event.touches.item(0).clientX,
    y: event.touches.item(0).clientY,
  }
}

export function toTouchEndPoint (event: TouchEvent): { x: number, y: number } {
  return {
    x: event.changedTouches.item(0).clientX,
    y: event.changedTouches.item(0).clientY,
  }
}
