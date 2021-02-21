export class Settings {
    public static readonly playAreaWidth: number = 1000;
    public static readonly playAreaHeight: number = 800;

    public static readonly cardWidth: number = 125;
    public static readonly cardHeight: number = 175;

    public readonly isDebug: boolean = false;

    leftOffset: number;
    topOffset: number;

    scaleX: number;
    scaleY: number;

    constructor(isDebug: boolean) {
        this.isDebug = isDebug;

        let screenWidth = document.documentElement.clientWidth;
        let screenHeight = document.documentElement.clientHeight;
    
        this.scaleX = 1;
        this.scaleY = 1;
        this.leftOffset = 0;
        this.topOffset = 0;
    
        var scaledScreenWidth = screenWidth;
        var scaledScreenHeight = screenHeight;

        if (screenWidth > screenHeight) {
            scaledScreenWidth = (screenHeight * Settings.playAreaWidth) / Settings.playAreaHeight;
            this.leftOffset = (screenWidth - scaledScreenWidth) / 2;
        } else {
            scaledScreenHeight = (screenWidth * Settings.playAreaHeight) / Settings.playAreaHeight;
            this.topOffset = (screenHeight - scaledScreenHeight) / 2;
        }

        this.scaleX = scaledScreenWidth / Settings.playAreaWidth;
        this.scaleY = scaledScreenHeight / Settings.playAreaHeight;

        // console.log(`Settings:\nScale X: ${this.scaleX}\nScale Y: ${this.scaleY}`);
    }
}