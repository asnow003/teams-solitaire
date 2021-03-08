import { CanvasBehavior } from "../../scripts/canvasBehavior";
import { CanvasBehaviorGroup } from "../../scripts/canvasBehaviorGroup";
import { CanvasBoxCollider } from "../../scripts/canvasBoxCollider";
import { CanvaseMouseEvent } from "../../scripts/canvasMouseEvent";
import { CanvasPosition } from "../../scripts/canvasPosition";
import { CardStack } from "./CardStack";
import { PlayStack } from "./PlayStack";
import { Solitaire } from "./Solitaire";
import { SolitaireGame } from "./SolitaireGame";

export class Card extends CanvasBehaviorGroup {
    private _suit: number;
    get Suit(): number {
        return this._suit;
    }

    private _rank: number;
    get Rank(): number {
        return this._rank;
    }

    private collisions: Array<CanvasBehavior>;

    private _isFaceUp: boolean = false;
    get IsFaceUp(): boolean {
        return this._isFaceUp;
    }
    set IsFaceUp(value: boolean) {
        this._isFaceUp = value;
    }

    get Description(): string {
        let suitString = "";
        switch(this._suit) {
            case 1:
                suitString = "Clubs";
                break;
            case 2:
                suitString = "Diamonds";
                break;
            case 3:
                suitString = "Hearts";
                break;
            case 4:
                suitString = "Spades";
                break;
        }

        let valueString = "";
        switch(this._rank) {
            case 11:
                valueString = "Jack";
                break;
            case 12:
                valueString = "Queen";
                break;
            case 13:
                valueString = "King";
                break;
            case 14:
                valueString = "Ace";
                break;
            default:
                valueString = this._rank.toString();
        }

        return `${valueString} of ${suitString}`;
    }

    get IsAce(): boolean {
        return this._rank === 14;
    }

    get IsRed(): boolean {
        return this._suit === 2 || this._suit === 3;
    }

    get IsBlack(): boolean {
        return this._suit === 1 || this._suit === 4;
    }

    private _previousCard: Card | undefined;
    get PreviousCard(): Card | undefined {
        return this._previousCard;
    }
    set PreviousCard(value: Card | undefined) {
        this._previousCard = value;
    }

    private _nextCard: Card | undefined;
    get NextCard(): Card | undefined {
        return this._nextCard;
    }
    set NextCard(value: Card | undefined) {
        this._nextCard = value;
    }

    private _parentStackIsPlay: boolean = false;
    get ParentStackIsPlay(): boolean {
        return this._parentStackIsPlay;
    }
    set ParentStackIsPlay(value: boolean) {
        this._parentStackIsPlay = value;
    }

    constructor(id: string, suit: number, rank: number) {
        super(id);

        this.collisions = new Array<CanvasBehavior>();

        this._suit = suit;
        this._rank = rank;
        this.Left = 0;
        this.Top = 0;
        this.Width = Solitaire.cardWidth;
        this.Height = Solitaire.cardHeight;

        this.Collider = new CanvasBoxCollider(this.Left, this.Top, this.Width, this.Height);
        this.Collider.Enabled = false;
    }

    start(context: CanvasRenderingContext2D): void {};

    stop(context: CanvasRenderingContext2D): void {};

    onEnter(event: CanvaseMouseEvent) {
        // console.log("ENTER " + this.Id + ` (${this.Left},${this.Top},${this.Width},${this.Height})`);
    }
    
    onLeave(event: CanvaseMouseEvent) {
        // console.log("LEAVE " + this.Id);
    }

    onClick(event: CanvaseMouseEvent) {
        // // console.log("Click " + this.Id);
    }

    private origPosition: CanvasPosition | undefined;
    onDrag(event: CanvaseMouseEvent) {
        this.origPosition = new CanvasPosition(this.Left, this.Top);

        if (this.Collider) {
            this.Collider.Enabled = true;
        }

        // // console.log("DRAG "  + this.Id);

        if (this.ParentStackIsPlay) {
            let loopCard = this.NextCard;
            while (loopCard) {
                this.add(loopCard);
                loopCard = loopCard.NextCard;
            }
        }
    }

