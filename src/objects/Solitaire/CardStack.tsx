import { CanvasBehaviorGroup } from "../../scripts/canvasBehaviorGroup";
import { CanvasBoxCollider } from "../../scripts/canvasBoxCollider";
import { Card } from "./Card";
import { Solitaire } from "./Solitaire";

export class CardStack extends CanvasBehaviorGroup {
    get HasCards(): boolean {
        return this.Behaviors.length > 0;
    }

    get NumberOfCards(): number {
        return this.Behaviors.length;
    }

    private _isHighlighted: boolean = false;
    get IsHighlighted(): boolean {
        return this._isHighlighted;
    }
    set IsHighlighted(value: boolean) {
        this._isHighlighted = value;
    }

    get TopCard(): Card | undefined {
        if (this.Behaviors.length > 0) {
            return this.Behaviors[this.Behaviors.length - 1] as Card;
        }

        return undefined;
    }

    constructor(id: string, top: number, left: number) {
        super(id);
        this.Top = top;
        this.Left = left;
        this.Width = Solitaire.cardWidth;
        this.Height = Solitaire.cardHeight;

        this.Collider = new CanvasBoxCollider(this.Left, this.Top, this.Width, this.Height);
    }

    public canAddCard(card: Card): boolean { return true; }

    onUpdate(context: CanvasRenderingContext2D): void {};

    update(context: CanvasRenderingContext2D): void {
        this.roundedRect(context, this.Left, this.Top, this.Width, this.Height, 10);
        context.fillStyle = "transparent";
        context.fill();
        context.strokeStyle = 'gray';
        context.lineWidth = 1.2;
        context.stroke();

        if (this.IsHighlighted && this.Collider) {
            this.roundedRect(context, this.Collider.Left - 4, this.Collider.Top - 4, this.Collider.Width + 8, this.Collider.Height + 8, 10);
            context.fillStyle = "transparent";
            context.fill();
            context.strokeStyle = '#29ff3b';
            context.setLineDash([5, 3]);
            context.lineWidth = 3;
            context.stroke();
        }

        if (Solitaire.isDebug) {
            if (this.Collider && this.Collider.Enabled) {
                context.globalAlpha = 0.3;
                context.fillStyle = 'red';
                context.fillRect(this.Collider.Left, this.Collider.Top, this.Collider.Width, this.Collider.Height);
                context.globalAlpha = 1;
            }

            this.createText(context, `Cards ${this.Behaviors.length}`, 12, this.Left, this.Top - 10);
            if (this.Collider) {
                this.createText(context, `Collider (${Math.round(this.Collider.Left)}, ${Math.round(this.Collider.Top)}, ${this.Collider.Width}, ${this.Collider.Height})`, 8, this.Left, this.Top - 1);
            }
        }

        this.onUpdate(context);
    }

    public drawCards(count: number, fromBotton: boolean): Array<Card> {
        if (typeof count === 'undefined') count = 1;

        var returnCards = new Array<Card>();

        for (var i = count; i > 0; i--) {
            if (this.Behaviors && this.Behaviors.length > 0) {
                const card = (fromBotton ? this.Behaviors.shift() : this.Behaviors.pop()) as Card;
                if (card) {
                    returnCards.push(card);
                }
            }
        }

        this.onDrawCards(returnCards);

        this.updateStack();

        return returnCards;
    }

    addCard(card: Card) {

        if (this.Behaviors.length > 0) {
            const lastCard = this.Behaviors[this.Behaviors.length - 1];
            if (lastCard instanceof Card) {
                lastCard.NextCard = card;
                card.PreviousCard = lastCard;
                card.NextCard = undefined;
            }
        }

        this.add(card);
        this.updateStack();
    }

    addCards(cardStack: Array<Card>) {
        cardStack.forEach((card) => {
            this.addCard(card);
        });
    }

    removeCards(cardStack: Array<Card>) {
        cardStack.forEach((card) => {
            this.removeCard(card);
        });
    }

    removeCard(card: Card) {
        this.remove(card);
        this.updateStack();
    }

    onDrawCards(cards: Array<Card>) {}
    updateStack() {}
}