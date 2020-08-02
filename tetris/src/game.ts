import {Polyomino, PolyominoRotationJSON} from './blocks/polyomino';
import {TETROMINO_DEFINITION} from './blocks/definitions/tetromino.definition';
import {resetAll, writeLedNumber} from './mcp23017';
import {activateControlButtons, deactivateControlButtons, moveLeft$, moveRight$, rotateLeft$, rotateRight$} from './controls';

// TODO: Move the connection of the LED Matrix to another file (maybe index.ts)
export class Game {

    /**
     * The default interval time, telling how quickly a block moves
     */
    private static DEFAULT_MOVING_TIME = 1500;

    /**
     * The number of saved blocks at which the speed gets incremented
     */
    private static NUMBER_OF_STEPS = 10;

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
        this.resetPosition();
    }

    start() {
        (async () => {
            while (true) {
                try {
                    await this.writeLEDS();

                    // Check for game over
                    if (!this.hasPlaceToPut()) {
                        console.info(`Game over! Collected points: ${this.points}`);
                        console.info('To close the game, press Ctrl+C');
                        this.subscriptions.forEach(subscription => subscription.unsubscribe());
                        deactivateControlButtons();
                        return;
                    }

                    // Check, if we are already in the lowest row
                    if (this.isAbleToMoveDown()) {
                        this.moveDown();
                    }
                    // Otherwise save the last position
                    else {
                        this.saveCurrentPosition();
                        this.savedBlocks++;
                        this.updateMovementSpeed();

                        if (this.isAnyRowFull()) {
                            this.eraseFullRows();
                            this.incrementPoints(2);
                        }

                        this.resetPosition();
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

    private resetPosition(): void {
        this.polyomino = new Polyomino(this.definition);
        this.positionMatrix = [...Game.EMPTY_MATRIX];

        const block = this.polyomino.getBlock();

        // Per default, the position is on the most right -> introduce some random position
        const totalLengthBlock = Game.getNonZeroRowIndices(block)
            .map(idx => block[idx])
            .reduce((prev, curr) => prev | curr, 0x00);    // OR mask the rows for determining the length

        const maxLength = [...Game.toBinary(totalLengthBlock).match(/1/g)].length;
        console.log(maxLength);
        const randomCol = Math.floor(Math.random() * (7 - maxLength));
        block.forEach((val, idx) => this.positionMatrix[idx] = val << randomCol);
    }

    /**
     * Increments the points by a given factor
     * If the factor is not given, we'll assume 1
     */
    private incrementPoints(factor = 1): void {
        this.points += factor * Game.DEFAULT_MOVING_TIME;
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
     * TODO: Check this method again -> somehow when rotating, it sometimes allows the block to go one row down although there is no space
     */
    isAbleToMoveDown(): boolean {
        const indexOfLowestBlocksRow = Game.getIndexOfLowestBlocksRow(this.positionMatrix);

        // Checks, if there is still a row available to move down
        const isNotOnTheLowestRow = indexOfLowestBlocksRow !== (this.matrix.length - 1);

        // Check, if the current polyomino position is not overlapping with the next row of the tetris matrix
        const isNotOverlappingWithNextRow = (this.positionMatrix[indexOfLowestBlocksRow] & this.matrix[indexOfLowestBlocksRow + 1]) === 0;

        return isNotOnTheLowestRow && isNotOverlappingWithNextRow;
    }

    /**
     * Moves the current position of the polyomino one column to the right
     */
    moveRight(): void {
        Game.move(this.positionMatrix, this.matrix, () => this.isAbleToMoveRight(), val => val >> 1);
    }

    /**
     * Moves the current position of the polyomino one column to the left
     */
    moveLeft(): void {
        Game.move(this.positionMatrix, this.matrix, () => this.isAbleToMoveLeft(), val => val << 1);
    }

    /**
     * Checks, if the current polyomino can move to the right
     */
    isAbleToMoveRight(): boolean {
        return this.isAbleToMove(num => num >> 1, 0x01);
    }

    /**
     * Checks, if the current polyomino can move to the left
     */
    isAbleToMoveLeft(): boolean {
        return this.isAbleToMove( num => num << 1, 0x80);
    }

    /**
     * Checks, if the current polyomino can move in the given direction
     * @param shift the shift method, defining the moving direction (only left or right shift)
     * @param maskValue indicates the border of the matrix
     */
    private isAbleToMove(shift: (num: number) => number, maskValue: number): boolean {
        const indicesOfNonZeroBlocks = Game.getNonZeroRowIndices(this.positionMatrix);

        let isGoingToOverlapWithMatrix = false;
        let isGoingOutOfBounds = false;

        for (const idx of indicesOfNonZeroBlocks) {
            isGoingToOverlapWithMatrix = isGoingToOverlapWithMatrix || ((shift(this.positionMatrix[idx]) & this.matrix[idx]) !== 0);
            isGoingOutOfBounds = isGoingOutOfBounds || ((this.positionMatrix[idx] & maskValue) !== 0);
        }

        return !isGoingToOverlapWithMatrix && !isGoingOutOfBounds;
    }
    /**
     * Moves the current position of the polyomino one column to the left or right, depending on the shift
     * @param positionMatrix the matrix containing the current position of the polyomino
     * @param matrix the save matrix which we use for checking
     * @param check a method for checking, if we are able to move
     * @param shift Determines the move direction of the polyomino
     * TODO: Instead of having the shift method, pass an enum
     */
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

    /**
     * Writes all LEDs currently available inside the save matrix and position matrix
     */
    private async writeLEDS(): Promise<void> {
        await resetAll();

        for (let row = 0; row < this.matrix.length; row++) {
            // TODO: Instead of calling this directly, let the LED matrix know of a state change with an observable
            await writeLedNumber(row, this.matrix[row] | this.positionMatrix[row]);
        }
    }

    /**
     * Saves the current position of the position matrix in the save matrix
     */
    saveCurrentPosition(): void {
        this.matrix.splice(0, this.matrix.length, ...this.positionMatrix
            .map((val, idx) => this.matrix[idx] | val));
    }

    /**
     * Checks if the current position of the polyomino is not overlapping with anything in the save matrix
     */
    hasPlaceToPut(): boolean {
        return Game.getNonZeroRowIndices(this.positionMatrix)
            .reduce((prev, curr) => prev && ((this.positionMatrix[curr] & this.matrix[curr]) === 0), true);
    }

    /**
     * Finds the index of the lowest blocks in the current polyomino position
     * It requires, that the position matrix already has a polyomino inside
     * @return the index of the lowest blocks
     */
    private static getIndexOfLowestBlocksRow(matrix: Array<number>): number {
        return (matrix.length - [...matrix].reverse().findIndex(num => num !== 0)) - 1;
    }

    private updateMovementSpeed(): void {
        // The smaller the value, the faster the movement
        this.movementSpeed *= this.savedBlocks % Game.NUMBER_OF_STEPS === 0 ? 0.5 : 1;
    }

    private rotateLeft(): void {
        this.rotate(this.polyomino, () => this.polyomino.rotateCounterClockWise());
    }

    private rotateRight(): void {
        this.rotate(this.polyomino, () => this.polyomino.rotateClockWise());
    }

    rotate(polyomino: Polyomino, rotation: () => void): void {
        // Rotate the polyomino
        rotation();

        // Get the row and col at which we start copying
        const { row, col } = this.getHexValueOfFirstRowAndCol();

        // Reset the matrix for containing only the rotated polyomino
        this.positionMatrix = [...Game.EMPTY_MATRIX];

        polyomino.getBlock().forEach((val, idx) => this.positionMatrix[idx + row] = val << col);
    }

    getHexValueOfFirstRowAndCol(): { row: number, col: number } {
        // Filter out all zeroes
        const nonZeroRowIndices = Game.getNonZeroRowIndices(this.positionMatrix);

        // If the matrix is empty, return -1
        if (nonZeroRowIndices.length === 0) {
            return { row: -1, col: -1};
        }

        // Get first col, which has a non zero value -> determines how much we have to shift
        let col = this.positionMatrix.length;
        for (const idx of nonZeroRowIndices) {
            const position = this.positionMatrix[idx];
            for (let i = 0; i < this.positionMatrix.length; i++) {
                const firstCol = Game.toBinary(position & (1 << i))
                    .split('').reverse()
                    .findIndex(val => val !== '0');
                col = (col > firstCol && firstCol !== -1) ? firstCol : col;
            }
        }

        return { row: nonZeroRowIndices[0], col };
    }

    static toBinary(num: number): string {
        return num.toString(2).padStart(8, '0');
    }

    isAnyRowFull(): boolean {
        return Game.getNonZeroRowIndices(this.matrix)
            .filter(idx => this.matrix[idx] === 0xFF)
            .length > 0;
    }

    eraseFullRows(): void {
        const replacedMatrix = [...this.matrix]
            .map(val => val === 0xFF ? 0x00 : val);

        const newMatrix = [];
        Game.getNonZeroRowIndices(replacedMatrix)
            .forEach(idx => newMatrix.push(replacedMatrix[idx]));

        while (newMatrix.length !== 8) {
            newMatrix.unshift(0x00);
        }

        this.matrix = newMatrix;
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

    setSaveMatrix(matrix: Array<number>): void {
        this.matrix = matrix;
    }

    getCopyOfPositionMatrix(): Array<number> {
        return [...this.positionMatrix];
    }

    getCopyOfSaveMatrix(): Array<number> {
        return [...this.matrix];
    }

    activate(): void {
        activateControlButtons();
        this.subscriptions.push(
            moveLeft$.subscribe(async () => {
                this.moveLeft();
                await this.writeLEDS();
            }),
            moveRight$.subscribe(async () => {
                this.moveRight();
                await this.writeLEDS();
            }),
            rotateLeft$.subscribe(async () => {
                this.rotateLeft();
                await this.writeLEDS();
            }),
            rotateRight$.subscribe(async () => {
                this.rotateRight();
                await this.writeLEDS();
            })
        );
    }
}
