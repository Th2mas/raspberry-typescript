import 'jasmine';
import {Game} from '../src/game';

describe('Game', () => {
    const emptyMatrix = [0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00];
    let positionMatrix: Array<number>;
    let matrix: Array<number>;

    let game: Game;

    beforeEach(() => {
        // Reset matrix
        positionMatrix = [...emptyMatrix];
        matrix = [...emptyMatrix];

        game = new Game();
    });

    describe('moveDown', () => {
        it('should move the current position one row down', () => {
            // Arrange
            game.setPosition(6, 0xF0);
            const matrixBefore = game.getCopyOfPositionMatrix();

            // Act
            game.moveDown();
            positionMatrix = game.getCopyOfPositionMatrix();

            // Assert
            positionMatrix.forEach((row, idx) =>
                expect(positionMatrix[idx]).toEqual(idx > 0 ? matrixBefore[idx - 1] : 0)
            );
        });
    });

    describe('isAbleToMoveDown', () => {
        it('should allow to move down, if we are not in the last row', () => {
            // Arrange
            game.setPosition(6, 0xF0);

            // Act
            const isAbleToMoveDown = game.isAbleToMoveDown();

            // Assert
            expect(isAbleToMoveDown).toBe(true);
        });

        it('should not allow to move down, if we are in the last row', () => {
            // Arrange
            game.setPosition(7, 0xF0);

            // Act
            const isAbleToMoveDown = game.isAbleToMoveDown();

            // Assert
            expect(isAbleToMoveDown).toBe(false);
        });

        it('should not allow to move down, if there is an obstacle below the block', () => {
            // Arrange
            game.setPosition(6, 0xF0);
            game.setMatrix(7, 0xF0);

            // Act
            const isAbleToMoveDown = game.isAbleToMoveDown();

            // Assert
            expect(isAbleToMoveDown).toBe(false);
        });
    });

    describe('moveRight', () => {
        it('should move the current position one column to the right', () => {
            // Arrange
            game.setPositionMatrix([0x00, 0x00, 0x00, 0x40, 0x40, 0x40, 0x40, 0x00]);
            const expected = [0x00, 0x00, 0x00, 0x20, 0x20, 0x20, 0x20, 0x00];

            // Act
            game.moveRight();
            positionMatrix = game.getCopyOfPositionMatrix();

            // Assert
            expect(positionMatrix).toEqual(expected);
        });
        it('should move the current position one column to the right (2)', () => {
            // Arrange
            console.log(game.getCopyOfPositionMatrix());
            game.resetMatrices();   // TODO: We should not need this for the test to work, no?
            game.setPosition(6, 0x78); // 01111000

            // Act
            game.moveRight();
            positionMatrix = game.getCopyOfPositionMatrix();

            // Assert
            expect(positionMatrix[6]).toEqual(0x3C);  // 00111100
        });
    });

    describe('isAbleToMoveRight', () => {
        it('should not allow to move to the right, if there is an obstacle next to the block', () => {
            // Arrange
            positionMatrix[6] = 0x4;    // 00000100
            matrix[6] = 0x2;            // 00000010

            // Act
            const isAbleToMoveRight = Game.isAbleToMoveRight(positionMatrix, matrix);

            // Assert
            expect(isAbleToMoveRight).toBe(false);
        });

        it('should not allow to move to the right, if we are in most right column', () => {
            // Arrange
            positionMatrix[7] = 0x0F;       // 00001111

            // Act
            const isAbleToMoveRight = Game.isAbleToMoveRight(positionMatrix, matrix);

            // Assert
            expect(isAbleToMoveRight).toBe(false);
        });

        it('should allow to move right, if we are not on the most right column', () => {
            // Arrange
            positionMatrix[4] = 0x60;   // 01100000

            // Act
            const isAbleToMoveRight = Game.isAbleToMoveRight(positionMatrix, matrix);

            // Assert
            expect(isAbleToMoveRight).toBe(true);
        });
    });

    describe('moveLeft', () => {
        it('should move the current position one column to the left', () => {
            // Arrange
            positionMatrix[3] = 0x40;   // 01000000
            positionMatrix[4] = 0x40;   // 01000000
            positionMatrix[5] = 0x40;   // 01000000
            positionMatrix[6] = 0x40;   // 01000000

            const secondPositionMatrix = [...emptyMatrix];
            secondPositionMatrix[6] = 0x78; // 01111000

            // Act
            Game.moveLeft(positionMatrix, matrix);
            Game.moveLeft(secondPositionMatrix, matrix);

            // Assert
            expect(positionMatrix[3]).toEqual(0x80);        // 10000000
            expect(positionMatrix[4]).toEqual(0x80);        // 10000000
            expect(positionMatrix[5]).toEqual(0x80);        // 10000000
            expect(positionMatrix[6]).toEqual(0x80);        // 10000000

            expect(secondPositionMatrix[6]).toEqual(0xF0);  // 11110000
        });
    });

    describe('isAbleToMoveLeft', () => {
        it('should not allow to move to the left, if there is an obstacle next to the block', () => {
            // Arrange
            positionMatrix[6] = 0x2;    // 00000010
            matrix[6] = 0x4;            // 00000100

            // Act
            const isAbleToMoveLeft = Game.isAbleToMoveLeft(positionMatrix, matrix);

            // Assert
            expect(positionMatrix.length).toBe(matrix.length);
            expect(isAbleToMoveLeft).toBe(false);
        });

        it('should not allow to move to the left, if we are on most left column', () => {
            // Arrange
            positionMatrix[6] = 0x90;    // 10010000

            // Act
            const isAbleToMoveLeft = Game.isAbleToMoveLeft(positionMatrix, matrix);

            // Assert
            expect(positionMatrix.length).toBe(matrix.length);
            expect(isAbleToMoveLeft).toBe(false);
        });

        it('should allow to move left, if we are not on the most left column', () => {
            // Arrange
            positionMatrix[4] = 0x60;   // 01100000

            // Act
            const isAbleToMoveLeft = Game.isAbleToMoveLeft(positionMatrix, matrix);

            // Assert
            expect(positionMatrix.length).toBe(matrix.length);
            expect(isAbleToMoveLeft).toBe(true);
        });
    });

    describe('hasReachedTop', () => {
        it('should be true, if the position matrix has no space left to place blocks', () => {
            // Arrange
            for (let i = 0; i < positionMatrix.length; i++) {
                positionMatrix[i] = 0x80;
            }

            // Act
            const hasReachedTop = Game.hasReachedTop(positionMatrix);

            // Assert
            expect(hasReachedTop).toBe(true);
        });
        it('should be false, if the position matrix still has space for putting blocks', () => {
            // Arrange
            const maxIndex = positionMatrix.length - 1;
            for (let i = maxIndex - 1; i >= 0; i--) {
                positionMatrix[i] = 0x80;
            }

            // Act
            const hasReachedTop = Game.hasReachedTop(positionMatrix);

            // Assert
            expect(hasReachedTop).toBe(false);
        });
    });

    describe('hasPlaceToPut', () => {
        it('should be true for a block, which still fits in the matrix', () => {
            // Arrange
            for (let i = 0; i < 4; i++) {
                positionMatrix[i] = 0x80;
            }

            // Act
            const hasPlaceToPut = Game.hasPlaceToPut(positionMatrix, matrix);

            // Assert
            expect(hasPlaceToPut).toBe(true);
        });
        it('should be false for a block, which cannot find in the matrix', () => {
            // Arrange
            for (let i = 0; i < 4; i++) {
                positionMatrix[i] = 0x80;
            }

            for (let i = 2; i < matrix.length; i++) {
                matrix[i] = 0x80;
            }

            // Act
            const hasPlaceToPut = Game.hasPlaceToPut(positionMatrix, matrix);

            // Assert
            expect(hasPlaceToPut).toBe(false);
        });
    });

    describe('saveCurrentPosition', () => {
        it('should store the value from the positionMatrix to the saveMatrix', () => {
            // Arrange
            for (let i = positionMatrix.length / 2; i < positionMatrix.length; i++) {
                positionMatrix[i] = 0x80;
            }
            matrix[6] = 0x0F;   // 00001111
            matrix[7] = 0x0A;   // 00001010

            // Act
            Game.saveCurrentPosition(positionMatrix, matrix);

            // Assert
            expect(matrix[4]).toEqual(0x80);    // 10000000
            expect(matrix[5]).toEqual(0x80);    // 10000000
            expect(matrix[6]).toEqual(0x8F);    // 10001111
            expect(matrix[7]).toEqual(0x8A);    // 10001010
        });
    });

    describe('getHexValueOfFirstRowAndCol', () => {
        it('should return -1, if there is no block inside the matrix', () => {
            // Arrange
            // Already done in beforeEach

            // Act
            const result = Game.getHexValueOfFirstRowAndCol(positionMatrix);

            // Assert
            expect(result).toEqual(-1);
        });
        xit('should return a valid number if the block is at the top left corner', () => {
            // Arrange
            // O block
            positionMatrix[0] = 0xC0;
            positionMatrix[1] = 0xC0;
            const expected = 0x80;

            // Act
            const result = Game.getHexValueOfFirstRowAndCol(positionMatrix);

            // Assert
            expect(result).toEqual(expected);
        });
        xit('should return a valid number if the block is somewhere inside the matrix', () => {
            // Arrange
            // J block
            positionMatrix[3] = 0x10;
            positionMatrix[4] = 0x10;
            positionMatrix[5] = 0x30;
            const expected = 0x20;

            // Act
            const result = Game.getHexValueOfFirstRowAndCol(positionMatrix);

            // Assert
            expect(result).toEqual(expected);
        });
    });
});
