import { CanvasBehaviorGroup } from "./canvasBehaviorGroup";
import { CanvasBoxCollider } from "./canvasBoxCollider";
import { CanvasGameSettings } from "./canvasGameSettings";
import { CanvaseMouseEvent, CanvaseMouseEventType } from "./canvasMouseEvent";
import { CanvasPosition } from "./canvasPosition";

export abstract class CanvasBehavior {

    private settings: CanvasGameSettings | undefined;
    private dragOffsetPosition: CanvasPosition | undefined;

    private _id: string;
    get Id(): string {
        return this._id;
    }

    private _mouseInArea: boolean = false;

    private _isDragging: boolean = false;
    get IsDragging(): boolean {
        return this._isDragging;
    }

    private _isMoving: boolean = false;
    get IsMoving(): boolean {
        return this._isMoving;
    }

    private _moveSpeed: number = 10;
    private _moveToPosition: CanvasPosition | undefined;

    private _visible: boolean = true;
    get Visible(): boolean {
        return this._visible;
    }
    set Visible(value: boolean) {
        this._visible = value;
    }

    private _isClickable: boolean = false;
    get IsClickable(): boolean {
        return this._isClickable;
    }
    set IsClickable(value: boolean) {
        this._isClickable = value;
    }

    private _isDragable: boolean = false;
    get IsDragable(): boolean {
        return this._isDragable;
    }
    set IsDragable(value: boolean) {
        this._isDragable = value;
    }

    protected _left: number = 0;
    get Left(): number {
        return this._left;
    }
    set Left(value: number) {
        this._left = value;

        if (this._collider) {
            this._collider.Left = this._left;
        }
    }

    protected _top: number = 0;
    get Top(): number {
        return this._top;
    }
    set Top(value: number) {
        this._top = value;

        if (this._collider) {
            this._collider.Top = this._top;
        }
    }

    protected _width: number = 0;
    get Width(): number {
        return this._width;
    }
    set Width(value: number) {
        this._width = value;

        if (this._collider) {
            this._collider.Width = this._width;
        }
    }

    protected _height: number = 0;
    get Height(): number {
        return this._height;
    }
    set Height(value: number) {
        this._height = value;

        if (this._collider) {
            this._collider.Height = this._height;
        }
    }

    private _group: CanvasBehaviorGroup | undefined;
    get Group(): CanvasBehaviorGroup | undefined {
        return this._group;
    }
    set Group(value: CanvasBehaviorGroup | undefined) {
        this._group = value;
    }

    private _collider: CanvasBoxCollider | undefined;
    get Collider(): CanvasBoxCollider | undefined {
        return this._collider;
    }
    set Collider(value: CanvasBoxCollider | undefined) {
        this._collider = value;
    }

    constructor(id: string) {
        this._id = id;
    }

    abstract start(context: CanvasRenderingContext2D): void;
    abstract stop(context: CanvasRenderingContext2D): void;
    abstract update(context: CanvasRenderingContext2D): void;

    public onMouse(event: CanvaseMouseEvent): void {
        if (event.type === CanvaseMouseEventType.Up) {
            if (this._isDragging) {
                this._isDragging = false;
                this.onDragStop(this);
                this.onDrop(event);
            }
        }
        
        if (this._isDragging) {
            this.setMouseCursorDragging();
            if (this.dragOffsetPosition) {
                let newLeft = event.x - this.dragOffsetPosition.x;
                let newTop = event.y - this.dragOffsetPosition.y;

                if (newLeft < 0) {
                    newLeft = 0;
                } else if (this.settings && newLeft > (this.settings.playAreaWidth - this.Width)) {
                    newLeft = this.settings.playAreaWidth - this.Width;
                }

                this.Left = newLeft;

                if (newTop < 0) {
                    newTop = 0;
                } else if (this.settings && newTop > (this.settings.playAreaHeight - this.Height)) {
                    newTop = this.settings.playAreaHeight - this.Height;
                }
                
                this.Top = newTop;

                this.onDragging({
                    x: newLeft,
                    y: newTop
                });
            }
        }

        if (this.Visible) {
            if (this.IsClickable) {
                this.setMouseCursorClickable();
            }

            if (this.IsDragable && !this._isDragging) {
                this.setMouseCursorDragable();
            }

            if (this.IsDragable && event.type === CanvaseMouseEventType.Down) {
                this.setMouseCursorDragging();

                this.dragOffsetPosition = new CanvasPosition(event.x - this.Left, event.y - this.Top);

                this._isDragging = true;

                this.onDragStart(this);
                this.onDrag(event);
            }

            if (this._isClickable && event.type === CanvaseMouseEventType.Down) {
                event.type = CanvaseMouseEventType.Click;
                this.onClick(event);
            }

            if (event.type === CanvaseMouseEventType.Up) {
               if (this._isDragging) {
                    this.dragOffsetPosition = undefined;
                    this._isDragging = false;
                    this.onDrop(event);
                }  
            } 

            if (!this._mouseInArea) {
                this._mouseInArea = true;
            }
        } else {
            if (this._mouseInArea) {
                this._mouseInArea = false;
                this.resetMouseCursor();
            }
        }
    };

