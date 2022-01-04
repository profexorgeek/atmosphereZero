import Circle from 'frostflake/src/Positionables/Circle';
import Frame from 'frostflake/src/Drawing/Frame';
import MathUtil from 'frostflake/src/Utility/MathUtil';
import Game from '../Game';
import Sprite from 'frostflake/src/Positionables/Sprite';

export default class Star extends Sprite {

    private readonly MIN_SCALE: number           = 0.5;
    private readonly MAX_SCALE: number           = 2;
    private readonly MIN_ALPHA: number           = 0.25;
    private readonly MAX_ALPHA: number           = 0.75;
    private readonly LAYER: number               = -50;
    private readonly STAR_FRAMES: Array<Frame>   = [
        new Frame(0,0,4,4),
        new Frame(0,4,4,4),
        new Frame(4,0,4,4),
        new Frame(4,4,4,4)
    ];

    constructor() {
        super(Game.SPRITESHEET);

        let frameIndex = MathUtil.randomIntInRange(0, this.STAR_FRAMES.length);
        let scale = MathUtil.randomInRange(this.MIN_SCALE, this.MAX_SCALE);
        this.alpha = MathUtil.randomInRange(this.MIN_ALPHA, this.MAX_ALPHA);
        this.frame = this.STAR_FRAMES[frameIndex];
        this.scale = scale;
        this.layer = this.LAYER;
        (<Circle>this.collision).radius = 1;
        this.parallax = 1 / scale;
    }
}