import { CanvasGameSettings } from "../../scripts/canvasGameSettings";
import { CanvaseMouseEvent } from "../../scripts/canvasMouseEvent";
import { CanvasScene } from "../../scripts/canvasScene";
import { Card } from "./Card";
import { Solitaire } from "./Solitaire";
import { DrawStack } from "./DrawStack";
import { PickStack } from "./PickStack";
import { AceStack } from "./AceStack";
import { PlayStack } from "./PlayStack";
import { RestartButton } from "./RestartButton";
export class SolitaireGame extends CanvasScene {

    private leftMargin = 25;
    private topMargin = 50;
    private columnMargin = 10;
    private rowMargin = 25;

    private drawStack: DrawStack | undefined;
    private pickStack: PickStack | undefined;

    private aceStack1: AceStack | undefined;
    private aceStack2: AceStack | undefined;
    private aceStack3: AceStack | undefined;
    private aceStack4: AceStack | undefined;

    private stack1: PlayStack | undefined;
    private stack2: PlayStack | undefined;
    private stack3: PlayStack | undefined;
    private stack4: PlayStack | undefined;
    private stack5: PlayStack | undefined;
    private stack6: PlayStack | undefined;
    private stack7: PlayStack | undefined;

    private playStacks: Array<PlayStack> | undefined;

    public static Moves: number = 0;
    public static TotalSeconds: number = 0;

    private interval: NodeJS.Timeout | undefined;

    constructor(settings: CanvasGameSettings) {
        super("game");

        this.settings = settings;
    }