    onDragging(event: CanvasPosition) {
        let offset = 40;
        this.Behaviors.forEach((b) => {
            b.Left = event.x;
            b.Top = event.y + offset;
            offset = offset + 40;
        });
    }

    onMove(event: CanvasPosition) {
        let offset = 40;
        if (this.ParentStackIsPlay) {
            let loopCard = this.NextCard;
            while (loopCard) {
                loopCard.Left = event.x;
                loopCard.Top = event.y + offset;
                loopCard = loopCard.NextCard;
                offset = offset + 40;
            }
        }
    }

    onMoving(event: CanvasPosition) {
        let offset = 40;
        this.Behaviors.forEach((b) => {
            b.Left = event.x;
            b.Top = event.y + offset;
            offset = offset + 40;
        });
    }

    onMoved() {
        this.reset();
    }

    onDrop(event: CanvaseMouseEvent) {
        let lastCollision = undefined;

        if (this.Collider) {
            this.Collider.Enabled = false;
        }

        if (this.collisions.length > 0) {
            lastCollision = this.collisions[this.collisions.length - 1];

            this.collisions.forEach((c: CanvasBehavior) => {
                if (c instanceof CardStack &&
                    c.canAddCard(this)) {
                    lastCollision = c;
                }
            });
        }

        if (lastCollision &&
            lastCollision instanceof CardStack &&
            lastCollision.canAddCard(this)) {
            
            let cardsToAdd = new Array<Card>();
            cardsToAdd.push(this);

            if (this.Group &&
                this.Group instanceof CardStack) {

                if (this.Group instanceof PlayStack) {
                    let loopCard = this.NextCard;
                    while (loopCard) {
                        cardsToAdd.push(loopCard);
                        loopCard = loopCard.NextCard;
                    }
                }
                
                this.Group.removeCards(cardsToAdd);
                lastCollision.addCards(cardsToAdd);
            }

            SolitaireGame.Moves = SolitaireGame.Moves + 1;
        } else {
            if (this.origPosition) {
                this.moveTo(this.origPosition, 60);
                this.origPosition = undefined;
            }
        }

        this.collisions = new Array<CanvasBehavior>();

        this.reset();

        // // console.log("CARD DROP"  + this.Id);
    }

    onCollisionEnter(behavior: CanvasBehavior): void {
        // // console.log("CARD ENTER: " + behavior.Id);

        const collisionIndex = this.collisions.indexOf(behavior);
        if (collisionIndex >= 0) {
            this.collisions.splice(collisionIndex, 1);
        }

        this.collisions.push(behavior);
    };

    onCollisionLeave(behavior: CanvasBehavior): void {
        // // console.log("CARD LEAVE: " + behavior.Id);

        const collisionIndex = this.collisions.indexOf(behavior);
        if (collisionIndex >= 0) {
            this.collisions.splice(collisionIndex, 1);
        }
    };

    update(context: CanvasRenderingContext2D): void {
        const img = document.getElementById(this.IsFaceUp ? this.Id : "card-back") as CanvasImageSource;
        if (img) {
            context.drawImage(img, this.Left, this.Top, this.Width, this.Height);
        }

        if (Solitaire.isDebug && this.Collider && this.Collider.Enabled) {
            context.globalAlpha = 0.3;
            context.fillStyle = 'red';
            context.fillRect(this.Collider.Left, this.Collider.Top, this.Collider.Width, this.Collider.Height);
            context.globalAlpha = 1;
            this.createText(context, `(${Math.round(this.Collider.Left)}, ${Math.round(this.Collider.Top)}, ${this.Collider.Width}, ${this.Collider.Height})`, 8, this.Left, this.Top + this.Height + 10);
        }

        if (Solitaire.isDebug) {
            this.createText(context, `${this.Description}`, 10, this.Left + 20, this.Top + 10);
            this.createText(context, `P: ${this.PreviousCard?.Description}`, 8, this.Left + 20, this.Top + 20);
            this.createText(context, `N: ${this.NextCard?.Description}`, 8, this.Left + 20, this.Top + 30);
        }
    }


    public flip() {
        this._isFaceUp = !this._isFaceUp;
    }
}