import Sprite from "frostflake/src/Positionables/Sprite";
import Frame from "frostflake/src/Drawing/Frame";
import Position from "frostflake/src/Positionables/Position";
import Game from "../Game";
import Data from "frostflake/src/Data/Data";
import Circle from "frostflake/src/Positionables/Circle";
import FrostFlake from "frostflake/src/FrostFlake";


export default class Laser extends Sprite {

    private readonly RED_FRAME: Frame        = new Frame(0,8,8,3);
    private readonly GRN_FRAME: Frame        = new Frame(0,13,3,8);
    private readonly RADIUS: number          = 6;
    private readonly SPEED: number           = 200;
    private readonly RANGE: number           = 200;

    private _lifeSeconds: number = 0;

    constructor() {
        super(Game.SPRITESHEET);
        this.frame = this.GRN_FRAME;
        (<Circle>this.collision).radius = this.RADIUS;
    }

    fire(referencePosition: Position) {
        this._lifeSeconds = this.RANGE / this.SPEED;
        this.position = Data.clone(referencePosition);
        this.velocity.x = Math.cos(this.position.rotation) * this.SPEED;
        this.velocity.y = Math.sin(this.position.y) * this.SPEED;
    }

    update(): void {
        super.update();

        this._lifeSeconds -= FrostFlake.Game.time.frameSeconds;
        if(this._lifeSeconds <= 0)
        {
            this.destroy();
        }
    }
}