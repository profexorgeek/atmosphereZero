import BehaviorState from './BehaviorState';
import Circle from 'frostflake/src/Positionables/Circle';
import Data from 'frostflake/src/Data/Data';
import Frame from 'frostflake/src/Drawing/Frame';
import FrostFlake from 'frostflake/src/FrostFlake';
import Game from '../Game';
import Laser from './Laser';
import MathUtil from 'frostflake/src/Utility/MathUtil';
import Position from 'frostflake/src/Positionables/Position';
import Positionable from 'frostflake/src/Positionables/Positionable';
import Sector from '../Views/Sector';
import Sprite from 'frostflake/src/Positionables/Sprite';
import CommandState from './CommandState';
import Rock from './Rock';

export default class Ship extends Sprite {

    static readonly SHIP_FRAME: Frame           = new Frame(0,16,16,16);
    static readonly MOVE_PRECISION: number      = 8;
    static readonly DRAG: number                = 1;
    static readonly MAX_SPEED: number           = 50;
    static readonly SHOTS_PER_SEC: number       = 1;
    static readonly ESCAPE_FACTOR: number       = 2;

    private selectionIndicator: Circle;
    private _moveTarget: Position               = null;
    private _actionTarget: Positionable         = null;
    private _selected: boolean                  = false;
    private _behavior: BehaviorState            = BehaviorState.Idle;
    private _command: CommandState              = CommandState.Idle;
    private _reloadSeconds: number              = 0;
    

    get target(): Positionable | Position {
        if(this._actionTarget != null ){
            return this._actionTarget;
        }
        return this._moveTarget;
    }
    set target(newTarget: Positionable | Position) {

        // Infer player intent from the type of target set. Intent is expressed as
        // a CommandState and stored in _command:

        // 1) if it's empty space, assume we should guard the area
        // 2) if it's an asteroid, assume we should mine autonomously
        // 3) if it's a station, assume we should dock and then mine autonomously
        // 4) if it's an enemy, assume we should attack enemy and any nearby enemies and then guard the area

        if(newTarget instanceof Ship) {
            this._command = CommandState.Guard;
            this._behavior = BehaviorState.Attacking;

            this._actionTarget = newTarget;
        }
        else if(newTarget instanceof Rock) {
            this._command = CommandState.Mine;
            this._behavior = BehaviorState.Attacking;

            this._actionTarget = newTarget;
        }
        else if (newTarget instanceof Position) {
            this._command = CommandState.Guard;
            this._behavior = BehaviorState.Flying;

            this._actionTarget = null;
            this._moveTarget = newTarget;
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

        this.frame = Ship.SHIP_FRAME;

        (<Circle>this.collision).radius = Ship.SHIP_FRAME.width / 2;
        this.rotation = MathUtil.randomInRange(0, Math.PI * 2);

        this.setUpSelectionIndicator();

        this.drag = Ship.DRAG;
    }

    update(): void {
        super.update();

        this.doStateActivity();
    }

    private setUpSelectionIndicator(): void {
        this.selectionIndicator = new Circle(Ship.SHIP_FRAME.width);
        this.selectionIndicator.color = Sector.SELECTION_COLOR;
        this.addChild(this.selectionIndicator);
        this.selected = false;
    }

    private doStateChangeCheck(): void {

        if(this._behavior == BehaviorState.Attacking) {
            // if we have lost our action target, we can't continue attacking
            if(this._actionTarget == null || this._actionTarget.destroyed === true) {
                this._behavior = BehaviorState.Idle;
            }
        }

        else if(this._behavior == BehaviorState.Flying) {
            if(this._moveTarget == null || this.position.distanceTo(this._moveTarget) <= Ship.MOVE_PRECISION)
            {
                this._behavior = BehaviorState.Idle;
            }
        }

        else if(this._behavior == BehaviorState.Idle) {

            // we should be mining
            if(this._command == CommandState.Mine) {
                // we have no target, try to get a new rock to mine and update behavior
                if(this._actionTarget == null || this._actionTarget.destroyed === true) {
                    this._actionTarget = (<Sector>FrostFlake.Game.view).getNearestRock(this.position);
                    this._behavior = BehaviorState.Attacking;
                }
            }

        }
    }

    private doStateActivity(): void {

        // always do reloading first
        this.doReloading();

        // check if we need to do a state change
        this.doStateChangeCheck();

        // do state-based activities
        switch(this._behavior) {
            case BehaviorState.Attacking :

                // make sure our movement target is still relevant
                if(this._moveTarget == null || this._moveTarget.distanceTo(this._actionTarget.position) >= Laser.RANGE)
                {
                    // choose a random distance
                    let magnitude = MathUtil.randomInRange(Laser.RANGE * 0.25, Laser.RANGE * 0.9);

                    // use the existing angle from our target to us
                    let angle = this._actionTarget.position.angleTo(this.position);

                    // choose a move target along our current angle to the rock
                    this._moveTarget = new Position(
                        this._actionTarget.x + Math.cos(angle) * magnitude,
                        this._actionTarget.y + Math.sin(angle) * magnitude);
                }

                this.doAttacking();
                break;
            case BehaviorState.Flying :
                // intentionally do nothing, movement happens automatically
                break;
            case BehaviorState.Idle :
                // intentionally do nothing
                break;
        }

        // always do movement because if we're close enough,
        // the move target will be cleared and this will cause
        // the ship to brake and kill any acceleration
        this.doMovement();
    }

    private doReloading(): void {
        if(this._reloadSeconds >= 0) {
            this._reloadSeconds -= FrostFlake.Game.time.frameSeconds;
        }
    }

    private doMovement(): void {
        this.acceleration.reset();

        // update our move target if our attack target is out of range
        if(this._actionTarget != null) {
            if(this._moveTarget == null || this._moveTarget.distanceTo(this._actionTarget.position) > Laser.RANGE)
            {
                // TODO: get position close enough instead of right on
                this._moveTarget = this._actionTarget.position.clone();
            }
        }

        // if we have a valid move target, move toward it
        if(this._moveTarget != null)
        {
            this.rotation = this.position.angleTo(this._moveTarget);
            let distToStop = this.velocity.length / this.drag;
            let distToTarget = this._moveTarget.subtract(this.position).length;
            if(distToTarget > distToStop + Ship.MOVE_PRECISION)
            {
                this.acceleration.x = Math.cos(this.position.rotation) * Ship.MAX_SPEED;
                this.acceleration.y = Math.sin(this.position.rotation) * Ship.MAX_SPEED;
            }
        }
    }

    private doAttacking(): void {
        if(this._actionTarget !== null &&
            // TODO: check action target type
            this.position.distanceTo(this._actionTarget.position) <= Laser.RANGE &&
            this._reloadSeconds <= 0) {
                let direction = this.absolutePosition.angleTo(this._actionTarget.absolutePosition);
                (<Sector>FrostFlake.Game.view).requestShot(this, direction);
                this._reloadSeconds = 1 / Ship.SHOTS_PER_SEC;
        }
    }
}