    onEnter(event: CanvaseMouseEvent): void {};
    onLeave(event: CanvaseMouseEvent): void {};
    onClick(event: CanvaseMouseEvent): void {};
    onMove(event: CanvasPosition): void {};
    onMoving(event: CanvasPosition): void {};
    onMoved(): void {};
    onDrag(event: CanvaseMouseEvent): void {};
    onDrop(event: CanvaseMouseEvent): void {};
    onDragging(event: CanvasPosition): void {};
    onCollisionEnter(behavior: CanvasBehavior | CanvasBehaviorGroup): void {};
    onCollisionLeave(behavior: CanvasBehavior | CanvasBehaviorGroup): void {};

    onCursorChange(cursor: string): void {};
    onDragStart(behavior: CanvasBehavior): void {}
    onDragStop(behavior: CanvasBehavior): void {}

    private setMouseCursorClickable() {
        this.onCursorChange("pointer");
    }

    private setMouseCursorDragable() {
        this.onCursorChange("grab");
    }

    private setMouseCursorDragging() {
        this.onCursorChange("grabbing");
    }

    private resetMouseCursor() {
        this.onCursorChange("auto");
    }

    public onUpdate(context: CanvasRenderingContext2D, settings: CanvasGameSettings) {
        this.settings = settings;

        if (this._moveToPosition) {
            let atX: boolean = false;
            let atY: boolean = false;

            const x = this._moveToPosition.x;
            const xDistance = Math.abs(this.Left - x);

            const y = this._moveToPosition.y;
            const yDistance = Math.abs(this.Top - y);

            let speedX = this._moveSpeed;
            let speedY = this._moveSpeed;

            if (xDistance > yDistance) {
                speedY = (yDistance / xDistance) * speedY;
            } else {
                speedX = (xDistance / yDistance) * speedX;
            }

            if (xDistance > speedX) {
                const directionX = this.Left < x ? 1 : -1;
                this.Left = this.Left + (speedX * directionX);
            } else {
                atX = true;
                this.Left = x;
            }

            if (yDistance > speedY) {
                const directionY = this.Top < y ? 1 : -1;
                this.Top = this.Top + (speedY * directionY);
            } else {
                atY = true;
                this.Top = y;
            }

            if (atX && atY) {
                this._moveToPosition = undefined;
                this.onMoved();
            } else {
                this.onMoving({
                    x: this.Left,
                    y: this.Top
                });
            }
        }
    }

    public moveTo(position: CanvasPosition, speed: number) {
        this._moveSpeed = speed;
        this._moveToPosition = position;
        this.onMove(position);
    }

    public roundedRect(context: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, r: number) {
        context.beginPath();
        context.arc(x+r, y+r, r, Math.PI, 1.5*Math.PI);
        context.arc(x+w-r, y+r, r, 1.5*Math.PI, 2*Math.PI);
        context.arc(x+w-r, y+h-r, r, 0, 0.5*Math.PI);
        context.arc(x+r, y+h-r, r, 0.5*Math.PI, Math.PI);
        context.closePath();
    }

    public createText(context: CanvasRenderingContext2D, text: string, size: number, x: number, y: number) {
        context.font = `${size}px Arial`;
        context.fillStyle = "black";
        context.fillText(text, x, y);
    }
}