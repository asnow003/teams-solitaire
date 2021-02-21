import { CardStack } from "./CardStack";
import { Card } from "./Card";
import { CanvaseMouseEvent } from "../../scripts/canvasMouseEvent";

export class PickStack extends CardStack {
    public canAddCard(card: Card): boolean { return false; }

    updateStack() {
        this.Behaviors.forEach((b) => {
            if (b.Id !== "pick-stack") {
                const card = b as Card;
                if (card) {
                    card.Left = this.Left;
                    card.Visible = false;
                    card.IsFaceUp = false;
                    card.IsClickable = false;
                    card.IsDragable = false;
                    card.onClick = function(event: CanvaseMouseEvent) {}
                }
            }
        });

        // fan out top cards
        if (this.Behaviors.length > 0) {
            let startIndex = this.Behaviors.length - 3;

            if (startIndex < 0) {
                startIndex = 0;
            }

            for (var i = startIndex; i < this.Behaviors.length; i++) {
                const card = this.Behaviors[i] as Card;
                card.Visible = true;
                card.IsFaceUp = true;
                card.IsDragable = i === (this.Behaviors.length - 1);
                card.Left = card.Left + (23 * (i - startIndex));
            }
        }
    }
}