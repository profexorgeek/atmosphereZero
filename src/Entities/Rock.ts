import Circle from "frostflake/src/Positionables/Circle";
import Frame from "frostflake/src/Drawing/Frame";
import Game from "../Game";
import MathUtil from "frostflake/src/Utility/MathUtil";
import RockSize from "./RockSize";
import Sprite from "frostflake/src/Positionables/Sprite";

export default class Rock extends Sprite {

    private readonly SMALL_RADIUS: number           = 6;
    private readonly MEDIUM_RADIUS: number          = 12;
    private readonly LAYER: number                  = -5;
    private readonly MAX_ROTATION: number           = 1;
    private readonly SMALL_FRAMES: Array<Frame>     = [
        new Frame(64,96,16,16),
        new Frame(80,96,16,16)
    ];
    private readonly MEDIUM_FRAMES: Array<Frame>     = [
        new Frame(0,96,32,32),
        new Frame(32,96,32,32)
    ];


    constructor(size: RockSize = RockSize.Small) {
        super(Game.SPRITESHEET);

        let frameArray = size == RockSize.Small ? this.SMALL_FRAMES : this.MEDIUM_FRAMES;
        let frameIndex = MathUtil.randomIntInRange(0, frameArray.length);

        this.frame = frameArray[frameIndex];
        this.layer = this.LAYER;
        this.position.rotation = MathUtil.randomInRange(0, Math.PI * 2);
        this.velocity.rotation = MathUtil.randomInRange(-this.MAX_ROTATION, this.MAX_ROTATION);
        (<Circle>this.collision).radius = size == RockSize.Small ? this.SMALL_RADIUS : this.MEDIUM_RADIUS;
    }
}