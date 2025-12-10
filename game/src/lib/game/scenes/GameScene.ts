import Phaser from 'phaser';
import { TILE_COLOR_ARRAY, GAME_CONFIG } from '../config';

interface Tile {
    sprite: Phaser.GameObjects.Graphics;
    colorIndex: number;
    row: number;
    col: number;
}

/**
 * Main game scene - puzzle gameplay
 */
export class GameScene extends Phaser.Scene {
    private grid: (Tile | null)[][] = [];
    private selectedTile: Tile | null = null;
    private score: number = 0;
    private timeLeft: number = GAME_CONFIG.GAME_DURATION;
    private combo: number = 0;
    private isProcessing: boolean = false;

    // UI elements
    private scoreText!: Phaser.GameObjects.Text;
    private timeText!: Phaser.GameObjects.Text;
    private comboText!: Phaser.GameObjects.Text;
    private timerEvent!: Phaser.Time.TimerEvent;

    // Grid positioning
    private gridStartX: number = 0;
    private gridStartY: number = 0;
    private readonly tileSize = GAME_CONFIG.TILE_SIZE;
    private readonly gap = GAME_CONFIG.TILE_GAP;

    constructor() {
        super({ key: 'GameScene' });
    }

    create(): void {
        const width = this.cameras.main.width;
        const height = this.cameras.main.height;

        // Reset state
        this.score = 0;
        this.timeLeft = GAME_CONFIG.GAME_DURATION;
        this.combo = 0;
        this.isProcessing = false;
        this.selectedTile = null;
        this.grid = [];

        // Calculate grid position (centered)
        const gridWidth = GAME_CONFIG.GRID_SIZE * (this.tileSize + this.gap) - this.gap;
        const gridHeight = GAME_CONFIG.GRID_SIZE * (this.tileSize + this.gap) - this.gap;
        this.gridStartX = (width - gridWidth) / 2;
        this.gridStartY = (height - gridHeight) / 2 + 30;

        // Create HUD
        this.createHUD();

        // Create grid
        this.createGrid();

        // Check for initial matches
        this.removeInitialMatches();

        // Start timer
        this.timerEvent = this.time.addEvent({
            delay: 1000,
            callback: this.updateTimer,
            callbackScope: this,
            loop: true,
        });
    }

    private createHUD(): void {
        const width = this.cameras.main.width;

        // Score
        this.add.text(50, 20, 'SCORE', {
            fontFamily: 'Outfit',
            fontSize: '12px',
            color: 'rgba(255, 255, 255, 0.6)',
        });

        this.scoreText = this.add.text(50, 38, '0', {
            fontFamily: 'Outfit',
            fontSize: '28px',
            fontStyle: 'bold',
            color: '#fcc419',
        });

        // Time
        this.add.text(width - 50, 20, 'TIME', {
            fontFamily: 'Outfit',
            fontSize: '12px',
            color: 'rgba(255, 255, 255, 0.6)',
        }).setOrigin(1, 0);

        this.timeText = this.add.text(width - 50, 38, '60', {
            fontFamily: 'Outfit',
            fontSize: '28px',
            fontStyle: 'bold',
            color: '#ffffff',
        }).setOrigin(1, 0);

        // Combo (centered, hidden initially)
        this.comboText = this.add.text(width / 2, 50, '', {
            fontFamily: 'Outfit',
            fontSize: '24px',
            fontStyle: 'bold',
            color: '#f093fb',
        });
        this.comboText.setOrigin(0.5, 0.5);
        this.comboText.setAlpha(0);
    }

    private createGrid(): void {
        for (let row = 0; row < GAME_CONFIG.GRID_SIZE; row++) {
            this.grid[row] = [];
            for (let col = 0; col < GAME_CONFIG.GRID_SIZE; col++) {
                this.grid[row][col] = this.createTile(row, col);
            }
        }
    }

    private createTile(row: number, col: number, animate: boolean = false): Tile {
        const colorIndex = Phaser.Math.Between(0, TILE_COLOR_ARRAY.length - 1);
        const x = this.gridStartX + col * (this.tileSize + this.gap);
        const y = this.gridStartY + row * (this.tileSize + this.gap);

        const sprite = this.add.graphics();
        sprite.fillStyle(TILE_COLOR_ARRAY[colorIndex], 1);
        sprite.fillRoundedRect(0, 0, this.tileSize, this.tileSize, 8);
        sprite.x = x;
        sprite.y = animate ? -this.tileSize : y;
        sprite.setInteractive(
            new Phaser.Geom.Rectangle(0, 0, this.tileSize, this.tileSize),
            Phaser.Geom.Rectangle.Contains
        );

        // Click handler
        sprite.on('pointerdown', () => this.onTileClick(row, col));

        // Animate tile falling
        if (animate) {
            this.tweens.add({
                targets: sprite,
                y: y,
                duration: 300,
                ease: 'Bounce.easeOut',
            });
        }

        return { sprite, colorIndex, row, col };
    }

