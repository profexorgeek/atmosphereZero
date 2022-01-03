import Camera from 'frostflake/src/Positionables/Camera';
import Data from 'frostflake/src/Data/Data';
import FrostFlake from 'frostflake/src/FrostFlake';
import Game from '../Game';
import Input from 'frostflake/src/Input/Input';
import Mouse from 'frostflake/src/Input/Mouse';
import Rectangle from 'frostflake/src/Positionables/Rectangle';
import RepositionType from 'frostflake/src/Positionables/RepositionType';
import Ship from '../Entities/Ship';
import Star from '../Entities/Star';
import View from 'frostflake/src/Views/View';
import Cloud from '../Entities/Cloud';
import MathUtil from '../../node_modules/frostflake/src/Utility/MathUtil';

export default class Sector extends View {

    public static readonly SELECTION_COLOR: string   = "rgba(182,213,60,0.75)";
    private readonly NUM_STARS: number               = 100;
    private readonly NUM_CLOUDS:number               = 3;
    private readonly NUM_SHIPS: number               = 5;
    private readonly CAM_DRAG: number                = 3;
    private readonly CAM_MOVE: number                = 100;
    private readonly WORLD_SIZE: number              = 1000;
    private readonly LAYER_STARS: number             = -50;

    private _ships: Array<Ship>                     = [];
    private _selecting: boolean                     = false;
    private _boxStart: any                          = {x: 0, y: 0};
    private _selectionBox: Rectangle;

    async initialize(): Promise<void> {
        await super.update();

        await Data.loadImage(Game.SPRITESHEET);

        // add drag to camera so it slows down over time
        FrostFlake.Game.camera.drag = this.CAM_DRAG;

        this.createStars();
        this.createClouds();
        this.createShips();
        this.createSelectionBox();
    }

    destroy(): void {
        FrostFlake.Game.camera.reset();
    }

    update(): void {
        super.update();
        this.doInput();
    }



    createShips(): void {
        for(let i = 0; i < this.NUM_SHIPS; i++) {
            let ship = new Ship();
            ship.position = FrostFlake.Game.camera.randomPositionInView;
            this._ships.push(ship);
            this.addChild(ship);
        }
    }

    createStars(): void {
        for(let i = 0; i < this.NUM_STARS; i++) {
            let star = new Star();
            star.position = FrostFlake.Game.camera.randomPositionInView;
            star.layer = this.LAYER_STARS;
            this.addChild(star);
        }
    }

    createClouds(): void {
        for(let i = 0; i < this.NUM_CLOUDS; i++) {
            let cloud = new Cloud();
            cloud.x = MathUtil.randomInRange(-this.WORLD_SIZE, this.WORLD_SIZE);
            cloud.y = MathUtil.randomInRange(-this.WORLD_SIZE, this.WORLD_SIZE);
            this.addChild(cloud);
        }
    }

    createSelectionBox():void {
        this._selectionBox = new Rectangle(0,0);
        this._selectionBox.color = Sector.SELECTION_COLOR;
        this._selectionBox.visible = false;
        this.addChild(this._selectionBox);
    }


    doInput(): void {
        let input: Input = FrostFlake.Game.input;
        let cam: Camera = FrostFlake.Game.camera;

        this._selectionBox.visible = false;

        if(input.buttonDown(Mouse.Middle))
        {
            cam.velocity.x = input.cursor.changeX * this.CAM_MOVE;
            cam.velocity.y = input.cursor.changeY * this.CAM_MOVE;
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
}