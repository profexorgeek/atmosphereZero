import Circle from 'frostflake/src/Positionables/Circle';
import Frame from 'frostflake/src/Drawing/Frame';
import MathUtil from 'frostflake/src/Utility/MathUtil';
import Game from '../Game';
import Sprite from 'frostflake/src/Positionables/Sprite';

export default class Star extends Sprite {

    private readonly minScale: number           = 0.5;
    private readonly maxScale: number           = 2;
    private readonly minAlpha: number           = 0.1;
    private readonly maxAlpha: number           = 0.4;
    private readonly starFrames: Array<Frame>   = [
                                                    new Frame(0,0,4,4),
                                                    new Frame(0,4,4,4),
                                                    new Frame(4,0,4,4),
                                                    new Frame(4,4,4,4)
                                                ];

    constructor() {
        super(Game.SPRITESHEET);

        let frameIndex = MathUtil.randomIntInRange(0, this.starFrames.length);
        let scale = MathUtil.randomInRange(this.minScale, this.maxScale);
        this.alpha = MathUtil.randomInRange(this.minAlpha, this.maxAlpha);
        this.frame = this.starFrames[frameIndex];
        this.scale = scale;
        (<Circle>this.collision).radius = 1;
        this.parallax = 1 / scale;
    }

}