interface ChainData {
    chained: HTMLImageElement;
    container: HTMLElement;
    imgX: Percentage;
    imgY: Percentage;
    wrpX: Percentage;
    wrpY: Percentage;
}
interface Config {
    interval?: number;
    resize: boolean;
    contours: boolean;
    target: boolean;
}
declare type Percentage = number;
declare type RawPixel = number;
declare class ChainInside {
    private closure;
    collection: ChainData[];
    private config;
    contourElement?: HTMLElement;
    constructor(config: Config);
    configurate(key: string, value: number | boolean | undefined): void | string;
    private imageComplete;
    private enforceChained;
    private drawImageContour;
    private drawTarget;
    register(chained: HTMLImageElement, imgX: RawPixel | Percentage, imgY: RawPixel | Percentage, wrpX: RawPixel | Percentage, wrpY: RawPixel | Percentage): void | string;
    private isPercentage;
    private isPixel;
    private percentageToPixel;
    private pixelToPercentage;
}
