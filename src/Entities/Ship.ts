import Circle from 'frostflake/src/Positionables/Circle';
import Cursor from 'frostflake/src/Input/Cursor';
import Frame from 'frostflake/src/Drawing/Frame';
import FrostFlake from 'frostflake/src/FrostFlake';
import Game from '../Game';
import Input from 'frostflake/src/Input/Input';
import MathUtil from 'frostflake/src/Utility/MathUtil';
import Mouse from 'frostflake/src/Input/Mouse';
import Position from 'frostflake/src/Positionables/Position';
import Sector from '../Views/Sector';
import Sprite from 'frostflake/src/Positionables/Sprite';


export default class Ship extends Sprite {

    private readonly SHIP_FRAME: Frame           = new Frame(0,16,16,16);
    private readonly MOVE_PRECISION: number      = 8;
    private readonly DRAG: number                = 1;
    private readonly MAX_SPEED: number           = 50;

    private selectionIndicator: Circle;
    private _moveTarget: Position               = null;
    private _selected: boolean                  = false;
    

    get selected(): boolean {
        return this._selected;
    }
    set selected(setting: boolean) {
        this._selected = setting;
        this.selectionIndicator.visible = this._selected;
    }

    constructor() {
        super(Game.SPRITESHEET);

        this.frame = this.SHIP_FRAME;

        (<Circle>this.collision).radius = this.SHIP_FRAME.width / 2;
        this.rotation = MathUtil.randomInRange(0, Math.PI * 2);

        this.setUpSelectionIndicator();

        this.drag = this.DRAG;
    }

    update(): void {
        super.update();
        let input: Input = FrostFlake.Game.input;
        let cursor: Cursor = input.cursor;

        if(this.selected && input.buttonPushed(Mouse.Right))
        {
            this._moveTarget = new Position(cursor.worldX, cursor.worldY)
        }

        this.moveTowardTarget();
    }

    private setUpSelectionIndicator(): void {
        this.selectionIndicator = new Circle(this.SHIP_FRAME.width);
        this.selectionIndicator.color = Sector.selectionColor;
        this.addChild(this.selectionIndicator);
        this.selected = false;
    }

    private moveTowardTarget(): void {
        this.acceleration.reset();
        if(this._moveTarget !== null)
        {
            this.rotation = this.position.angleTo(this._moveTarget);
            let distToStop = this.velocity.length / this.drag;
            let distToTarget = this._moveTarget.subtract(this.position).length;
            if(distToTarget > distToStop + this.MOVE_PRECISION)
            {
                this.acceleration.x = Math.cos(this.position.rotation) * this.MAX_SPEED;
                this.acceleration.y = Math.sin(this.position.rotation) * this.MAX_SPEED;
            }
        }
    }
}