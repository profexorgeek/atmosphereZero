import Frame from "frostflake/src/Drawing/Frame";
import Game from "../Game";
import MathUtil from "frostflake/src/Utility/MathUtil";
import Sprite from "frostflake/src/Positionables/Sprite";

export default class Cloud extends Sprite {

    private readonly MIN_SCALE: number          = 7;
    private readonly MAX_SCALE: number          = 15;
    private readonly MIN_ALPHA: number          = 0.3;
    private readonly MAX_ALPHA: number          = 0.5;
    private readonly LAYER: number              = -500;
    private readonly ROTATION_SPEED: number     = 0.05;

    private readonly CLOUD_FRAMES: Array<Frame>   = [
        new Frame(480,0,160,160),
        new Frame(480,160,160,160)
    ];

    constructor() {
        super(Game.SPRITESHEET);

        let frameIndex = MathUtil.randomIntInRange(0, this.CLOUD_FRAMES.length);

        this.frame = this.CLOUD_FRAMES[frameIndex];
        this.scale = MathUtil.randomInRange(this.MIN_SCALE, this.MAX_SCALE);
        this.alpha = MathUtil.randomInRange(this.MIN_ALPHA, this.MAX_ALPHA);
        this.layer = this.LAYER;
        this.rotation = MathUtil.randomInRange(-Math.PI, Math.PI);
        this.velocity.rotation = MathUtil.randomInRange(-this.ROTATION_SPEED, this.ROTATION_SPEED);
    }
}