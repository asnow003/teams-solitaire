import { CanvasBehavior } from "../../scripts/canvasBehavior";

export class RestartButton extends CanvasBehavior {

    start(context: CanvasRenderingContext2D): void {

    }

    stop(context: CanvasRenderingContext2D): void {

    }

    update(context: CanvasRenderingContext2D): void {
        const img = document.getElementById("play") as CanvasImageSource;
        if (img) {
            context.drawImage(img, this.Left, this.Top, this.Width, this.Height);
        }
    }

}