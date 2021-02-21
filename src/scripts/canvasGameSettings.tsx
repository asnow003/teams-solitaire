export class CanvasGameSettings {
    public playAreaWidth: number;
    public playAreaHeight: number;

    public width: number;
    public height: number;
    public isMaximized: boolean;
    public backgroundColor: string;

    public canvasId: string;
    public leftOffset: number = 0;
    public topOffset: number = 0;

    public scaleX: number = 1;
    public scaleY: number = 1;

    constructor(canvasId: string, playAreaWidth: number, playAreaHeight: number, isMaximized: boolean, backgroundColor: string) {
        this.playAreaWidth = playAreaWidth;
        this.playAreaHeight = playAreaHeight;

        this.canvasId = canvasId;
        this.width = playAreaWidth;
        this.height = playAreaHeight;
        this.isMaximized = isMaximized;
        this.backgroundColor = backgroundColor;

        this.updateSettings();
    }

    private updateSettings() {
        let screenWidth = document.documentElement.clientWidth;
        let screenHeight = document.documentElement.clientHeight;
    
        this.scaleX = 1;
        this.scaleY = 1;
        this.leftOffset = 0;
        this.topOffset = 0;
    
        if (this.isMaximized) {
            var scaledScreenWidth = screenWidth;
            var scaledScreenHeight = screenHeight;

            if (screenWidth > screenHeight) {
                scaledScreenWidth = (screenHeight * this.playAreaWidth) / this.playAreaHeight;
                this.leftOffset = (screenWidth - scaledScreenWidth) / 2;
            } else {
                scaledScreenHeight = (screenWidth * this.playAreaHeight) / this.playAreaWidth;
                this.topOffset = (screenHeight - scaledScreenHeight) / 2;
            }

            this.width = scaledScreenWidth;
            this.height = scaledScreenHeight;

            this.scaleX = scaledScreenWidth / this.playAreaWidth;
            this.scaleY = scaledScreenHeight / this.playAreaHeight;

            this.leftOffset = this.leftOffset / this.scaleX;
            this.topOffset = this.topOffset / this.scaleY;
        }

        // console.log(`Settings:\nScale X: ${this.scaleX}\nScale Y: ${this.scaleY}\nScreen: ${screenWidth}w x ${screenHeight}h\nLeft: ${this.leftOffset}, Top: ${this.topOffset}\nArea: ${this.width}w x ${this.height}h`);
    }

    public reload() {
        // console.log("Refreshing settings...");
        this.updateSettings();
    }
}