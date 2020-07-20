import {Polyomino} from './blocks/polyomino';
import {TETROMINO_DEFINITION} from './blocks/definitions/tetromino.definition';
import {writeLedNumber} from './mcp23017';

export class Game {

    /**
     * The default interval time, telling how quickly a block moves
     */
    private static DEFAULT_MOVING_TIME = 1000;

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
     * The current polyomino block
     */
    private polyomino: Polyomino;

    constructor() {
        this.newGame();
        this.startGame()
            .then(() => console.log('Game started'));
    }

    /**
     * Resets all values to default and starts a new game interval
     */
    private newGame() {
        this.matrix = [0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00];
        this.points = 0;

        // The Tetromino_Definition is the default one. We can change it later, so that we can decide which ones we want
        // to use
        this.polyomino = new Polyomino(TETROMINO_DEFINITION);
    }

    private async startGame() {
        try {
            const position = this.polyomino.getPosition();
            for (const index in position) {
                const i = Number(index);
                await writeLedNumber(i, position[i]);
            }
        } catch (e) {
            console.error(e);
        }
    }

    /**
     * Increments the points by a given factor
     * If the factor is not given, we'll assume 1
     */
    private incrementPoints(factor = 1): void {
        this.points += factor * Game.DEFAULT_MOVING_TIME;
    }
}
