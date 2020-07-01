import {Polyomino} from "./blocks/polyomino";
import {TETROMINO_DEFINITION} from "./blocks/tetromino/tetromino.definition";

class Game {

    /**
     * The default interval time, telling how quickly a block moves
     */
    private static DEFAULT_STARTING_TIME = 1000;

    /**
     * The 8x8 matrix, which will store the on/off state of the LEDs (default 0)
     * Instead of having a two-dimensional array, we will only create one array, which stores hexadecimal values
     * (from 0x00 to 0xFF each)
     */
    private matrix: Array<number>;

    /**
     * A counter for keeping up how many points the player has
     */
    private points: number;

    /**
     * Defines what to do each given time period
     * Actually a NodeJS Timeout
     */
    private moveInterval: number;

    /**
     * The current polyomino block
     */
    private polyomino: Polyomino;

    constructor() {
        this.newGame();
    }

    /**
     * Resets all values to default and starts a new game interval
     */
    private newGame(): void {
        this.matrix = [0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00];
        this.points = 0;

        this.moveInterval = setInterval(() => this.moveDown(), Game.DEFAULT_STARTING_TIME);
        // The Tetromino_Definition is the default one. We can change it later, so that we can decide which ones we want
        // to use
        this.polyomino = new Polyomino(TETROMINO_DEFINITION);
    }

    /**
     * Moves the current Polyomino block down by one row
     */
    private moveDown(): void {
        // Check, if there is space below us -> Check if the lights of the next row are available and off
        if (this.isRowAvailable()) {

        }
    }

    /**
     * Checks if the next row in the matrix is available for the current polyomino block or not
     */
    private isRowAvailable(): boolean {

        return false;
    }

    /**
     * Increments the points by a given factor
     * If the factor is not given, we'll assume 1
     */
    private incrementPoints(factor = 1): void {
        this.points += factor * 1000;
    }
}
