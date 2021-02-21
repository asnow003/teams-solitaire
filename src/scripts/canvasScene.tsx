import { CanvasBehavior } from "./canvasBehavior";
import { CanvasBehaviorGroup } from "./canvasBehaviorGroup";
import { CanvasGameSettings } from "./canvasGameSettings";
import { CanvaseMouseEvent } from "./canvasMouseEvent";

export abstract class CanvasScene {
    public sceneId: string;
    private behaviors: Array<CanvasBehavior | CanvasBehaviorGroup>;

    private collisions: { [id: string]: Array<CanvasBehavior | CanvasBehaviorGroup> } = {};
    private draggingItem: CanvasBehavior | CanvasBehaviorGroup | undefined;

    protected settings: CanvasGameSettings | undefined;
    protected context: CanvasRenderingContext2D | undefined;

    constructor(sceneId: string) {
        this.sceneId = sceneId;
        this.behaviors = new Array<CanvasBehavior>();
    }

    abstract init(context: CanvasRenderingContext2D): void;

    private emitCollisions(behavior: CanvasBehavior) {
        if (behavior.Collider === undefined) {
            return;
        }

        let collisions = new Array<CanvasBehavior | CanvasBehaviorGroup>();
        const existingCollisions = this.collisions[behavior.Id];

        this.behaviors.forEach((b) => {
            if (b.Visible && behavior.Id !== b.Id) {
                if (
                    behavior.Collider &&
                    behavior.Collider.Enabled &&
                    b.Collider &&
                    b.Collider.Enabled &&
                    behavior.Collider.hasCollided(b.Collider)
                ) {
                    collisions.push(b);

                    if (!existingCollisions || existingCollisions.indexOf(b) < 0) {
                        behavior.onCollisionEnter(b);
                        b.onCollisionEnter(behavior);
                    } else if (existingCollisions) {
                        const index = existingCollisions.indexOf(b);
                        if (index > -1) {
                            existingCollisions.splice(index, 1);
                        }
                    }
                }
            }
        });

        if (existingCollisions && existingCollisions.length > 0) {
            existingCollisions.forEach((b) => {
                behavior.onCollisionLeave(b);
                b.onCollisionLeave(behavior);
            });
        }

        this.collisions[behavior.Id] = collisions;
    }

    private emitBehaviorStart(b: CanvasBehavior, context: CanvasRenderingContext2D) {
        b.start(context);

        b.onDragStart = (behavior: CanvasBehavior) => {
            this.draggingItem = behavior;
        }

        b.onDragStop = (behavior: CanvasBehavior) => {
            this.draggingItem = undefined;
        }
    }

    public start(settings: CanvasGameSettings, context: CanvasRenderingContext2D): void {
        this.context = context;
        this.settings = settings;

        this.behaviors = new Array<CanvasBehavior>();

        this.init(context);

        this.behaviors.forEach((b) => {
            if (b instanceof CanvasBehavior) {
                this.emitBehaviorStart(b, context);
                if (b instanceof CanvasBehaviorGroup) {
                    b.Behaviors.forEach((cb) => {
                        this.emitBehaviorStart(cb, context);
                    });
                }
            }
        });
    }

    private emitBehaviorStop(b: CanvasBehavior, context: CanvasRenderingContext2D) {
        b.stop(context);

        b.onDragStart = (behavior: CanvasBehavior) => {}

        b.onDragStop = (behavior: CanvasBehavior) => {}
    }

    public stop(context: CanvasRenderingContext2D): void {
        this.behaviors.forEach((b) => {
            if (b instanceof CanvasBehavior) {
                this.emitBehaviorStop(b, context);
                if (b instanceof CanvasBehaviorGroup) {
                    b.Behaviors.forEach((cb) => {
                        this.emitBehaviorStop(cb, context);
                    });
                }
            }
        });
    }