    private onTileClick(row: number, col: number): void {
        if (this.isProcessing) return;

        const tile = this.grid[row][col];
        if (!tile) return;

        if (!this.selectedTile) {
            // First selection
            this.selectedTile = tile;
            this.highlightTile(tile, true);
        } else {
            // Second selection - check if adjacent
            const isAdjacent = this.isAdjacent(this.selectedTile, tile);

            if (isAdjacent) {
                this.swapTiles(this.selectedTile, tile);
            } else {
                // Select new tile
                this.highlightTile(this.selectedTile, false);
                this.selectedTile = tile;
                this.highlightTile(tile, true);
            }
        }
    }

    private highlightTile(tile: Tile, highlight: boolean): void {
        if (highlight) {
            this.tweens.add({
                targets: tile.sprite,
                scale: 1.1,
                duration: 100,
                ease: 'Back.easeOut',
            });
        } else {
            this.tweens.add({
                targets: tile.sprite,
                scale: 1,
                duration: 100,
                ease: 'Back.easeIn',
            });
        }
    }

    private isAdjacent(tile1: Tile, tile2: Tile): boolean {
        const rowDiff = Math.abs(tile1.row - tile2.row);
        const colDiff = Math.abs(tile1.col - tile2.col);
        return (rowDiff === 1 && colDiff === 0) || (rowDiff === 0 && colDiff === 1);
    }

    private swapTiles(tile1: Tile, tile2: Tile): void {
        this.isProcessing = true;
        this.highlightTile(tile1, false);
        this.selectedTile = null;

        // Swap positions in grid
        const tempRow = tile1.row;
        const tempCol = tile1.col;
        tile1.row = tile2.row;
        tile1.col = tile2.col;
        tile2.row = tempRow;
        tile2.col = tempCol;

        this.grid[tile1.row][tile1.col] = tile1;
        this.grid[tile2.row][tile2.col] = tile2;

        // Animate swap
        const x1 = this.gridStartX + tile1.col * (this.tileSize + this.gap);
        const y1 = this.gridStartY + tile1.row * (this.tileSize + this.gap);
        const x2 = this.gridStartX + tile2.col * (this.tileSize + this.gap);
        const y2 = this.gridStartY + tile2.row * (this.tileSize + this.gap);

        this.tweens.add({
            targets: tile1.sprite,
            x: x1,
            y: y1,
            duration: 150,
            ease: 'Quad.easeInOut',
        });

        this.tweens.add({
            targets: tile2.sprite,
            x: x2,
            y: y2,
            duration: 150,
            ease: 'Quad.easeInOut',
            onComplete: () => {
                // Check for matches
                const matches = this.findMatches();
                if (matches.length > 0) {
                    this.combo = 1;
                    this.processMatches(matches);
                } else {
                    // Swap back
                    this.swapBack(tile1, tile2);
                }
            },
        });
    }

    private swapBack(tile1: Tile, tile2: Tile): void {
        // Swap positions back
        const tempRow = tile1.row;
        const tempCol = tile1.col;
        tile1.row = tile2.row;
        tile1.col = tile2.col;
        tile2.row = tempRow;
        tile2.col = tempCol;

        this.grid[tile1.row][tile1.col] = tile1;
        this.grid[tile2.row][tile2.col] = tile2;

        const x1 = this.gridStartX + tile1.col * (this.tileSize + this.gap);
        const y1 = this.gridStartY + tile1.row * (this.tileSize + this.gap);
        const x2 = this.gridStartX + tile2.col * (this.tileSize + this.gap);
        const y2 = this.gridStartY + tile2.row * (this.tileSize + this.gap);

        this.tweens.add({
            targets: tile1.sprite,
            x: x1,
            y: y1,
            duration: 150,
            ease: 'Quad.easeInOut',
        });

        this.tweens.add({
            targets: tile2.sprite,
            x: x2,
            y: y2,
            duration: 150,
            ease: 'Quad.easeInOut',
            onComplete: () => {
                this.isProcessing = false;
            },
        });
    }

    private findMatches(): Tile[][] {
        const matches: Tile[][] = [];
        const visited = new Set<string>();

        // Check horizontal matches
        for (let row = 0; row < GAME_CONFIG.GRID_SIZE; row++) {
            for (let col = 0; col < GAME_CONFIG.GRID_SIZE - 2; col++) {
                const match = this.checkMatch(row, col, 0, 1);
                if (match.length >= GAME_CONFIG.MATCH_MIN) {
                    const key = match.map(t => `${t.row},${t.col}`).join('|');
                    if (!visited.has(key)) {
                        matches.push(match);
                        visited.add(key);
                    }
                }
            }
        }

        // Check vertical matches
        for (let row = 0; row < GAME_CONFIG.GRID_SIZE - 2; row++) {
            for (let col = 0; col < GAME_CONFIG.GRID_SIZE; col++) {
                const match = this.checkMatch(row, col, 1, 0);
                if (match.length >= GAME_CONFIG.MATCH_MIN) {
                    const key = match.map(t => `${t.row},${t.col}`).join('|');
                    if (!visited.has(key)) {
                        matches.push(match);
                        visited.add(key);
                    }
                }
            }
        }

        return matches;
    }

