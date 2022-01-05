import Sprite from "frostflake/src/Positionables/Sprite";
import Frame from "frostflake/src/Drawing/Frame";
import Position from "frostflake/src/Positionables/Position";
import Game from "../Game";
import Data from "frostflake/src/Data/Data";
import Circle from "frostflake/src/Positionables/Circle";
import FrostFlake from "frostflake/src/FrostFlake";
import Ship from "./Ship";


export default class Laser extends Sprite {

    static readonly RANGE: number           = 150;
    static readonly RED_FRAME: Frame        = new Frame(0,8,8,3);
    static readonly GRN_FRAME: Frame        = new Frame(0,13,8,3);
    static readonly RADIUS: number          = 6;
    static readonly SPEED: number           = 200;
    static readonly DAMAGE: number          = 1;

    private _lifeSeconds: number = 0;
    private _owner: Ship                    = null;

    get owner():Ship {
        return this._owner;
    }


    constructor() {
        super(Game.SPRITESHEET);
        this.frame = Laser.GRN_FRAME;
        (<Circle>this.collision).radius = Laser.RADIUS;
    }

    fire(owner: Ship, direction: number): void {
        this._lifeSeconds = Laser.RANGE / Laser.SPEED;
        this._owner = owner;
        this.position = owner.position.clone();
        this.rotation = direction;
        this.velocity.x = Math.cos(this.rotation) * Laser.SPEED;
        this.velocity.y = Math.sin(this.rotation) * Laser.SPEED;
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