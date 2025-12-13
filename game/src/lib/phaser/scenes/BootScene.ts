/**
 * Boot Scene - Loads assets and initializes game
 */

import Phaser from 'phaser';

export class BootScene extends Phaser.Scene {
    constructor() {
        super({ key: 'BootScene' });
    }

    preload() {
        // Create loading bar
        const width = this.cameras.main.width;
        const height = this.cameras.main.height;

        const progressBar = this.add.graphics();
        const progressBox = this.add.graphics();
        progressBox.fillStyle(0x334155, 0.8);
        progressBox.fillRect(width / 2 - 160, height / 2 - 25, 320, 50);

        const loadingText = this.add.text(width / 2, height / 2 - 50, 'Loading...', {
            font: '20px Outfit',
            color: '#f8fafc',
        }).setOrigin(0.5);

        const percentText = this.add.text(width / 2, height / 2, '0%', {
            font: '18px Outfit',
            color: '#fbbf24',
        }).setOrigin(0.5);

        // Update progress
        this.load.on('progress', (value: number) => {
            progressBar.clear();
            progressBar.fillStyle(0xfbbf24, 1);
            progressBar.fillRect(width / 2 - 150, height / 2 - 15, 300 * value, 30);
            percentText.setText(Math.floor(value * 100) + '%');
        });

        this.load.on('complete', () => {
            progressBar.destroy();
            progressBox.destroy();
            loadingText.destroy();
            percentText.destroy();
        });

        // Generate placeholder sprites programmatically
        this.createPlaceholderSprites();
    }

    createPlaceholderSprites() {
        // Create plot sprite (brown square)
        const plotGraphics = this.make.graphics({ x: 0, y: 0 });
        plotGraphics.fillStyle(0x8b4513, 1);
        plotGraphics.fillRoundedRect(0, 0, 64, 64, 8);
        plotGraphics.lineStyle(2, 0x654321);
        plotGraphics.strokeRoundedRect(0, 0, 64, 64, 8);
        plotGraphics.generateTexture('plot', 64, 64);
        plotGraphics.destroy();

        // Create plot hover sprite
        const plotHoverGraphics = this.make.graphics({ x: 0, y: 0 });
        plotHoverGraphics.fillStyle(0xa0522d, 1);
        plotHoverGraphics.fillRoundedRect(0, 0, 64, 64, 8);
        plotHoverGraphics.lineStyle(3, 0xfbbf24);
        plotHoverGraphics.strokeRoundedRect(0, 0, 64, 64, 8);
        plotHoverGraphics.generateTexture('plot_hover', 64, 64);
        plotHoverGraphics.destroy();

        // Create plot ready sprite (glowing)
        const plotReadyGraphics = this.make.graphics({ x: 0, y: 0 });
        plotReadyGraphics.fillStyle(0x228b22, 1);
        plotReadyGraphics.fillRoundedRect(0, 0, 64, 64, 8);
        plotReadyGraphics.lineStyle(3, 0x84cc16);
        plotReadyGraphics.strokeRoundedRect(0, 0, 64, 64, 8);
        plotReadyGraphics.generateTexture('plot_ready', 64, 64);
        plotReadyGraphics.destroy();

        // Create watered indicator
        const wateredGraphics = this.make.graphics({ x: 0, y: 0 });
        wateredGraphics.fillStyle(0x38bdf8, 0.5);
        wateredGraphics.fillCircle(8, 8, 8);
        wateredGraphics.generateTexture('watered', 16, 16);
        wateredGraphics.destroy();

        // Create crop sprites for each tier
        const cropColors = [
            0x9ca3af, // Tier 1 - Gray
            0x22c55e, // Tier 2 - Green
            0x3b82f6, // Tier 3 - Blue
            0xa855f7, // Tier 4 - Purple
            0xf59e0b, // Tier 5 - Orange/Gold
        ];

        // Sprout (early growth)
        const sproutGraphics = this.make.graphics({ x: 0, y: 0 });
        sproutGraphics.fillStyle(0x22c55e, 1);
        sproutGraphics.fillTriangle(16, 32, 20, 16, 24, 32);
        sproutGraphics.fillRect(18, 32, 4, 8);
        sproutGraphics.generateTexture('sprout', 40, 40);
        sproutGraphics.destroy();

        // Growing plant (mid growth)
        const growingGraphics = this.make.graphics({ x: 0, y: 0 });
        growingGraphics.fillStyle(0x4ade80, 1);
        growingGraphics.fillCircle(20, 16, 12);
        growingGraphics.fillStyle(0x22c55e, 1);
        growingGraphics.fillTriangle(14, 20, 20, 8, 26, 20);
        growingGraphics.fillRect(18, 28, 4, 10);
        growingGraphics.generateTexture('growing', 40, 40);
        growingGraphics.destroy();

        // Create crop sprites for each tier
        cropColors.forEach((color, tier) => {
            const cropGraphics = this.make.graphics({ x: 0, y: 0 });
            cropGraphics.fillStyle(color, 1);
            cropGraphics.fillCircle(20, 16, 14);
            cropGraphics.fillStyle(0x166534, 1);
            cropGraphics.fillRect(18, 28, 4, 12);
            cropGraphics.generateTexture(`crop_tier${tier + 1}`, 40, 40);
            cropGraphics.destroy();
        });

        // Gold coin
        const goldGraphics = this.make.graphics({ x: 0, y: 0 });
        goldGraphics.fillStyle(0xfbbf24, 1);
        goldGraphics.fillCircle(12, 12, 12);
        goldGraphics.fillStyle(0xd97706, 1);
        goldGraphics.fillCircle(12, 12, 8);
        goldGraphics.generateTexture('gold', 24, 24);
        goldGraphics.destroy();

        // Gem
        const gemGraphics = this.make.graphics({ x: 0, y: 0 });
        gemGraphics.fillStyle(0xa855f7, 1);
        gemGraphics.fillTriangle(12, 0, 0, 12, 24, 12);
        gemGraphics.fillTriangle(0, 12, 12, 24, 24, 12);
        gemGraphics.generateTexture('gem', 24, 24);
        gemGraphics.destroy();
    }

    create() {
        // Start the main scene
        this.scene.start('MainScene');
        this.scene.start('UIScene');
    }
}
