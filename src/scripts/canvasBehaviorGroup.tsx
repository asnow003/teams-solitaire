
import { CanvasBehavior } from "./canvasBehavior";
import { CanvaseMouseEvent } from "./canvasMouseEvent";

export class CanvasBehaviorGroup extends CanvasBehavior {
    private _behaviors: Array<CanvasBehavior> = new Array<CanvasBehavior>();

    get Behaviors(): Array<CanvasBehavior> {
        return this._behaviors;
    }

    onEnter(event: CanvaseMouseEvent): void {};
    onLeave(event: CanvaseMouseEvent): void {};
    onClick(event: CanvaseMouseEvent): void {};
    onMoved(): void {};
    onDrag(event: CanvaseMouseEvent): void {};
    onDrop(event: CanvaseMouseEvent): void {};

    start(context: CanvasRenderingContext2D): void {};
    stop(context: CanvasRenderingContext2D): void {};
    update(context: CanvasRenderingContext2D): void {};
    onCollisionEnter(behavior: CanvasBehavior | CanvasBehaviorGroup): void {};
    onCollisionLeave(behavior: CanvasBehavior | CanvasBehaviorGroup): void {};

    public add(behavior: CanvasBehavior) {
        behavior.Left = this.Left;
        behavior.Top = this.Top;
        behavior.Group = this;
        this._behaviors.push(behavior);
    }

    public remove(behavior: CanvasBehavior) {
        const index = this._behaviors.indexOf(behavior);
        if (index >= 0) {
            behavior.Group = undefined;
            this._behaviors.splice(index, 1);
        }
    }

    public contains(behavior: CanvasBehavior) {
        return this._behaviors.indexOf(behavior) >= 0;
    }

    public reset(): Array<CanvasBehavior> {
        const behaviors = this._behaviors;
        this._behaviors = new Array<CanvasBehavior>();

        return behaviors;
    }
}