import { Solitaire } from "../objects/Solitaire/Solitaire";
import { CanvasGameSettings } from "./canvasGameSettings";
import { CanvaseMouseEvent, CanvaseMouseEventType } from "./canvasMouseEvent";
import { CanvasScene } from "./canvasScene";

export class CanvasGame {
    protected isRunning: boolean = false;

    private settings: CanvasGameSettings;
    private canvas: HTMLCanvasElement | undefined;
    private context: CanvasRenderingContext2D | undefined;

    private resizeTimer: NodeJS.Timer | undefined;
    private scenes: Array<CanvasScene>;
    private activeSceneId: string;

    constructor(settings: CanvasGameSettings, scenes: Array<CanvasScene>, activeSceneId: string) {
        this.settings = settings;
        this.scenes = scenes;
        this.activeSceneId = activeSceneId;
    }

    private init(): CanvasRenderingContext2D {
        this.canvas = document.getElementById(this.settings.canvasId) as HTMLCanvasElement;
        this.context = this.canvas.getContext("2d") as CanvasRenderingContext2D;

        this.scenes.forEach((s) => {
            s.changeScene = (sceneId: string) => {
                this.changeScene(sceneId);
            }
            s.pause = () => {
                this.pause();
            }
            s.restart = () => {
                this.restart();
            }
        });

        this.canvas.addEventListener('click', (event) => {
            const mousePos = this.getMousePosition(event);
            if (mousePos) {
                this.scenes.forEach((s) => {
                    mousePos.type = CanvaseMouseEventType.Click;
                    s.onMouseEvent(mousePos);
                });
            }
        }, false);

        this.canvas.addEventListener('mousedown', (event) => {
            const mousePos = this.getMousePosition(event);
            if (mousePos) {
                this.scenes.forEach((s) => {
                    mousePos.type = CanvaseMouseEventType.Down;
                    s.onMouseEvent(mousePos);
                });
            }
        }, false);

        this.canvas.addEventListener('mouseup', (event) => {
            const mousePos = this.getMousePosition(event);
            if (mousePos) {
                mousePos.type = CanvaseMouseEventType.Up;
                this.scenes.forEach((s) => {
                    s.onMouseEvent(mousePos);
                });
            }
        }, false);

        this.canvas.addEventListener('mousemove', (event) => {
            const mousePos = this.getMousePosition(event);
            if (mousePos) {
                mousePos.type = CanvaseMouseEventType.Move;
                this.scenes.forEach((s) => {
                    s.onMouseEvent(mousePos);
                });
            }
        }, false);

        window.addEventListener("resize", this.resizeCanvas, false);

        this.resizeCanvas();

        return this.context;
    }

    private resizeCanvas = () => {

        if (this.resizeTimer) {
            clearTimeout(this.resizeTimer);
        }

        this.resizeTimer = setTimeout(() => {
      
            if (this.canvas) {
                this.settings.reload();
                
                if (this.settings.isMaximized) {
                    // excess background color
                    this.canvas.style.background = "black";
    
                    this.canvas.width = document.documentElement.clientWidth;
                    this.canvas.height = document.documentElement.clientHeight;
                } else {
                    this.canvas.style.background = this.settings.backgroundColor;
                    this.canvas.width = this.settings.width;
                    this.canvas.height = this.settings.height;
                }
            }
                  
        }, 250);
    }

    private getMousePosition(event: MouseEvent): CanvaseMouseEvent | undefined {
        if (this.canvas) {
            const rect = this.canvas.getBoundingClientRect();
            const x = event.clientX - rect.left;
            const y = event.clientY - rect.top;

            return {
                x: x / this.settings.scaleX - this.settings.leftOffset,
                y: y / this.settings.scaleY - this.settings.topOffset,
                type: undefined
            };
        }

        return;
    }

    public start() {
        const context = this.init();

        this.isRunning = true;

        this.scenes.forEach((s) => {
            if (s.sceneId === this.activeSceneId) {
                s.start(this.settings, context);
            }
        });

        this.run();
    }

    public pause() {
        this.isRunning = !this.isRunning;
    }

    public restart() {
        this.stop();
        this.start();
    }

    public stop() {
        this.isRunning = false;
        
        if (this.context) {
            this.scenes.forEach((s) => {
                if (s.sceneId === this.activeSceneId) {
                    s.stop(this.context!);
                }
            });
        }
    }

    public changeScene(sceneId: string) {
        this.scenes.forEach((s) => {
            if (s.sceneId === sceneId) {
                this.stop();
                this.activeSceneId = sceneId;
                this.start();
            }
        });
    }

    public updateSettings() {
        this.settings.reload();
    }

    private drawGrid(gridSpacing: number) {
        if (this.context) {
            this.context.save();
            this.context.globalAlpha = 0.2;
            const intervalsY = Solitaire.gameHeight / gridSpacing;
            for (var i = 1; i < intervalsY; i++) {
                this.context.beginPath();
                this.context.strokeStyle = "red";
                this.context.moveTo(0, i * gridSpacing);
                this.context.lineTo(Solitaire.gameWidth, i * gridSpacing);
                this.context.stroke();
            }

            const intervalsX = Solitaire.gameWidth / gridSpacing;
            for (var j = 1; j < intervalsX; j++) {
                this.context.beginPath();
                this.context.strokeStyle = "blue";
                this.context.moveTo(j * gridSpacing, 0);
                this.context.lineTo(j * gridSpacing, Solitaire.gameHeight);
                this.context.stroke();
            }
            this.context.restore();
        }
    }

    private update(context: CanvasRenderingContext2D) {
        if (this.canvas) {
            // clear the screen
            
            context.clearRect(0, 0, this.canvas.width, this.canvas.height);
            context.save();
            this.isRunning = true;

            context.scale(this.settings.scaleX, this.settings.scaleY);
            context.translate(this.settings.leftOffset, this.settings.topOffset);

            // if maximized show the scaled/offset play area
            if (this.settings.isMaximized) {
                context.fillStyle = this.settings.backgroundColor;
                context.fillRect(
                    0,
                    0,
                    Solitaire.gameWidth,
                    Solitaire.gameHeight);
            }

            if (Solitaire.isDebug) {
                this.drawGrid(25);
            }

            this.scenes.forEach((s) => {
                if (s.sceneId === this.activeSceneId) {
                    s.update(context);
                }
            });

            context.restore()
        }
    }

    private run = () => {
        if (this.isRunning) {
            if (this.context) {
                this.update(this.context);
            }
            window.requestAnimationFrame(this.run);
        }
    }
}
