// Keyboard types
export enum Keys {
    ArrowUp = 'ArrowUp',
    ArrowDown = 'ArrowDown',
    ArrowLeft = 'ArrowLeft',
    ArrowRight = 'ArrowRight',
    KeyW = 'KeyW',
    KeyA = 'KeyA',
    KeyS = 'KeyS',
    KeyD = 'KeyD',
    Space = 'Space',
    Enter = 'Enter',
    Escape = 'Escape',
    Tab = 'Tab',
    ShiftLeft = 'ShiftLeft',
    ShiftRight = 'ShiftRight',
    ControlLeft = 'ControlLeft',
    ControlRight = 'ControlRight',
    AltLeft = 'AltLeft',
    AltRight = 'AltRight',
    Digit0 = 'Digit0',
    Digit1 = 'Digit1',
    Digit2 = 'Digit2',
    Digit3 = 'Digit3',
    Digit4 = 'Digit4',
    Digit5 = 'Digit5',
    Digit6 = 'Digit6',
    Digit7 = 'Digit7',
    Digit8 = 'Digit8',
    Digit9 = 'Digit9',
    KeyE = 'KeyE',
    KeyQ = 'KeyQ',
    KeyR = 'KeyR',
    KeyF = 'KeyF',
}

export interface KeyboardState {
    isPressed: (key: string) => boolean
    isJustPressed: (key: string) => boolean
    isJustReleased: (key: string) => boolean
    getPressedKeys: () => string[]
    clearFrameState: () => void
    dispose: () => void
}

// Mouse types
export enum MouseButton {
    Left = 0,
    Middle = 1,
    Right = 2
}

export interface MouseOptions {
    canvas?: HTMLCanvasElement | (() => HTMLCanvasElement | undefined)
    target?: EventTarget
}

export interface MouseState {
    x: number | null
    y: number | null
    deltaX: number
    deltaY: number
    wheelDelta: number
    isPressed: (button: MouseButton) => boolean
    isLeftPressed: () => boolean
    isRightPressed: () => boolean
    isMiddlePressed: () => boolean
    clearFrameState: () => void
    dispose: () => void
}

// Loop types
export interface LoopCallbacks {
    fixedFps?: number
    onUpdate?: (delta: number) => void
    onFixedUpdate?: (fixedDelta: number) => void
    onRender?: (alpha: number) => void
}

export interface Loop {
    start: () => void
    stop: () => void
    isRunning: () => boolean
    getFps: () => number
}
