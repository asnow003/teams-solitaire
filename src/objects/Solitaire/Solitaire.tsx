import { CanvasGame } from "../../scripts/canvasGame";
import { CanvasGameSettings } from "../../scripts/canvasGameSettings";
import { SolitaireGame } from "./SolitaireGame";

export class Solitaire extends CanvasGame {

    public static isDebug: boolean = false;

    public static gameWidth: number = 1000;
    public static gameHeight: number = 800;

    public static cardWidth: number = 125;
    public static cardHeight: number = 175;

    constructor() {
        const settings = new CanvasGameSettings("canvas", Solitaire.gameWidth, Solitaire.gameHeight, true, "#59C551");
        super(settings, [
            // new TestScene(settings),
            new SolitaireGame(settings),
            // new FinishedGame(settings)
        ], "game");

        this.loadCardImages();
    }

    private addImage(path: string, id: string) {
        let images = document.getElementById("cards");
        let img = new Image();
        img.id = id;
        img.src = path;

        if (images) {
            images.appendChild(img);
        }
    }

    loadCardImages() {
        let cards = document.getElementById("cards");
        
        // cardback
        let img = new Image();
        img.id = `card-back`;
        img.src = `./images/cards/0.svg`;
        cards?.appendChild(img);

        // ace stack placeholders
        let ace1 = new Image();
        ace1.id = `1-14-stack`;
        ace1.src = `./images/cards/1-14-stack.svg`;
        cards?.appendChild(ace1);

        let ace2 = new Image();
        ace2.id = `2-14-stack`;
        ace2.src = `./images/cards/2-14-stack.svg`;
        cards?.appendChild(ace2);

        let ace3 = new Image();
        ace3.id = `3-14-stack`;
        ace3.src = `./images/cards/3-14-stack.svg`;
        cards?.appendChild(ace3);

        let ace4= new Image();
        ace4.id = `4-14-stack`;
        ace4.src = `./images/cards/4-14-stack.svg`;
        cards?.appendChild(ace4);

        this.addImage('./images/cards/clock.svg', 'clock');
        this.addImage('./images/cards/moves.svg', 'moves');
        this.addImage('./images/cards/play.svg', 'play');

        if (cards) {
            for (var suit = 4; suit > 0; suit--) {
                for (var rank = 14; rank > 1; rank--) {
                    let img = new Image();
                    img.id = `card-${suit}-${rank}`;
                    img.src = `./images/cards/${suit}-${rank}.svg`;

                    cards.appendChild(img);
                }
            }
        }
    }
}