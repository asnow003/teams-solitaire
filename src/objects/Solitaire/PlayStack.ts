import { CardStack } from "./CardStack";
import { Card } from "./Card";
import { CanvasBehavior } from "../../scripts/canvasBehavior";
import { CanvasBehaviorGroup } from "../../scripts/canvasBehaviorGroup";

export class PlayStack extends CardStack {

    private _isReady: boolean = false;
    get IsReady(): boolean {
        return this._isReady;
    }
    set IsReady(value: boolean) {
        this._isReady = value;
    }

    public canAddCard(card: Card): boolean { 
        if (card.Group && card.Group.Id === this.Id) {
            return false;
        }

        const topCard = this.TopCard;

        // if there are no cards and the current card is a king
        if (this.Behaviors.length === 0) {
            return card.Rank === 13;
        }

        // check to stack by rank
        if (topCard) {
            return card.Rank === topCard.Rank - 1 && (topCard.IsRed !== card.IsRed);
        }

        return false;
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

    updateStack() {
        if (this.IsReady) {
            if (this.TopCard) {
                this.TopCard.IsDragable = true;
                this.TopCard.IsFaceUp = true;
            }

            let colliderHeight = 0;
            let colliderWidth = 0;

            if (this.Collider) {
                colliderHeight = this.Height;
                colliderWidth = this.Width;
            }

            for (var i = 0; i < this.Behaviors.length; i++) {
                const item = this.Behaviors[i];

                if (item instanceof Card) {
                    item.ParentStackIsPlay = true;
                    item.PreviousCard = undefined;
                    item.NextCard = undefined;
                }

                if (i > 0) {
                    const prevItem = this.Behaviors[i - 1];
                    if (item instanceof Card && prevItem instanceof Card) {
                        const offset = prevItem.IsFaceUp ? 40 : 15;
                        this.Behaviors[i].Top = prevItem.Top + offset;
                        item.PreviousCard = prevItem;
                    }
                }

                if (i < this.Behaviors.length - 1) {
                    if (item instanceof Card) {
                        const nextItem = this.Behaviors[i + 1];
                        if (nextItem instanceof Card) {
                            item.NextCard = nextItem;
                        }
                    }
                }

                if (this.Collider && item.Collider) {
                    const testHeight = (item.Top - this._top) + this._height;
                    if (testHeight > colliderHeight) {
                        colliderHeight = testHeight;
                    }

                    const testWidth = (item.Left - this._left) + this._width;
                    if (testWidth > colliderWidth) {
                        colliderWidth = testWidth;
                    }
                }
            }

            if (this.Collider) {
                this.Collider.Height = colliderHeight;
                this.Collider.Width = colliderWidth;
            }
        }
    }
}