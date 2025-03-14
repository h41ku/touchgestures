const dropEvent = evt => {
    evt.preventDefault()
    evt.stopPropagation()
}

export const POINTER_DOWN = 'touchgestures:pointerdown'
export const POINTER_MOVE = 'touchgestures:pointermove'
export const POINTER_UP = 'touchgestures:pointerup'
export const POINTER_ZOOM = 'touchgestures:pointerzoom'

const defaultOptions = {
    listenerElement: null,
    invertMouseWheel: false,
    mouseWheelStep: 0.1
}

export default class TouchGestures {

    constructor(element, options = {}) {

        const opts = { ...defaultOptions, ...options }

        this.element = element
        this.listenerElement = opts.listenerElement !== null ? opts.listenerElement : element

        const fireEvent = (name, detail) => this.element.dispatchEvent(new CustomEvent(name, { detail }))

        const pointerdown = (originalEvent, x, y) => fireEvent(POINTER_DOWN, { originalEvent, clientX: x, clientY: y })
        const pointerup = (originalEvent, x, y) => fireEvent(POINTER_UP, { originalEvent, clientX: x, clientY: y })
        const pointerzoom = (originalEvent, x, y, deltaScale) => fireEvent(POINTER_ZOOM, { originalEvent, clientX: x, clientY: y, deltaScale })
        const pointermove = (originalEvent, x, y, dx, dy) => fireEvent(POINTER_MOVE, { originalEvent, clientX: x, clientY: y, movementX: dx, movementY: dy })

        let touchId = null
        let secondTouchId = null
        const touchPoint = { x: 0, y: 0 }
        const secondTouchPoint = { x: 0, y: 0 }
        const wheelDirection = opts.invertMouseWheel ? -1 : 1
        const wheelStep = opts.mouseWheelStep

        this.listeners = {

            touchstart: evt => {
                const clientRect = evt.target.getBoundingClientRect()
                if (touchId !== null) {
                    const touch = evt.changedTouches[0]
                    if (touch.identifier !== touchId) {
                        secondTouchId = touch.identifier
                        secondTouchPoint.x = touch.clientX - clientRect.left
                        secondTouchPoint.y = touch.clientY - clientRect.top
                        pointerup(evt, touchPoint.x, touchPoint.y)
                        pointerdown(
                            evt,
                            touchPoint.x + (secondTouchPoint.x - touchPoint.x) / 2,
                            touchPoint.y + (secondTouchPoint.y - touchPoint.y) / 2
                        )
                    }
                } else {
                    const touch = evt.changedTouches[0]
                    touchId = touch.identifier
                    touchPoint.x = touch.clientX - clientRect.left
                    touchPoint.y = touch.clientY - clientRect.top
                    pointerdown(evt, touchPoint.x, touchPoint.y)
                }
            },

            touchend: evt => {
                let touches = Array.from(evt.changedTouches)
                if (touchId !== null && secondTouchId !== null) {
                    const touch = touches.find(touch => touchId === touch.identifier)
                    const secondTouch = touches.find(touch => secondTouchId === touch.identifier)
                    pointerup(
                        evt,
                        touchPoint.x + (secondTouchPoint.x - touchPoint.x) / 2,
                        touchPoint.y + (secondTouchPoint.y - touchPoint.y) / 2
                    )
                    if (touch && secondTouch) {
                        touchId = null
                        secondTouchId = null
                    } else if (touch && !secondTouch) {
                        touchId = secondTouchId
                        touchPoint.x = secondTouchPoint.x
                        touchPoint.y = secondTouchPoint.y
                        secondTouchId = null
                    } else if (!touch && secondTouch) {
                        secondTouchId = null
                    }
                    if (touchId !== null) {
                        pointerdown(evt, touchPoint.x, touchPoint.y)
                    }
                } else if (touchId !== null) {
                    const touch = touches.find(touch => touchId === touch.identifier)
                    if (touch) {
                        touchId = null
                        pointerup(evt, touchPoint.x, touchPoint.y)
                    }
                }
            },

            touchmove: evt => {
                const clientRect = evt.target.getBoundingClientRect()
                if (touchId !== null && secondTouchId !== null) {
                    const touchNewPoint = { x: touchPoint.x, y: touchPoint.y }
                    const secondTouchNewPoint = { x: secondTouchPoint.x, y: secondTouchPoint.y }
                    const touch = Array.from(evt.changedTouches).find(touch => touchId === touch.identifier)
                    const secondTouch = Array.from(evt.changedTouches).find(touch => secondTouchId === touch.identifier)
                    if (touch) {
                        touchNewPoint.x = touch.clientX - clientRect.left
                        touchNewPoint.y = touch.clientY - clientRect.top
                    }
                    if (secondTouch) {
                        secondTouchNewPoint.x = secondTouch.clientX - clientRect.left
                        secondTouchNewPoint.y = secondTouch.clientY - clientRect.top
                    }
                    const dx = secondTouchPoint.x - touchPoint.x
                    const dy = secondTouchPoint.y - touchPoint.y
                    const dxNew = secondTouchNewPoint.x - touchNewPoint.x
                    const dyNew = secondTouchNewPoint.y - touchNewPoint.y
                    const previousLength = Math.hypot(dx, dy)
                    const length = Math.hypot(dxNew, dyNew)
                    const deltaScale = (1 - (previousLength / length))
                    const point = {
                        x: touchPoint.x + dx / 2,
                        y: touchPoint.y + dy / 2
                    }
                    const pointNew = {
                        x: touchNewPoint.x + dxNew / 2,
                        y: touchNewPoint.y + dyNew / 2
                    }
                    pointermove(
                        evt,
                        pointNew.x,
                        pointNew.y,
                        pointNew.x - point.x,
                        pointNew.y - point.y
                    )
                    pointerup(evt, pointNew.x, pointNew.y)
                    pointerzoom(evt, pointNew.x, pointNew.y, deltaScale)
                    pointerdown(evt, pointNew.x, pointNew.y)
                    touchPoint.x = touchNewPoint.x
                    touchPoint.y = touchNewPoint.y
                    secondTouchPoint.x = secondTouchNewPoint.x
                    secondTouchPoint.y = secondTouchNewPoint.y
                } else if (touchId !== null) {
                    const touchNewPoint = { x: touchPoint.x, y: touchPoint.y }
                    const touch = Array.from(evt.changedTouches)
                        .find(touch => touchId === touch.identifier)
                    if (!touch) {
                        return
                    }
                    touchNewPoint.x = touch.clientX - clientRect.left
                    touchNewPoint.y = touch.clientY - clientRect.top
                    pointermove(
                        evt,
                        touchNewPoint.x,
                        touchNewPoint.y,
                        touchNewPoint.x - touchPoint.x,
                        touchNewPoint.y - touchPoint.y
                    )
                    touchPoint.x = touchNewPoint.x
                    touchPoint.y = touchNewPoint.y
                }
            },

            mousedown: evt => {
                touchPoint.x = evt.clientX
                touchPoint.y = evt.clientY
                pointerdown(evt, touchPoint.x, touchPoint.y)
            },

            mouseup: evt => {
                touchPoint.x = evt.clientX
                touchPoint.y = evt.clientY
                pointerup(evt, touchPoint.x, touchPoint.y)
            },

            mousemove: evt => {
                const touchNewPoint = { x: evt.clientX, y: evt.clientY }
                pointermove(evt,
                    touchNewPoint.x,
                    touchNewPoint.y,
                    touchNewPoint.x - touchPoint.x,
                    touchNewPoint.y - touchPoint.y
                )
                touchPoint.x = touchNewPoint.x
                touchPoint.y = touchNewPoint.y
            },

            wheel: evt => {
                const deltaScale = wheelStep * (evt.deltaY > 0 ? 1 : -1) * wheelDirection
                pointerzoom(evt, evt.clientX, evt.clientY, deltaScale)
            }

        }
    }

