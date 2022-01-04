import Camera from 'frostflake/src/Positionables/Camera';
import Data from 'frostflake/src/Data/Data';
import FrostFlake from 'frostflake/src/FrostFlake';
import Game from '../Game';
import Input from 'frostflake/src/Input/Input';
import MathUtil from 'frostflake/src/Utility/MathUtil';
import Mouse from 'frostflake/src/Input/Mouse';
import Position from 'frostflake/src/Positionables/Position';
import Rectangle from 'frostflake/src/Positionables/Rectangle';
import RepositionType from 'frostflake/src/Positionables/RepositionType';
import Rock from '../Entities/Rock';
import RockSize from '../Entities/RockSize';
import Ship from '../Entities/Ship';
import Star from '../Entities/Star';
import View from 'frostflake/src/Views/View';

export default class Sector extends View {

    public static readonly SELECTION_COLOR: string   = "rgba(182,213,60,0.75)";
    private readonly NUM_STARS: number               = 500;
    private readonly NUM_SHIPS: number               = 5;
    private readonly NUM_ROCKS: number               = 40;
    private readonly CAM_DRAG: number                = 3;
    private readonly CAM_MOVE: number                = 100;
    private readonly WORLD_SIZE: number              = 1000;
    
    private _ships: Array<Ship>                     = [];
    private _rocks: Array<Rock>                     = [];
    private _selecting: boolean                     = false;
    private _boxStart: any                          = {x: 0, y: 0};
    private _selectionBox: Rectangle;

    async initialize(): Promise<void> {
        await super.update();

        await Data.loadImage(Game.SPRITESHEET);

        // add drag to camera so it slows down over time
        FrostFlake.Game.camera.drag = this.CAM_DRAG;

        this.createStars();
        this.createShips();
        this.createRocks();
        this.createSelectionBox();
    }

    destroy(): void {
        FrostFlake.Game.camera.reset();
    }

    update(): void {
        super.update();
        this.doInput();
        this.doCollisions();
    }

    getTargetAtPoint(x: number, y: number) {
        // TODO: test ships

        // EARLY OUT: return the first rock whose collision contains
        // the provided point
        for(let i = this._rocks.length - 1; i >= 0; i--) {
            let rock = this._rocks[i];
            if(rock.collision.isPointInside(x,y))
            {
                return rock;
            }
        }

        return null;
    }

    private createShips(): void {
        for(let i = 0; i < this.NUM_SHIPS; i++) {
            let ship = new Ship();
            ship.position = FrostFlake.Game.camera.randomPositionInView;
            this._ships.push(ship);
            this.addChild(ship);
        }
    }

    private createStars(): void {
        for(let i = 0; i < this.NUM_STARS; i++) {
            let star = new Star();
            star.position = this.randomPositionInSector();
            this.addChild(star);
        }
    }

    private createRocks(): void {
        for(let i = 0; i < this.NUM_ROCKS; i++) {
            let size = Math.random() > 0.5 ? RockSize.Small : RockSize.Medium;
            let rock = new Rock(size);
            rock.position = this.randomPositionInSector(true);
            this._rocks.push(rock);
            this.addChild(rock);
        }
    }

    private createSelectionBox():void {
        this._selectionBox = new Rectangle(0,0);
        this._selectionBox.color = Sector.SELECTION_COLOR;
        this._selectionBox.visible = false;
        this.addChild(this._selectionBox);
    }

    private randomPositionInSector(includeRotation: boolean = false): Position {
        return new Position(
            MathUtil.randomInRange(-this.WORLD_SIZE, this.WORLD_SIZE),
            MathUtil.randomInRange(-this.WORLD_SIZE, this.WORLD_SIZE),
            MathUtil.randomInRange(0, Math.PI * 2)
        );
    }

    private doInput(): void {
        let input: Input = FrostFlake.Game.input;
        let cam: Camera = FrostFlake.Game.camera;

        this._selectionBox.visible = false;

        if(input.buttonDown(Mouse.Middle))
        {
            cam.velocity.x = input.cursor.changeX * this.CAM_MOVE;
            cam.velocity.y = input.cursor.changeY * this.CAM_MOVE;
        }

        if(input.buttonDown(Mouse.Right)) {
            let target = this.getTargetAtPoint(input.cursor.worldX, input.cursor.worldY);

            for(let i = this._ships.length - 1; i >= 0; i--) {
                let ship = this._ships[i];
                if(ship.selected) {
                    if(target === null) {
                        ship.moveTarget = new Position(input.cursor.worldX, input.cursor.worldY);
                    }
                    else {
                        ship.attackTarget = target;
                    }
                }
            }
        }

        if(input.buttonDown(Mouse.Left)) {
            // we just started selecting, set the selection box
            // origin point
            if(this._selecting === false) {
                this._boxStart = {
                    x: input.cursor.worldX,
                    y: input.cursor.worldY
                }
            }

            // calculate the selection box position and dimensions
            let dX = (input.cursor.worldX - this._boxStart.x);
            let dY = (input.cursor.worldY - this._boxStart.y);
            this._selectionBox.x = this._boxStart.x + (dX / 2);
            this._selectionBox.y = this._boxStart.y + (dY / 2);
            this._selectionBox.width = dX;
            this._selectionBox.height = dY;

            this._selecting = true;
        }
        else {
            // we just finished selecting, use collision to
            // see if a ship was selected
            if(this._selecting === true) {
                for(let i = this._ships.length - 1; i >= 0; i--) {
                    let testShip = this._ships[i];
                    let collided = this._selectionBox.collideWith(testShip.collision, RepositionType.None);
                    testShip.selected = collided;
                }
                
            }

            this._selecting = false;
        }

        // the selection box visibility should match the current
        // selecting state
        this._selectionBox.visible = this._selecting;
    }

    private doCollisions(): void {
        for(let i = this._ships.length - 1; i >= 0; i--) {
            let ship1 = this._ships[i];
            for(let j = i; j >= 0; j--) {
                let ship2 = this._ships[j];

                ship1.collision.collideWith(ship2.collision, RepositionType.Bounce, 0.5, 0.5, 0.5);
            }
        }
    }
}