    private emitBehaviorUpdate(b: CanvasBehavior, context: CanvasRenderingContext2D) {
        if (b.Visible) {
            context.save();

            b.update(context);
            b.onUpdate(context, this.settings!);

            b.onCursorChange = (cursor: string) => {
                if (this.settings) {
                    const canvas = document.getElementById(this.settings.canvasId) as HTMLCanvasElement;
                    if (canvas) {
                        canvas.style.cursor = cursor;
                    }
                }
            }

            this.emitCollisions(b);

            context.restore();
        }
    }

    public onUpdate(context: CanvasRenderingContext2D) {}

    public update(context: CanvasRenderingContext2D) {
        this.behaviors.forEach((b) => {
            if (b instanceof CanvasBehavior) {
                if (!b.IsDragging) {
                    this.emitBehaviorUpdate(b, context);
                }

                if (b instanceof CanvasBehaviorGroup) {
                    b.Behaviors.forEach((cb) => {
                        if (!cb.IsDragging) {
                            this.emitBehaviorUpdate(cb, context);
                        }
                    });
                }
            }
        });

        if (this.draggingItem) {
            this.emitBehaviorUpdate(this.draggingItem, context);

            if (this.draggingItem instanceof CanvasBehaviorGroup) {
                this.draggingItem.Behaviors.forEach((c) => {
                    this.emitBehaviorUpdate(c, context);
                });
            }
        }

        this.onUpdate(context);
    }

    private currentInAreaBehavior: CanvasBehavior | undefined;

    private sendDraggingMouseEvents(behavior: CanvasBehavior, event: CanvaseMouseEvent) {
        if (behavior.IsDragging) {
            // // console.log("SENDING - " + behavior.Id);
            behavior.onMouse(event);
            // behavior.onMoving(event);
        }
    }

    public hasCollidedAtPoint(behavior: CanvasBehavior, x: number, y: number) : boolean {
        return (
            x >= behavior.Left &&
            x <= (behavior.Left + behavior.Width) &&
            y >= behavior.Top &&
            y <= (behavior.Top + behavior.Height)
        );
    }

    public onMouseEvent(event: CanvaseMouseEvent) {
        // send to the the behavior to only where the mouse is in the area
        let inAreaBehavior: CanvasBehavior | undefined;

        if (this.draggingItem) {
            this.sendDraggingMouseEvents(this.draggingItem, event);
        }

        this.behaviors.forEach((b) => {
            if (b.Visible) {
                if (b instanceof CanvasBehavior) {
                    if (this.hasCollidedAtPoint(b, event.x, event.y)) {
                        inAreaBehavior = b;
                    }
                    if (b instanceof CanvasBehaviorGroup) {
                        b.Behaviors.forEach((cb) => {
                            if (this.hasCollidedAtPoint(cb, event.x, event.y)) {
                                    inAreaBehavior = cb;
                                }
                            }
                        );
                    }
                }
            }
        });

        if (inAreaBehavior) {
            inAreaBehavior.onMouse(event);
            if (inAreaBehavior.Id !== this.currentInAreaBehavior?.Id) {
                if (this.currentInAreaBehavior && !this.currentInAreaBehavior.IsDragging) {
                    this.currentInAreaBehavior.onLeave(event);

                    if (this.settings) {
                        const canvas = document.getElementById(this.settings.canvasId) as HTMLCanvasElement;
                        if (canvas) {
                            canvas.style.cursor = "auto";
                        }
                    }
                }

                this.currentInAreaBehavior = inAreaBehavior;
                inAreaBehavior.onEnter(event);
            }

            inAreaBehavior = undefined;
        } else if (this.currentInAreaBehavior && !this.currentInAreaBehavior.IsDragging) {
            this.currentInAreaBehavior.onLeave(event);

            if (this.settings) {
                const canvas = document.getElementById(this.settings.canvasId) as HTMLCanvasElement;
                if (canvas) {
                    canvas.style.cursor = "auto";
                }
            }

            this.currentInAreaBehavior = undefined;
        }
    }

    public addBehavior(item: CanvasBehavior | CanvasBehaviorGroup) {
        this.behaviors.push(item);
    }

    public clear() {
        this.behaviors = new Array<CanvasBehavior>();
    }

    public changeScene(sceneId: string) {}
    public pause() {}
    public restart() {}
}