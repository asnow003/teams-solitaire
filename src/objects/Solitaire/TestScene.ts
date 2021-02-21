import { CanvasGameSettings } from "../../scripts/canvasGameSettings";
import { CanvaseMouseEvent } from "../../scripts/canvasMouseEvent";
import { CanvasScene } from "../../scripts/canvasScene";
import { Card } from "./Card";
import { Solitaire } from "./Solitaire";
import { DrawStack } from "./DrawStack";
import { PickStack } from "./PickStack";
import { PlayStack } from "./PlayStack";
export class TestScene extends CanvasScene {
    private leftMargin = 25;
    private topMargin = 50;
    private columnMargin = 10;
    private rowMargin = 25;

    private drawStack: DrawStack;
    private pickStack: PickStack;

    private stack1: PlayStack;
    private stack2: PlayStack;

    private playStacks: Array<PlayStack>;

    constructor(settings: CanvasGameSettings) {
        super("test");

        // PLAY stacks
        this.playStacks = new Array<PlayStack>();

        this.stack1 = new PlayStack(
            "stack-1",
            this.getRowPosition(2),
            this.getColumnPosition(3));
        this.addBehavior(this.stack1);
        this.playStacks.push(this.stack1);

        this.stack2 = new PlayStack(
            "stack-2",
            this.getRowPosition(2),
            this.getColumnPosition(5));
        this.addBehavior(this.stack2);
        this.playStacks.push(this.stack2);

        this.drawStack = new DrawStack(
            "draw-stack",
            this.getRowPosition(1),
            this.getColumnPosition(1));
        this.drawStack.IsClickable = true;
        this.drawStack.onClick = (event: CanvaseMouseEvent) => {
            const cards = this.pickStack.drawCards(this.pickStack.NumberOfCards, false);

            cards.forEach((card) => {
                card.IsFaceUp = false;
                card.IsDragable = false;
            });

            this.drawStack.addCards(cards);
        }

        this.drawStack.onDrawCards = (cards: Array<Card>) => {
            this.pickStack.addCards(cards);
        }

        this.addBehavior(this.drawStack);

        this.pickStack = new PickStack(
            "pick-stack",
            this.getRowPosition(1),
            this.getColumnPosition(2));
        this.addBehavior(this.pickStack);

        let cards = new Array<Card>();

        for (var suit = 1; suit > 0; suit--) {
            for (var rank = 5; rank > 1; rank--) {
                const card = new Card(`card-${suit}-${rank}`, suit, rank);
                card.Visible = true;
                cards.push(card);
            }
        }
        this.shuffle(cards);

        // add the initial play stack cards
        let startStackIndex = 0;
        while (startStackIndex < this.playStacks.length) {
            for (var i = startStackIndex; i < this.playStacks.length; i++) {
                const card = cards.pop();
                if (card) {
                    card.IsFaceUp = false;
                    card.Visible = true;
                    this.playStacks[i].addCard(card);
                }
            }

            startStackIndex = startStackIndex + 1;
        }

        // flip the top card of each play stack
        this.playStacks.forEach((stack) => {
            stack.IsReady = true;
            stack.updateStack();
        });

        // add the rest of the cards to the draw stack
        this.drawStack.addCards(cards);

        this.drawStack.draw();
    }

    private getColumnPosition(position: number): number {
        return this.leftMargin + ((position - 1) * (Solitaire.cardWidth + this.columnMargin));
    }

    private getRowPosition(position: number): number {
        return this.topMargin + ((position - 1) * (Solitaire.cardHeight + this.rowMargin));
    }

    private shuffle(array: Array<Card>) {
        for (let i = array.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [array[i], array[j]] = [array[j], array[i]];
        }
    }

    init(context: CanvasRenderingContext2D): void {
        
    }

    public onUpdate(context: CanvasRenderingContext2D) {

    }
}