import Circle from 'frostflake/src/Positionables/Circle';
import Cursor from 'frostflake/src/Input/Cursor';
import Frame from 'frostflake/src/Drawing/Frame';
import FrostFlake from 'frostflake/src/FrostFlake';
import Input from 'frostflake/src/Input/Input';
import MathUtil from 'frostflake/src/Utility/MathUtil';
import Mouse from 'frostflake/src/Input/Mouse';
import Position from 'frostflake/src/Positionables/Position';
import Sector from '../Views/Sector';
import Sprite from 'frostflake/src/Positionables/Sprite';

export default class Ship extends Sprite {

    private readonly shipFrame: Frame           = new Frame(0,16,16,16);
    private readonly movePrecision: number      = 8;
    private readonly shipDrag: number           = 1;
    private readonly speed: number              = 50;

    private selectionIndicator: Circle;
    private _moveTarget: Position               = new Position();
    private _selected: boolean                  = false;
    

    get selected(): boolean {
        return this._selected;
    }
    set selected(setting: boolean) {
        this._selected = setting;
        this.selectionIndicator.visible = this._selected;
    }


    constructor() {
        super('/content/spritesheet.png');

        this.frame = this.shipFrame;

        (<Circle>this.collision).radius = this.shipFrame.width / 2;
        this.rotation = MathUtil.randomInRange(0, Math.PI * 2);

        this.setUpSelectionIndicator();
    }

    update(): void {
        super.update();
        let input: Input = FrostFlake.Game.input;
        let cursor: Cursor = input.cursor;

        if(this.selected && input.buttonPushed(Mouse.Right))
        {
            this._moveTarget.x = cursor.worldX;
            this._moveTarget.y = cursor.worldY;
        }

        this.moveTowardTarget();
    }

    private setUpSelectionIndicator(): void {
        this.selectionIndicator = new Circle(this.shipFrame.width);
        this.selectionIndicator.color = Sector.selectionColor;
        this.addChild(this.selectionIndicator);
        this.selected = false;
    }

    private moveTowardTarget(): void {
        this.rotation = this.position.angleTo(this._moveTarget);
    }
}