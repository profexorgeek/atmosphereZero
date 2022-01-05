import Camera from 'frostflake/src/Positionables/Camera';
import Data from 'frostflake/src/Data/Data';
import FrostFlake from 'frostflake/src/FrostFlake';
import Game from '../Game';
import Input from 'frostflake/src/Input/Input';
import Laser from '../Entities/Laser';
import MathUtil from 'frostflake/src/Utility/MathUtil';
import Mouse from 'frostflake/src/Input/Mouse';
import Position from 'frostflake/src/Positionables/Position';
import Positionable from 'frostflake/src/Positionables/Positionable';
import Rectangle from 'frostflake/src/Positionables/Rectangle';
import RepositionType from 'frostflake/src/Positionables/RepositionType';
import Rock from '../Entities/Rock';
import RockSize from '../Entities/RockSize';
import Ship from '../Entities/Ship';
import Star from '../Entities/Star';
import View from 'frostflake/src/Views/View';

export default class Sector extends View {

    public static readonly SELECTION_COLOR: string   = "rgba(182,213,60,0.75)";
    private readonly NUM_STARS: number               = 600;
    private readonly NUM_SHIPS: number               = 5;
    private readonly NUM_ROCKS: number               = 100;
    private readonly CAM_DRAG: number                = 5;
    private readonly CAM_MOVE: number                = 10;
    private readonly WORLD_SIZE: number              = 1200;
    
    private _ships: Array<Ship>                     = [];
    private _rocks: Array<Rock>                     = [];
    private _shots: Array<Laser>                    = [];
    private _selecting: boolean                     = false;
    private _camStartDrag: boolean                  = false;
    private _boxStart: any                          = {x: 0, y: 0};
    private _selectionBox: Rectangle;
    private _worldBounds:Rectangle;

    async initialize(): Promise<void> {
        await super.update();

        await Data.loadImage(Game.SPRITESHEET);

        // add drag to camera so it slows down over time
        FrostFlake.Game.camera.drag = this.CAM_DRAG;

        this.createStars();
        this.createShips();
        this.createSelectionBox();
        this.createWorldBounds();
    }

    destroy(): void {
        FrostFlake.Game.camera.reset();
    }

    update(): void {
        super.update();

        // clean up lists first
        this.removeDestroyed(this._ships);
        this.removeDestroyed(this._rocks);
        this.removeDestroyed(this._shots);

        this.doInput();
        this.doCollisions();
        this.doAddRocks();
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

    getNearestRock(position: Position): Rock {
        let nearestDistance: number = Number.MAX_SAFE_INTEGER;
        let nearestRock: Rock = null;
        for(var i = this._rocks.length - 1; i >= 0; i--) {
            let rock: Rock = this._rocks[i];
            let newDist: number = rock.position.distanceTo(position)
            if(newDist < nearestDistance) {
                nearestDistance = newDist;
                nearestRock = rock;
            }
        }
        return nearestRock;
    }

    requestShot(requestingShip: Ship, direction: number) {
        var shot = new Laser();
        this._shots.push(shot);
        this.addChild(shot);
        shot.fire(requestingShip, direction);
    }

    requestRock(position: Position, size: RockSize = RockSize.Small, addVelocity:boolean = true) {
        let rock = new Rock(size, addVelocity);
        rock.position = position;
        this.addChild(rock);
        this._rocks.push(rock);
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

    private createWorldBounds(): void {
        this._worldBounds = new Rectangle(this.WORLD_SIZE, this.WORLD_SIZE);
        this._worldBounds.color = "rgba(230,72,46,0.25)";
        this._worldBounds.visible = true;
        this.addChild(this._worldBounds);
    }

    private createSelectionBox():void {
        this._selectionBox = new Rectangle(0,0);
        this._selectionBox.color = Sector.SELECTION_COLOR;
        this._selectionBox.visible = false;
        this.addChild(this._selectionBox);
    }

    private removeDestroyed(list: Array<Positionable>): void {
        for(let i = list.length - 1; i >= 0; i--)
        {
            if(list[i].destroyed === true)
            {
                list.splice(i, 1);
            }
        }
    }

    private randomPositionInSector(includeRotation: boolean = false): Position {
        return new Position(
            MathUtil.randomInRange(-this.WORLD_SIZE / 2, this.WORLD_SIZE / 2),
            MathUtil.randomInRange(-this.WORLD_SIZE / 2, this.WORLD_SIZE / 2),
            MathUtil.randomInRange(0, Math.PI * 2)
        );
    }

    private doAddRocks(): void {
        while(this._rocks.length < this.NUM_ROCKS) {
            let rockSize = Math.random() < 0.5 ? RockSize.Small : RockSize.Medium;
            this.requestRock(this.randomPositionInSector(true), rockSize);
        }
    }

    private doInput(): void {
        let input: Input = FrostFlake.Game.input;
        let cam: Camera = FrostFlake.Game.camera;

        this._selectionBox.visible = false;

        if(input.buttonDown(Mouse.Middle))
        {
            cam.velocity.x -= input.cursor.changeX * this.CAM_MOVE;
            cam.velocity.y -= input.cursor.changeY * this.CAM_MOVE;
        }

        if(input.buttonDown(Mouse.Right)) {
            let target = this.getTargetAtPoint(input.cursor.worldX, input.cursor.worldY);

            for(let i = this._ships.length - 1; i >= 0; i--) {
                let ship = this._ships[i];
                if(ship.selected) {
                    if(target === null) {
                        ship.target = new Position(input.cursor.worldX, input.cursor.worldY);
                    }
                    else {
                        ship.target = target;
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
        // ship vs ship
        for(let i = this._ships.length - 1; i >= 0; i--) {
            let ship1 = this._ships[i];

            // test ship vs the rest of ships
            for(let j = i; j >= 0; j--) {
                let ship2 = this._ships[j];

                if(ship1 !== ship2) {
                    ship1.collision.collideWith(ship2.collision, RepositionType.Bounce, 0.5, 0.5, 0.5);
                }
                
            }
        }

        // shots vs all
        for(let i = this._shots.length - 1; i >= 0; i--) {
            let shot = this._shots[i];

            // shots vs asteroids
            for(let j = this._rocks.length - 1; j >= 0; j--) {
                let rock = this._rocks[j];

                if(shot.collision.collideWith(rock.collision, RepositionType.Bounce, 0.1, 0.9, 0.1))
                {
                    rock.applyDamage(Laser.DAMAGE);
                    shot.destroy();
                }
            }
        }

        // rocks vs rocks
        for(let i = this._rocks.length - 1; i >= 0; i--) {
            let rock1 = this._rocks[i];
            for(let j = this._rocks.length - 1; j >= 0; j--) {
                let rock2 = this._rocks[j];

                if(rock1 !== rock2) {
                    rock1.collision.collideWith(rock2.collision, RepositionType.Bounce, 0.5, 0.5, 1);
                }
            }
        }
    }
}