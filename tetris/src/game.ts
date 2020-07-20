import {Polyomino} from './blocks/polyomino';
import {TETROMINO_DEFINITION} from './blocks/definitions/tetromino.definition';
import {resetAll, writeLedNumber} from './mcp23017';

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
    private positionMatrix: Array<number>;

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
        this.startGame();
        console.log('Game started');
    }

    /**
     * Resets all values to default and starts a new game interval
     */
    private newGame() {
        this.matrix = [0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00];
        this.positionMatrix = [0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00];
        this.points = 0;

        // The Tetromino_Definition is the default one. We can change it later, so that we can decide which ones we want
        // to use
        this.polyomino = new Polyomino(TETROMINO_DEFINITION);
        const position = this.polyomino.getPosition();
        for (let row = 0; row < position.length; row++) {
            this.positionMatrix[row] = position[row];
        }
    }

    private startGame() {
        setInterval(async () => {
            try {
                await resetAll();

                for (let row = 0; row < this.matrix.length; row++) {
                    await writeLedNumber(row, this.matrix[row] | this.positionMatrix[row]);
                }

                this.moveRight();

                this.incrementPoints();
            } catch (e) {
                console.error(e);
            }
        }, Game.DEFAULT_MOVING_TIME);
    }

    private moveRight(): void {
        this.move(num => num << 1, num => num < 0xFF);
    }

    private moveLeft(): void {
        this.move(num => num >> 1, num => num > 0x00);
    }

    private move(shift: (num: number) => number, checkValue: (num: number) => boolean): void {
        let shiftedValue: number;
        let oldMatrix = [...this.positionMatrix];

        for (let row = 0; row < this.positionMatrix.length; row++) {
            shiftedValue = shift(this.positionMatrix[row]);
            if (checkValue(shiftedValue)) {
                this.positionMatrix[row] = shiftedValue;
            }
        }

        if (this.isOverlapping()) {
            this.positionMatrix = oldMatrix;
        }
    }

    private isOverlapping(): boolean {
        let bool = false;
        for (let row = 0; row < this.matrix.length; row++) {
            bool = bool || (this.matrix[row] & this.positionMatrix[row]) !== 0;
        }
        return bool;
    }

    /**
     * Increments the points by a given factor
     * If the factor is not given, we'll assume 1
     */
    private incrementPoints(factor = 1): void {
        this.points += factor * Game.DEFAULT_MOVING_TIME;
    }

    getPoints(): number {
        return this.points;
    }
}
