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
        game.resetMatrices();
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
            game.setPosition(6, 0x4);   // 00000100
            game.setMatrix(6, 0x2);     // 00000010

            // Act
            const isAbleToMoveRight = game.isAbleToMoveRight();

            // Assert
            expect(isAbleToMoveRight).toBe(false);
        });

        it('should not allow to move to the right, if we are in most right column', () => {
            // Arrange
            game.setPosition(7, 0x0F);  // 00001111

            // Act
            const isAbleToMoveRight = game.isAbleToMoveRight();

            // Assert
            expect(isAbleToMoveRight).toBe(false);
        });

        it('should allow to move right, if we are not on the most right column', () => {
            // Arrange
            game.setPosition(4, 0x60);  // 01100000

            // Act
            const isAbleToMoveRight = game.isAbleToMoveRight();

            // Assert
            expect(isAbleToMoveRight).toBe(true);
        });
    });

    describe('moveLeft', () => {
        it('should move the current position one column to the left', () => {
            // Arrange
            game.setPositionMatrix([0x00, 0x00, 0x00, 0x40, 0x40, 0x40, 0x40, 0x00]);

            // Act
            game.moveLeft();
            positionMatrix = game.getCopyOfPositionMatrix();

            // Assert
            expect(positionMatrix).toEqual([0x00, 0x00, 0x00, 0x80, 0x80, 0x80, 0x80, 0x00]);
        });
        it('should move the current position one column to the left (2)', () => {
            // Arrange
            game.setPosition(6, 0x78);  // 01111000

            // Act
            game.moveLeft();
            positionMatrix = game.getCopyOfPositionMatrix();

            // Assert
            expect(positionMatrix[6]).toEqual(0xF0);    // 11110000
        });
    });

    describe('isAbleToMoveLeft', () => {
        it('should not allow to move to the left, if there is an obstacle next to the block', () => {
            // Arrange
            game.setPosition(6, 0x2);  // 00000010
            game.setMatrix(6, 0x4);    // 00000100

            // Act
            const isAbleToMoveLeft = game.isAbleToMoveLeft();

            // Assert
            expect(isAbleToMoveLeft).toBe(false);
        });

        it('should not allow to move to the left, if we are on most left column', () => {
            // Arrange
            game.setPosition(6, 0x90);  // 10010000

            // Act
            const isAbleToMoveLeft = game.isAbleToMoveLeft();

            // Assert
            expect(isAbleToMoveLeft).toBe(false);
        });

        it('should allow to move left, if we are not on the most left column', () => {
            // Arrange
            game.setPosition(4, 0x60);  // 01100000

            // Act
            const isAbleToMoveLeft = game.isAbleToMoveLeft();

            // Assert
            expect(isAbleToMoveLeft).toBe(true);
        });
    });

    describe('hasReachedTop', () => {
        it('should be true, if the position matrix has no space left to place blocks', () => {
            // Arrange
            game.setSaveMatrix([0x80, 0x80, 0x80, 0x80, 0x80, 0x80, 0x80, 0x80]);

            // Act
            const hasReachedTop = game.hasReachedTop();

            // Assert
            expect(hasReachedTop).toBe(true);
        });
        it('should be false, if the position matrix still has space for putting blocks', () => {
            // Arrange
            game.setSaveMatrix([0x00, 0x80, 0x80, 0x80, 0x80, 0x80, 0x80, 0x80]);

            // Act
            const hasReachedTop = game.hasReachedTop();

            // Assert
            expect(hasReachedTop).toBe(false);
        });
    });

    describe('hasPlaceToPut', () => {
        it('should be true for a block, which still fits in the matrix', () => {
            // Arrange
            game.setPositionMatrix([0x80, 0x80, 0x80, 0x80, 0x00, 0x00, 0x00, 0x00]);

            // Act
            const hasPlaceToPut = game.hasPlaceToPut();

            // Assert
            expect(hasPlaceToPut).toBe(true);
        });
        it('should be false for a block, which cannot find in the matrix', () => {
            // Arrange
            game.setPositionMatrix([0x80, 0x80, 0x80, 0x80, 0x00, 0x00, 0x00, 0x00]);
            game.setSaveMatrix([0x00, 0x00, 0x80, 0x80, 0x80, 0x80, 0x80, 0x80]);

            // Act
            const hasPlaceToPut = game.hasPlaceToPut();

            // Assert
            expect(hasPlaceToPut).toBe(false);
        });
    });

    describe('saveCurrentPosition', () => {
        it('should store the value from the positionMatrix to the saveMatrix', () => {
            // Arrange
            game.setPositionMatrix([0x00, 0x00, 0x00, 0x00, 0x80, 0x80, 0x80, 0x80]);
            game.setMatrix(6, 0x0F);    // 00001111
            game.setMatrix(7, 0x0A);    // 00001010

            // Act
            game.saveCurrentPosition();
            matrix = game.getCopyOfSaveMatrix();

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
            const result = game.getHexValueOfFirstRowAndCol();

            // Assert
            expect(result).toEqual(-1);
        });
        xit('should return a valid number if the block is at the top left corner', () => {
            // Arrange
            // O block
            game.setPosition(0, 0xC0);
            game.setPosition(1, 0xC0);
            const expected = 0x80;

            // Act
            const result = game.getHexValueOfFirstRowAndCol();

            // Assert
            expect(result).toEqual(expected);
        });
        xit('should return a valid number if the block is somewhere inside the matrix', () => {
            // Arrange
            // J block
            game.setPositionMatrix([0x00, 0x00, 0x00, 0x10, 0x10, 0x30, 0x00, 0x00]);
            const expected = 0x20;

            // Act
            const result = game.getHexValueOfFirstRowAndCol();

            // Assert
            expect(result).toEqual(expected);
        });
    });
});
