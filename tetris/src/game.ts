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
        position.forEach((val, idx) => this.positionMatrix[idx] = val);
    }

    private startGame() {
        setInterval(async () => {
            try {
                await resetAll();

                for (let row = 0; row < this.matrix.length; row++) {
                    await writeLedNumber(row, this.matrix[row] | this.positionMatrix[row]);
                }

                if (this.isAbleToMoveDown()) {
                    this.moveDown();
                } else {
                    Math.random() > 0.5 ? this.moveRight() : this.moveLeft();
                }

                this.incrementPoints();
            } catch (e) {
                console.error(e);
            }
        }, Game.DEFAULT_MOVING_TIME / 2);
    }

    private moveRight(): void {
        this.move(num => num << 1, num => num);
    }

    private moveLeft(): void {
        this.move(num => num >> 1, num => ~(num - 1) & 0xFF);  // Invert the bits for a simpler check, result should be < 255
    }

    private move(shift: (num: number) => number, checkValue: (num: number) => number): void {
        let oldMatrix = [...this.positionMatrix];
        let isValidShift = true;

        this.getNonZeroIndices()
            .forEach(idx => {
                const shiftedValue = shift(this.positionMatrix[idx]);
                isValidShift = isValidShift && (checkValue(shiftedValue) < 0xFF);
                if (isValidShift) {
                    this.positionMatrix[idx] = shiftedValue;
                }
            });

        if (this.isOverlapping() || !isValidShift) {
            this.positionMatrix = oldMatrix;
        }
    }

    private isOverlapping(): boolean {
        return this.matrix.some((value, index) => (value & this.positionMatrix[index]) !== 0);
    }

    private moveDown(): boolean {

        // Check, if we are already in the lowest row
        if (!this.isAbleToMoveDown()) {
            this.saveCurrentPosition();
            return;
        }

        const indexOfLowestBlocksRow = this.getIndexOfLowestBlocksRow();

        // Check, if the current polyomino position is overlapping with the next row of the tetris matrix
        if ((this.positionMatrix[indexOfLowestBlocksRow] & this.matrix[indexOfLowestBlocksRow + 1]) === 0) {
            // Move the polyomino one row down, if the blocks are not overlapping
            this.positionMatrix.unshift(0x00);
            this.positionMatrix.pop();
        } else {
            this.saveCurrentPosition();
        }
    }

    private saveCurrentPosition(): void {
        this.getNonZeroIndices()
            .forEach(idx => this.matrix[idx] = this.matrix[idx] | this.positionMatrix[idx]); // Save the position
    }

    private getNonZeroIndices(): Array<number> {
        return this.positionMatrix
            .map((val, idx) => val !== 0 ? idx : -1)    // Get only the indices, where the value is not 0x00
            .filter(val => val !== -1);                                 // Filter out redundant indices
    }

    /**
     * Checks, if the current polyomino is able to move one row down
     */
    private isAbleToMoveDown(): boolean {
        return this.getIndexOfLowestBlocksRow() !== this.matrix.length;
    }

    /**
     * Finds the index of the lowest blocks in the current polyomino position
     * @return the index of the lowest blocks
     */
    private getIndexOfLowestBlocksRow(): number {
        return this.positionMatrix.length - [...this.positionMatrix].reverse().findIndex(num => num !== 0);
    }

    /**
     * Increments the points by a given factor
     * If the factor is not given, we'll assume 1
     */
    private incrementPoints(factor = 1): void {
        this.points += factor * Game.DEFAULT_MOVING_TIME;
    }
}
