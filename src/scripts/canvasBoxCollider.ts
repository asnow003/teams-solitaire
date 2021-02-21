export class CanvasBoxCollider {

    private _enabled: boolean;
    get Enabled(): boolean {
        return this._enabled;
    }
    set Enabled(value: boolean) {
        this._enabled = value;
    }

    private _left: number;
    get Left(): number {
        return this._left;
    }
    set Left(value: number) {
        this._left = value;
    }

    private _top: number;
    get Top(): number {
        return this._top;
    }
    set Top(value: number) {
        this._top = value;
    }

    private _width: number;
    get Width(): number {
        return this._width;
    }
    set Width(value: number) {
        this._width = value;
    }

    private _height: number;
    get Height(): number {
        return this._height;
    }
    set Height(value: number) {
        this._height = value;
    }

    constructor(left: number, top: number, width: number, height: number) {
        this._enabled = true;
        this._left = left;
        this._top = top;
        this._width = width;
        this._height = height;
    }

    private checkCollisionPoints(c1: CanvasBoxCollider, c2: CanvasBoxCollider): boolean {
        return this.hasCollidedAtPoint(c1, c2.Left, c2.Top) ||
            this.hasCollidedAtPoint(c1, c2.Left, c2.Top + c2.Height) ||
            this.hasCollidedAtPoint(c1, c2.Left + c2.Width, c2.Top) ||
            this.hasCollidedAtPoint(c1, c2.Left + c2.Width, c2.Top + c2.Height);
    }

    private hasCollidedAtPoint(collider: CanvasBoxCollider, x: number, y: number) : boolean {
        return (
            x >= collider.Left &&
            x <= (collider.Left + collider.Width) &&
            y >= collider.Top &&
            y <= (collider.Top + collider.Height)
        );
    }

    public hasCollided(collider: CanvasBoxCollider): boolean {
        return this.checkCollisionPoints(this, collider) ||
            this.checkCollisionPoints(collider, this);
    }
}