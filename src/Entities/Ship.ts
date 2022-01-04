import BehaviorState from './BehaviorState';
import Circle from 'frostflake/src/Positionables/Circle';
import Cursor from 'frostflake/src/Input/Cursor';
import Frame from 'frostflake/src/Drawing/Frame';
import FrostFlake from 'frostflake/src/FrostFlake';
import Game from '../Game';
import Input from 'frostflake/src/Input/Input';
import MathUtil from 'frostflake/src/Utility/MathUtil';
import Position from 'frostflake/src/Positionables/Position';
import Positionable from 'frostflake/src/Positionables/Positionable';
import Sector from '../Views/Sector';
import Sprite from 'frostflake/src/Positionables/Sprite';

export default class Ship extends Sprite {

    private readonly SHIP_FRAME: Frame           = new Frame(0,16,16,16);
    private readonly MOVE_PRECISION: number      = 8;
    private readonly DRAG: number                = 1;
    private readonly MAX_SPEED: number           = 50;

    private selectionIndicator: Circle;
    private _moveTarget: Position               = null;
    private _actionTarget: Positionable         = null;
    private _selected: boolean                  = false;
    private _behavior: BehaviorState            = BehaviorState.Idle;
    

    get target(): Positionable | Position {
        if(this._actionTarget != null ){
            return this._actionTarget;
        }
        return this._moveTarget;
    }
    set target(newTarget: Positionable | Position) {
        // TODO: more granular type checking and state
        // setting should happen when station and other
        // interactable types are added
        if(newTarget instanceof Positionable) {
            this._actionTarget = newTarget;
            this._behavior = BehaviorState.Attacking;
        }
        else {
            this._moveTarget = newTarget;
            this._behavior = BehaviorState.Flying;
        }
    }

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

        this.moveTowardTarget();
    }


    private setUpSelectionIndicator(): void {
        this.selectionIndicator = new Circle(this.SHIP_FRAME.width);
        this.selectionIndicator.color = Sector.SELECTION_COLOR;
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