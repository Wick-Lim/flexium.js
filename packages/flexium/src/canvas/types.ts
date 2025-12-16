// Canvas types
export interface CanvasProps {
    width: number
    height: number
    children?: any
    style?: any
    ref?: (el: HTMLCanvasElement) => void
}

export interface CanvasDrawNode {
    type: 'rect' | 'circle' | 'arc' | 'line' | 'text' | 'path'
    props: any
}

// Draw component props
export interface DrawRectProps {
    x: number | (() => number)
    y: number | (() => number)
    width: number | (() => number)
    height: number | (() => number)
    fill?: string | (() => string)
    stroke?: string | (() => string)
    strokeWidth?: number | (() => number)
    opacity?: number | (() => number)
}

export interface DrawCircleProps {
    x: number | (() => number)
    y: number | (() => number)
    radius: number | (() => number)
    fill?: string | (() => string)
    stroke?: string | (() => string)
    strokeWidth?: number | (() => number)
    opacity?: number | (() => number)
}

export interface DrawArcProps {
    x: number | (() => number)
    y: number | (() => number)
    radius: number | (() => number)
    startAngle: number | (() => number)
    endAngle: number | (() => number)
    counterclockwise?: boolean
    fill?: string | (() => string)
    stroke?: string | (() => string)
    strokeWidth?: number | (() => number)
    opacity?: number | (() => number)
}

export interface DrawLineProps {
    x1: number | (() => number)
    y1: number | (() => number)
    x2: number | (() => number)
    y2: number | (() => number)
    stroke?: string | (() => string)
    strokeWidth?: number | (() => number)
    opacity?: number | (() => number)
}

export interface DrawTextProps {
    text: string | (() => string)
    x: number | (() => number)
    y: number | (() => number)
    fill?: string | (() => string)
    fontSize?: number | (() => number)
    fontFamily?: string | (() => string)
    fontWeight?: string | (() => string)
    textAlign?: 'left' | 'center' | 'right'
    opacity?: number | (() => number)
}

export interface DrawPathProps {
    d: string | (() => string)
    fill?: string | (() => string)
    stroke?: string | (() => string)
    strokeWidth?: number | (() => number)
    opacity?: number | (() => number)
}
