import {Polyomino, PolyominoRotationJSON} from './blocks/polyomino';
import {TETROMINO_DEFINITION} from './blocks/definitions/tetromino.definition';
import {resetAll, writeLedNumber} from './mcp23017';
import {activateControlButtons, deactivateControlButtons, moveLeft$, moveRight$, rotateLeft$, rotateRight$} from './controls';

// TODO: After testing it statically, move the methods back to being part of the object
//  -> hide the internal structure

// TODO: Move the connection of the LED Matrix to another file (maybe index.ts)
export class Game {

    /**
     * The default interval time, telling how quickly a block moves
     */
    private static DEFAULT_MOVING_TIME = 1000;

    /**
     * The number of saved blocks at which the speed gets incremented
     */
    private static NUMBER_OF_STEPS = 5;

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

    private readonly definition: PolyominoRotationJSON[];
    private movementSpeed: number;
    private savedBlocks: number;

    private subscriptions = [];

    private static readonly EMPTY_MATRIX = [0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00];

    constructor() {
        this.definition = TETROMINO_DEFINITION;
        this.newGame();
    }

    /**
     * Resets all values to default and starts a new game interval
     */
    private newGame() {
        this.movementSpeed = Game.DEFAULT_MOVING_TIME;
        this.savedBlocks = 0;
        this.points = 0;

        this.resetMatrices();
        this.resetPolyomino();
    }

    start() {
        (async () => {
            while (true) {
                try {
                    await Game.writeLEDS(this.positionMatrix, this.matrix);

                    // Check, if we are already in the lowest row
                    if (this.isAbleToMoveDown()) {
                        this.moveDown();
                    } else {
                        if (Game.hasReachedTop(this.matrix) || !Game.hasPlaceToPut(this.positionMatrix, this.matrix)) {
                            console.info(`Game over! Collected points: ${this.points}`);
                            console.info('To close the game, press Ctrl+C');
                            this.subscriptions.forEach(subscription => subscription.unsubscribe());
                            deactivateControlButtons();
                            return;
                        }

                        Game.saveCurrentPosition(this.positionMatrix, this.matrix);
                        this.savedBlocks++;
                        this.updateMovementSpeed();
                        this.resetPolyomino();
                    }

                    this.incrementPoints();
                } catch (e) {
                    console.error(e);
                }

                // Determine how fast the blocks should move
                await new Promise(res => setTimeout(res, this.movementSpeed));
            }
        })();
    }

    resetMatrices(): void {
        this.matrix = [...Game.EMPTY_MATRIX];
        this.positionMatrix = [...Game.EMPTY_MATRIX];
    }

    private resetPolyomino(): void {
        this.polyomino = new Polyomino(this.definition);

        // Per default, the position is on the most right
        this.polyomino.getBlock().forEach((val, idx) => this.positionMatrix[idx] = val);
    }

    /**
     * Moves the polyomino exactly one row down
     */
    moveDown(): void {
        this.positionMatrix.unshift(0x00);
        this.positionMatrix.pop();
    }

    /**
     * Checks, if the current polyomino is able to move one row down
     */
    isAbleToMoveDown(): boolean {
        const indexOfLowestBlocksRow = Game.getIndexOfLowestBlocksRow(this.positionMatrix);

        // Checks, if there is still a row available to move down
        const isNotOnTheLowestRow = indexOfLowestBlocksRow !== (this.matrix.length - 1);

        // Check, if the current polyomino position is not overlapping with the next row of the tetris matrix
        const isNotOverlappingWithNextRow = (this.positionMatrix[indexOfLowestBlocksRow] & this.matrix[indexOfLowestBlocksRow + 1]) === 0;

        return isNotOnTheLowestRow && isNotOverlappingWithNextRow;
    }

    moveRight(): void {
        Game.move(this.positionMatrix, this.matrix, Game.isAbleToMoveRight, val => val >> 1);
    }

    static moveLeft(positionMatrix: Array<number>, matrix: Array<number>): void {
        Game.move(positionMatrix, matrix, Game.isAbleToMoveLeft, val => val << 1);
    }

    static isAbleToMoveRight(positionMatrix: Array<number>, matrix: Array<number>): boolean {
        return Game.isAbleToMove(positionMatrix, matrix, num => num >> 1, 0x01);
    }

    static isAbleToMoveLeft(positionMatrix: Array<number>, matrix: Array<number>): boolean {
        return Game.isAbleToMove(positionMatrix, matrix, num => num << 1, 0x80);
    }

    private static isAbleToMove(
        positionMatrix: Array<number>,
        matrix: Array<number>,
        shift: (num: number) => number,
        maskValue: number
    ): boolean {
        const indicesOfNonZeroBlocks = Game.getNonZeroRowIndices(positionMatrix);

        let isGoingToOverlapWithMatrix = false;
        let isGoingOutOfBounds = false;

        for (const idx of indicesOfNonZeroBlocks) {
            isGoingToOverlapWithMatrix = isGoingToOverlapWithMatrix || ((shift(positionMatrix[idx]) & matrix[idx]) !== 0);
            isGoingOutOfBounds = isGoingOutOfBounds || ((positionMatrix[idx] & maskValue) !== 0);
        }

        return !isGoingToOverlapWithMatrix && !isGoingOutOfBounds;
    }

