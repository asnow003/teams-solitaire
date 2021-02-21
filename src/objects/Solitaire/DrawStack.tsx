import { CardStack } from "./CardStack";
import { Card } from "./Card";
import { CanvaseMouseEvent } from "../../scripts/canvasMouseEvent";
import { SolitaireGame } from "./SolitaireGame";

export class DrawStack extends CardStack {
    public canAddCard(card: Card): boolean { return false; }

    public draw() {
        this.drawCards(3, false);
        SolitaireGame.Moves = SolitaireGame.Moves + 1;
    }

    onUpdate(context: CanvasRenderingContext2D): void {
        const squareWidth = this.Width - 40;
        this.roundedRect(context, this.Left + ((this.Width - squareWidth) / 2), this.Top + ((this.Height - squareWidth) / 2), squareWidth, squareWidth, squareWidth/ 2);
        context.globalAlpha = 0.2;
        context.fillStyle = "transparent";
        context.fill();
        context.strokeStyle = 'white';
        context.lineWidth = 9;
        context.stroke();
        context.globalAlpha = 1;
    };

    updateStack() {
        if (this.Behaviors.length > 0) {
            const topCard = this.Behaviors[this.Behaviors.length - 1];
            if (topCard) {
                topCard.Visible = true;
                topCard.IsClickable = true;
                topCard.onClick = (event: CanvaseMouseEvent) => {
                    this.draw();
                }
            }
        }
    }
}