    init(context: CanvasRenderingContext2D): void {

        // ACE Stacks

        this.aceStack1 = new AceStack(
            "ace-stack-1",
            this.getRowPosition(1),
            this.getColumnPosition(4)
            );
        this.aceStack1.Suit = 1;
        this.addBehavior(this.aceStack1);

        this.aceStack2 = new AceStack(
            "ace-stack-2",
            this.getRowPosition(1),
            this.getColumnPosition(5)
            );
        this.aceStack2.Suit = 2;
        this.addBehavior(this.aceStack2);
        
        this.aceStack3 = new AceStack(
            "ace-stack-3",
            this.getRowPosition(1),
            this.getColumnPosition(6)
            );
        this.aceStack3.Suit = 3;
        this.addBehavior(this.aceStack3);

        this.aceStack4 = new AceStack(
            "ace-stack-4",
            this.getRowPosition(1),
            this.getColumnPosition(7)
            );
        this.aceStack4.Suit = 4;
        this.addBehavior(this.aceStack4);

        // PLAY stacks
        this.playStacks = new Array<PlayStack>();

        this.stack1 = new PlayStack(
            "stack-1",
            this.getRowPosition(2),
            this.getColumnPosition(1));
        this.addBehavior(this.stack1);
        this.playStacks.push(this.stack1);

        this.stack2 = new PlayStack(
            "stack-2",
            this.getRowPosition(2),
            this.getColumnPosition(2));
        this.addBehavior(this.stack2);
        this.playStacks.push(this.stack2);

        this.stack3 = new PlayStack(
            "stack-3",
            this.getRowPosition(2),
            this.getColumnPosition(3));
        this.addBehavior(this.stack3);
        this.playStacks.push(this.stack3);

        this.stack4 = new PlayStack(
            "stack-4",
            this.getRowPosition(2),
            this.getColumnPosition(4));
        this.addBehavior(this.stack4);
        this.playStacks.push(this.stack4);

        this.stack5 = new PlayStack(
            "stack-5",
            this.getRowPosition(2),
            this.getColumnPosition(5));
        this.addBehavior(this.stack5);
        this.playStacks.push(this.stack5);

        this.stack6 = new PlayStack(
            "stack-6",
            this.getRowPosition(2),
            this.getColumnPosition(6));
        this.addBehavior(this.stack6);
        this.playStacks.push(this.stack6);

        this.stack7 = new PlayStack(
            "stack-7",
            this.getRowPosition(2),
            this.getColumnPosition(7));
        this.addBehavior(this.stack7);
        this.playStacks.push(this.stack7);

        this.drawStack = new DrawStack(
            "draw-stack",
            this.getRowPosition(1),
            this.getColumnPosition(1));
        this.drawStack.IsClickable = true;
        this.drawStack.onClick = (event: CanvaseMouseEvent) => {
            const cards = this.pickStack!.drawCards(this.pickStack!.NumberOfCards, false);

            cards.forEach((card) => {
                card.IsFaceUp = false;
                card.IsDragable = false;
            });

            this.drawStack!.addCards(cards);
        }

        this.drawStack.onDrawCards = (cards: Array<Card>) => {
            this.pickStack!.addCards(cards);
        }

        this.addBehavior(this.drawStack);

        this.pickStack = new PickStack(
            "pick-stack",
            this.getRowPosition(1),
            this.getColumnPosition(2));
        this.addBehavior(this.pickStack);


        const restartButton = new RestartButton("restart-button");
        restartButton.Left = Solitaire.gameWidth - 75;
        restartButton.Top = 8;
        restartButton.Width = 35;
        restartButton.Height = 35;
        restartButton.IsClickable = true;
        restartButton.onClick = (event: CanvaseMouseEvent) => {
            this.restart();
        }
        this.addBehavior(restartButton);

        let cards = new Array<Card>();

        for (var suit = 4; suit > 0; suit--) {
            for (var rank = 14; rank > 1; rank--) {
                const card = new Card(`card-${suit}-${rank}`, suit, rank);
                card.Visible = false;
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

        SolitaireGame.Moves = 0;
        SolitaireGame.TotalSeconds = 0;

        if (this.interval) {
            clearInterval(this.interval);
            this.interval = undefined;
        }

        this.interval = setInterval(this.updateTimer, 1000);
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

    private getTimerDisplay(): string {
        const seconds = (SolitaireGame.TotalSeconds % 60);
        const minutes = Math.round(SolitaireGame.TotalSeconds / 60);
        return `${minutes < 10 ? '0':''}${minutes}:${seconds < 10 ? '0':''}${seconds}`;
    }

    private gameWon(context: CanvasRenderingContext2D) {
        if (this.interval) {
            clearInterval(this.interval);
        }

        if (this.settings) {
            const dialogWidthSize = 300;
            const dialogHeightSize = 200
            const dialogLeft = (this.settings.playAreaWidth - dialogWidthSize) / 2
            const dialogTop = (this.settings.playAreaHeight - dialogHeightSize) / 2
            context.fillStyle = "gray"
            context.fillRect(
                dialogLeft,
                dialogTop,
                dialogWidthSize, dialogHeightSize);
            
            context.beginPath();
            context.rect(
                dialogLeft,
                dialogTop,
                dialogWidthSize, dialogHeightSize);
            context.lineWidth = 2;
            context.stroke();

            const clockImg = document.getElementById("clock") as CanvasImageSource;
            if (clockImg) {
                context.drawImage(
                    clockImg,
                    dialogLeft + 50,
                    dialogTop + 25,
                    50,
                    50);
            }
    
            context.font = `40px Arial`;
            context.fillStyle = "black";
            context.fillText(
                this.getTimerDisplay(),
                dialogLeft + 110,
                dialogTop + 63);
    
            
            const movesImg = document.getElementById("moves") as CanvasImageSource;
            if (movesImg) {
                context.drawImage(
                    movesImg,                    
                    dialogLeft + 50,
                    dialogTop + 100,
                    50,
                    50);
            }
    
            
            context.font = `40px Arial`;
            context.fillStyle = "black";
            context.fillText(
                `${SolitaireGame.Moves}`,
                dialogLeft + 110,
                dialogTop + 140);
            
            
        }
    }

    public onUpdate(context: CanvasRenderingContext2D) {
        if (
            this.aceStack1!.isCompleteStack() &&
            this.aceStack2!.isCompleteStack() &&
            this.aceStack3!.isCompleteStack() &&
            this.aceStack4!.isCompleteStack()
        ) {
            this.gameWon(context);
            return;
        }

        const clockImg = document.getElementById("clock") as CanvasImageSource;
        if (clockImg) {
            context.drawImage(clockImg, 25, 10, 25, 25);
        }

        context.font = `20px Arial`;
        context.fillStyle = "black";
        context.fillText(this.getTimerDisplay(), 55, 30);

        const movesImg = document.getElementById("moves") as CanvasImageSource;
        if (movesImg) {
            context.drawImage(movesImg, 115, 10, 25, 25);
        }

        context.font = `20px Arial`;
        context.fillStyle = "black";
        context.fillText(`${SolitaireGame.Moves}`, 145, 30);
    }

    private updateTimer() {
        SolitaireGame.TotalSeconds = SolitaireGame.TotalSeconds + 1;
    }

    public pause() {
        if (this.interval) {
            clearInterval(this.interval);
        } else {
            this.interval = setInterval(this.updateTimer, 1000);
        }
    }
}