    private static move(
        positionMatrix: Array<number>,
        matrix: Array<number>,
        check: (positionMatrix: Array<number>, matrix: Array<number>) => boolean,
        shift: (num: number) => number
    ): void {
        if (check(positionMatrix, matrix)) {
            // We want to assign the shifted matrix to the current one. Since we only pass references, we use splice for setting it directly
            positionMatrix.splice(0, positionMatrix.length, ...positionMatrix.map(shift));
        }
    }

    private static async writeLEDS(positionMatrix: Array<number>, matrix: Array<number>): Promise<void> {
        await resetAll();

        for (let row = 0; row < matrix.length; row++) {
            // TODO: Instead of calling this directly, let the LED matrix know of a state change with an observable
            await writeLedNumber(row, matrix[row] | positionMatrix[row]);
        }
    }

    /**
     * Saves the current position of the position matrix in the save matrix
     */
    static saveCurrentPosition(positionMatrix: Array<number>, matrix: Array<number>): void {
        matrix.splice(0, matrix.length, ...positionMatrix
            .map((val, idx) => matrix[idx] | val));
    }

    static hasPlaceToPut(positionMatrix: Array<number>, matrix: Array<number>): boolean {
        return Game.getNonZeroRowIndices(positionMatrix)
            .reduce((prev, curr) => prev && ((positionMatrix[curr] & matrix[curr]) === 0), true);
    }

    /**
     * Finds the index of the lowest blocks in the current polyomino position
     * It requires, that the position matrix already has a polyomino inside
     * @return the index of the lowest blocks
     */
    private static getIndexOfLowestBlocksRow(matrix: Array<number>): number {
        return (matrix.length - [...matrix].reverse().findIndex(num => num !== 0)) - 1;
    }

    /**
     * Checks, if the top was reached and therefore if the game is over
     */
    static hasReachedTop(matrix: Array<number>): boolean {
        return matrix.reduce((prev, curr) => prev && (curr !== 0), true);
    }

    private updateMovementSpeed(): void {
        // The smaller the value, the faster the movement
        this.movementSpeed *= this.savedBlocks % Game.NUMBER_OF_STEPS === 0 ? 0.5 : 1;
    }

    private rotateLeft(): void {
        Game.rotate(this.polyomino, this.polyomino.rotateCounterClockWise);
    }

    private rotateRight(): void {
        Game.rotate(this.polyomino, this.polyomino.rotateClockWise);
    }

    static rotate(polyomino: Polyomino, rotation: () => void): void {
        rotation();
        const newPosition = polyomino.getBlock();
        // TODO: Rotation does not work yet
        console.log('Rotate');
    }

    static getHexValueOfFirstRowAndCol(positionMatrix: Array<number>): number {
        // Filter out all zeroes
        const nonZeroRowIndices = Game.getNonZeroRowIndices(positionMatrix);

        // If the matrix is empty, return -1
        if (nonZeroRowIndices.length === 0) {
            return -1;
        }

        // Get first col, which has a non zero value

        return 0;
    }

    /**
     * Gets the indices of the position matrix, where the value is not 0 -> get the parts where the polyomino is stored
     */
    static getNonZeroRowIndices(matrix: Array<number>): Array<number> {
        return matrix
            .map((val, idx) => val !== 0 ? idx : -1)    // Get only the indices, where the value is not 0x00
            .filter(val => val !== -1);                                 // Filter out redundant indices
    }

    setPosition(idx: number, value: number): void {
        this.positionMatrix[idx] = value;
    }

    setMatrix(idx: number, value: number): void {
        this.matrix[idx] = value;
    }

    setPositionMatrix(matrix: Array<number>): void {
        this.positionMatrix = matrix;
    }

    getCopyOfPositionMatrix(): Array<number> {
        return [...this.positionMatrix];
    }

    activate(): void {
        activateControlButtons();
        this.subscriptions.push(
            moveLeft$.subscribe(async () => {
                // Since the LEDs are reversed, we need to call moveRight here
                this.moveRight();
                await Game.writeLEDS(this.positionMatrix, this.matrix);
            }),
            moveRight$.subscribe(async () => {
                // Since the LEDs are reversed, we need to call moveRight here
                Game.moveLeft(this.positionMatrix, this.matrix);
                await Game.writeLEDS(this.positionMatrix, this.matrix);
            }),
            rotateLeft$.subscribe(async () => await this.rotateLeft()),
            rotateRight$.subscribe(async () => await this.rotateRight())
        );
    }

    /**
     * Increments the points by a given factor
     * If the factor is not given, we'll assume 1
     */
    private incrementPoints(factor = 1): void {
        this.points += factor * Game.DEFAULT_MOVING_TIME;
    }
}
