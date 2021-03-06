import FrostFlake from "frostflake/src/FrostFlake";
import Input from "frostflake/src/Input/Input";
import Mouse from "frostflake/src/Input/Mouse";
import Camera from "frostflake/src/Positionables/Camera";
import LogLevel from "frostflake/src/Logging/LogLevel";
import Sector from "./Views/Sector";

export default class Game extends FrostFlake {

    public static readonly SPRITESHEET: string = "content/spritesheet.png";

    constructor() {
        super(document.getElementById('game'), 60, "rgb(48, 44, 46)");
        this.camera.resolution = 1;
        this.camera.antialias = true;
        this.camera.width = this.canvas.width * this.camera.resolution;
        this.camera.height = this.canvas.height * this.camera.resolution;
        this.view = new Sector();
        this.showDebug = false;

        FrostFlake.Log.level = LogLevel.Debug;
    }

    update(): void {
        super.update();
    }
}