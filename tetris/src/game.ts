import {Polyomino, PolyominoRotationJSON} from './blocks/polyomino';
import {TETROMINO_DEFINITION} from './blocks/definitions/tetromino.definition';
import {resetAll, writeLedNumber} from './mcp23017';
import {activateControlButtons, deactivateControlButtons, moveLeft$, moveRight$, rotateLeft$, rotateRight$} from './controls';

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

    constructor() {
        this.definition = TETROMINO_DEFINITION;

        activateControlButtons();
        this.subscriptions.push(
            moveLeft$.subscribe(async () => await this.moveLeft()),
            moveRight$.subscribe(async () => await this.moveRight()),
            rotateLeft$.subscribe(async () => await this.rotateLeft()),
            rotateRight$.subscribe(async () => await this.rotateRight())
        );

        this.newGame();
        this.startGame();
        console.log('Game started');
    }

    /**
     * Resets all values to default and starts a new game interval
     */
    private newGame() {
        this.movementSpeed = Game.DEFAULT_MOVING_TIME;
        this.savedBlocks = 0;
        this.matrix = [0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00];
        this.points = 0;

        this.resetPolyomino();
    }

    private startGame() {
        (async () => {
            while (true) {
                try {
                    await this.writeLEDS();

                    // Check, if we are already in the lowest row
                    if (this.isAbleToMoveDown()) {
                        this.moveDown();
                    } else {
                        if (this.hasReachedTop()) {
                            console.info(`Game over! Collected points: ${this.points}`);
                            console.info('To close the game, press Ctrl+C');
                            this.subscriptions.forEach(subscription => subscription.unsubscribe());
                            deactivateControlButtons();
                            return;
                        }
                        this.saveCurrentPosition();
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

    private resetPolyomino(): void {
        this.polyomino = new Polyomino(this.definition);
        this.positionMatrix = [0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00];
        this.polyomino.getPosition().forEach((val, idx) => this.positionMatrix[idx] = val);
    }

    private async moveRight(): Promise<void> {
        await this.move(num => num << 1, num => num);
    }

    private async moveLeft(): Promise<void> {
        await this.move(num => num >> 1, num => ~(num - 1) & 0xFF);  // Invert the bits for a simpler check, result should be < 255
    }

    private async move(shift: (num: number) => number, checkValue: (num: number) => number): Promise<void> {
        let oldMatrix = [...this.positionMatrix];
        let isValidShift = true;

        // Shift the position only where it is really needed
        this.getNonZeroIndices()
            .forEach(idx => {
                const shiftedValue = shift(this.positionMatrix[idx]);
                isValidShift = isValidShift && (checkValue(shiftedValue) < 0xFF);
                if (isValidShift) {
                    this.positionMatrix[idx] = shiftedValue;
                }
            });

        // If we are overlapping with the save matrix or have performed a shift too much (i.e. we went outside the allowed range), restore
        if (this.isOverlapping() || !isValidShift) {
            this.positionMatrix = oldMatrix;
        }

        await this.writeLEDS();
    }

    private async writeLEDS(): Promise<void> {
        await resetAll();

        for (let row = 0; row < this.matrix.length; row++) {
            await writeLedNumber(row, this.matrix[row] | this.positionMatrix[row]);
        }
    }

    /**
     * Checks, if the current position of the polyomino is overlapping with the values inside the save matrix
     */
    private isOverlapping(): boolean {
        return this.matrix.some((value, index) => (value & this.positionMatrix[index]) !== 0);
    }

    /**
     * Moves the polyomino exactly one row down
     */
    private moveDown(): void {
        this.positionMatrix.unshift(0x00);
        this.positionMatrix.pop();
    }

    /**
     * Saves the current position of the position matrix in the save matrix
     */
    private saveCurrentPosition(): void {
        this.getNonZeroIndices()
            .forEach(idx => this.matrix[idx] = this.matrix[idx] | this.positionMatrix[idx]); // Save the position
        this.savedBlocks++;
    }

    /**
     * Gets the indices of the position matrix, where the value is not 0 -> get the parts where the polyomino is stored
     */
    private getNonZeroIndices(): Array<number> {
        return this.positionMatrix
            .map((val, idx) => val !== 0 ? idx : -1)    // Get only the indices, where the value is not 0x00
            .filter(val => val !== -1);                                 // Filter out redundant indices
    }

    /**
     * Checks, if the current polyomino is able to move one row down
     */
    private isAbleToMoveDown(): boolean {
        const indexOfLowestBlocksRow = this.getIndexOfLowestBlocksRow();

        // Checks, if there is still a row available to move down
        const isNotOnTheLowestRow = indexOfLowestBlocksRow !== (this.matrix.length - 1);

        // Check, if the current polyomino position is not overlapping with the next row of the tetris matrix
        const isNotOverlappingWithNextRow = (this.positionMatrix[indexOfLowestBlocksRow] & this.matrix[indexOfLowestBlocksRow + 1]) === 0;

        return isNotOnTheLowestRow && isNotOverlappingWithNextRow;
    }

    /**
     * Finds the index of the lowest blocks in the current polyomino position
     * It requires, that the position matrix already has a polyomino inside
     * @return the index of the lowest blocks
     */
    private getIndexOfLowestBlocksRow(): number {
        return (this.positionMatrix.length - [...this.positionMatrix].reverse().findIndex(num => num !== 0)) - 1;
    }

    /**
     * Checks, if the top was reached and therefore if the game is over
     */
    private hasReachedTop(): boolean {
        return this.matrix.reduce((prev, curr) => prev && (curr !== 0), true);
    }

    private updateMovementSpeed(): void {
        // The smaller the value, the faster the movement
        this.movementSpeed *= this.savedBlocks % Game.NUMBER_OF_STEPS === 0 ? 0.5 : 1;
    }

    private async rotateLeft(): Promise<void> {
        this.polyomino.rotateCounterClockWise();
        // TODO: Rotation does not work yet
        console.log('Rotate left');
        await this.writeLEDS();
    }

    private async rotateRight(): Promise<void> {
        this.polyomino.rotateClockWise();
        // TODO: Rotation does not work yet
        console.log('Rotate right');
        await this.writeLEDS();
    }

    /**
     * Increments the points by a given factor
     * If the factor is not given, we'll assume 1
     */
    private incrementPoints(factor = 1): void {
        this.points += factor * Game.DEFAULT_MOVING_TIME;
    }
}