    enableNativeGestures() {

        document.removeEventListener('gesturestart', dropEvent)
        document.removeEventListener('gesturechange', dropEvent)
        document.removeEventListener('gestureend', dropEvent)
    }

    disableNativeGestures() {

        document.addEventListener('gesturestart', dropEvent)
        document.addEventListener('gesturechange', dropEvent)
        document.addEventListener('gestureend', dropEvent)
    }

    enableTouchGestures() {

        this.listenerElement.addEventListener('touchstart', this.listeners.touchstart)
        document.addEventListener('touchend', this.listeners.touchend)
        document.addEventListener('touchmove', this.listeners.touchmove)
    }

    disableTouchGestures() {

        this.listenerElement.removeEventListener('touchstart', this.listeners.touchstart)
        document.removeEventListener('touchend', this.listeners.touchend)
        document.removeEventListener('touchmove', this.listeners.touchmove)
    }

    enableMouseGestures() {

        this.listenerElement.addEventListener('mousedown', this.listeners.mousedown)
        document.addEventListener('mouseup', this.listeners.mouseup)
        document.addEventListener('mousemove', this.listeners.mousemove)
        this.listenerElement.addEventListener('wheel', this.listeners.wheel)
        document.addEventListener('mouseleave', this.listeners.mouseup) // TODO test it
    }

    disableMouseGestures() {

        this.listenerElement.removeEventListener('mousedown', this.listeners.mousedown)
        document.removeEventListener('mouseup', this.listeners.mouseup)
        document.removeEventListener('mousemove', this.listeners.mousemove)
        document.removeEventListener('wheel', this.listeners.wheel)
        document.removeEventListener('mouseleave', this.listeners.mouseup) // TODO test it
    }
}
