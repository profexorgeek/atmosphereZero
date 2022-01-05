import Circle from "frostflake/src/Positionables/Circle";
import Frame from "frostflake/src/Drawing/Frame";
import FrostFlake from "frostflake/src/FrostFlake";
import Game from "../Game";
import MathUtil from "frostflake/src/Utility/MathUtil";
import Position from "frostflake/src/Positionables/Position";
import RockSize from "./RockSize";
import Sector from "../Views/Sector";
import Sprite from "frostflake/src/Positionables/Sprite";

export default class Rock extends Sprite {

    static readonly MAX_STARTING_VELOCITY: number  = 50;
    static readonly SMALL_RADIUS: number           = 6;
    static readonly MEDIUM_RADIUS: number          = 12;
    static readonly LAYER: number                  = -5;
    static readonly MAX_ROTATION: number           = 1;
    static readonly DRAG: number                   = 2;
    static readonly HEALTH: number                 = 20;
    static readonly ROCKS_TO_CREATE: number        = 3;
    static readonly SMALL_FRAMES: Array<Frame>     = [
        new Frame(64,96,16,16),
        new Frame(80,96,16,16)
    ];
    static readonly MEDIUM_FRAMES: Array<Frame>     = [
        new Frame(0,96,32,32),
        new Frame(32,96,32,32)
    ];
    private _health: number                         = Rock.HEALTH;
    private _size: RockSize                         = RockSize.Small;

    get size(): RockSize {
        return this._size;
    }
    set size(newSize: RockSize) {
        this._size = newSize;

        let frameArray = this._size == RockSize.Small ? Rock.SMALL_FRAMES : Rock.MEDIUM_FRAMES;
        let frameIndex = MathUtil.randomIntInRange(0, frameArray.length);
        this.frame = frameArray[frameIndex];
        (<Circle>this.collision).radius = this._size == RockSize.Small ? Rock.SMALL_RADIUS : Rock.MEDIUM_RADIUS;
    }

    constructor(size: RockSize = RockSize.Small, addVelocity: boolean = true) {
        super(Game.SPRITESHEET);
        
        this.layer = Rock.LAYER;
        this.drag = Rock.DRAG;
        if(addVelocity === true) {
            let magnitude:number = MathUtil.randomInRange(0, Rock.MAX_STARTING_VELOCITY);
            let angle: number = MathUtil.randomInRange(0, Math.PI * 2);
            this.velocity.x = Math.cos(angle) * magnitude;
            this.velocity.y = Math.sin(angle) * magnitude;
        }
        this.velocity.rotation = MathUtil.randomInRange(-Rock.MAX_ROTATION, Rock.MAX_ROTATION);
        this.size = size;
    }

    update(): void {
        super.update();

        if(this._health <= 0) {
            if(this.size == RockSize.Medium) {
                for(let i = 0; i < Rock.ROCKS_TO_CREATE; i++) {

                    // offset position slightly so collision can reposition
                    let newPos: Position = this.position.clone();
                    newPos.x += MathUtil.randomInRange(-i, i);
                    newPos.y += MathUtil.randomInRange(-i, i);
                    (<Sector>FrostFlake.Game.view).requestRock(newPos);
                }
            }
            this.destroy();
        }
    }

    applyDamage(amount: number): void {
        this._health -= amount;
    }
}