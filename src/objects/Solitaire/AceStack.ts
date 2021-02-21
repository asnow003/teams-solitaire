import { CardStack } from "./CardStack";
import { Card } from "./Card";
import { CanvasBehavior } from "../../scripts/canvasBehavior";
import { CanvasBehaviorGroup } from "../../scripts/canvasBehaviorGroup";

export class AceStack extends CardStack {
    private suit: number | undefined;
    get Suit(): number | undefined {
        return this.suit;
    }
    set Suit(value: number | undefined) {
        this.suit = value;
    }

    public isCompleteStack(): boolean {
        if (this.Behaviors.length > 0) {
            const topCard = this.Behaviors[this.Behaviors.length - 1];
            if (topCard instanceof Card) {
                // success when there is a king
                return topCard.Rank === 13;
            }
        }

        return false;
    }

    public canAddCard(card: Card): boolean { 
        // if the deck is empty and the card is an ace
        if (this.Behaviors.length === 0 &&
            this.suit === card.Suit &&
            card.IsAce) {
            this.suit = card.Suit;
            return true; 
        }

        if (this.suit &&
            card.Suit === this.suit) {
            const topCard = this.TopCard;

            // if top card is Ace then the next card has to be a 2
            if (topCard) {
                return (topCard.IsAce && card.Rank === 2) ||
                (topCard.Rank + 1 === card.Rank);
            }
        }

        return false;
    }

    onUpdate(context: CanvasRenderingContext2D): void {
        if (!this.HasCards && this.suit) {
            const img = document.getElementById(`${this.suit}-14-stack`) as CanvasImageSource;
            if (img) {
                context.globalAlpha = 0.1;
                context.drawImage(img, this.Left, this.Top, this.Width, this.Height);
                context.globalAlpha = 1;
            }
        }
    };

    updateStack() {
        this.Behaviors.forEach((b) => {
            b.IsDragable = false;
            b.IsClickable = false;
            b.Visible = false;
        });

        if (this.TopCard) {
            this.TopCard.Visible = true;
        }
    }

    onCollisionEnter(behavior: CanvasBehavior | CanvasBehaviorGroup): void {
        // console.log(`${behavior.Id} ENTERING ${this.Id}`);

        if (behavior instanceof Card) {
            this.IsHighlighted = this.canAddCard(behavior);
        }
    };

    onCollisionLeave(behavior: CanvasBehavior | CanvasBehaviorGroup): void {
        // console.log(`${behavior.Id} LEAVING ${this.Id}`);

        this.IsHighlighted = false;
    };
}