export enum CanvaseMouseEventType {
    Move,
    Down,
    Up,
    Hover,
    Click
}

export interface CanvaseMouseEvent {
    x: number;
    y: number;
    type: CanvaseMouseEventType | undefined;
}