    private checkMatch(startRow: number, startCol: number, dRow: number, dCol: number): Tile[] {
        const tiles: Tile[] = [];
        const firstTile = this.grid[startRow][startCol];
        if (!firstTile) return [];

        let row = startRow;
        let col = startCol;

        while (
            row >= 0 && row < GAME_CONFIG.GRID_SIZE &&
            col >= 0 && col < GAME_CONFIG.GRID_SIZE
        ) {
            const tile = this.grid[row][col];
            if (tile && tile.colorIndex === firstTile.colorIndex) {
                tiles.push(tile);
                row += dRow;
                col += dCol;
            } else {
                break;
            }
        }

        return tiles;
    }

    private processMatches(matches: Tile[][]): void {
        // Calculate score
        let matchScore = 0;
        const tilesToRemove = new Set<Tile>();

        matches.forEach(match => {
            match.forEach(tile => tilesToRemove.add(tile));
            matchScore += match.length * GAME_CONFIG.BASE_SCORE;
        });

        // Apply combo multiplier
        matchScore = Math.floor(matchScore * Math.pow(GAME_CONFIG.COMBO_MULTIPLIER, this.combo - 1));
        this.score += matchScore;
        this.scoreText.setText(this.score.toString());

        // Show combo
        if (this.combo > 1) {
            this.comboText.setText(`${this.combo}x COMBO!`);
            this.comboText.setAlpha(1);
            this.tweens.add({
                targets: this.comboText,
                scale: { from: 0.5, to: 1.2 },
                alpha: { from: 1, to: 0 },
                duration: 800,
                ease: 'Back.easeOut',
                onComplete: () => {
                    this.comboText.setScale(1);
                },
            });
        }

        // Remove matched tiles with animation
        tilesToRemove.forEach(tile => {
            this.tweens.add({
                targets: tile.sprite,
                scale: 0,
                alpha: 0,
                duration: 200,
                ease: 'Back.easeIn',
                onComplete: () => {
                    tile.sprite.destroy();
                },
            });

            this.grid[tile.row][tile.col] = null;
        });

        // Wait for animations, then drop tiles
        this.time.delayedCall(250, () => {
            this.dropTiles();
        });
    }

    private dropTiles(): void {
        let dropped = false;

        for (let col = 0; col < GAME_CONFIG.GRID_SIZE; col++) {
            let emptyRow = GAME_CONFIG.GRID_SIZE - 1;

            for (let row = GAME_CONFIG.GRID_SIZE - 1; row >= 0; row--) {
                const tile = this.grid[row][col];
                if (tile) {
                    if (row !== emptyRow) {
                        // Move tile down
                        tile.row = emptyRow;
                        this.grid[emptyRow][col] = tile;
                        this.grid[row][col] = null;

                        const newY = this.gridStartY + emptyRow * (this.tileSize + this.gap);
                        this.tweens.add({
                            targets: tile.sprite,
                            y: newY,
                            duration: 200,
                            ease: 'Bounce.easeOut',
                        });

                        dropped = true;
                    }
                    emptyRow--;
                }
            }

            // Fill empty spaces with new tiles
            for (let row = emptyRow; row >= 0; row--) {
                this.grid[row][col] = this.createTile(row, col, true);
                dropped = true;
            }
        }

        // Check for new matches
        this.time.delayedCall(350, () => {
            const newMatches = this.findMatches();
            if (newMatches.length > 0) {
                this.combo++;
                this.processMatches(newMatches);
            } else {
                this.combo = 0;
                this.isProcessing = false;
            }
        });
    }

    private removeInitialMatches(): void {
        let hasMatches = true;
        let iterations = 0;
        const maxIterations = 100;

        while (hasMatches && iterations < maxIterations) {
            const matches = this.findMatches();
            if (matches.length === 0) {
                hasMatches = false;
            } else {
                // Replace matched tiles with new colors
                matches.forEach(match => {
                    match.forEach(tile => {
                        const newColorIndex = Phaser.Math.Between(0, TILE_COLOR_ARRAY.length - 1);
                        tile.colorIndex = newColorIndex;
                        tile.sprite.clear();
                        tile.sprite.fillStyle(TILE_COLOR_ARRAY[newColorIndex], 1);
                        tile.sprite.fillRoundedRect(0, 0, this.tileSize, this.tileSize, 8);
                    });
                });
            }
            iterations++;
        }
    }

    private updateTimer(): void {
        this.timeLeft--;
        this.timeText.setText(this.timeLeft.toString());

        // Warning colors
        if (this.timeLeft <= 10) {
            this.timeText.setColor('#ff6b6b');
            if (this.timeLeft <= 5) {
                this.tweens.add({
                    targets: this.timeText,
                    scale: { from: 1, to: 1.3 },
                    duration: 200,
                    yoyo: true,
                });
            }
        } else if (this.timeLeft <= 20) {
            this.timeText.setColor('#ff922b');
        }

        // Game over
        if (this.timeLeft <= 0) {
            this.timerEvent.destroy();
            this.endGame();
        }
    }

    private endGame(): void {
        this.isProcessing = true;
        this.scene.start('GameOverScene', { score: this.score });
    }
}
