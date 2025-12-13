/**
 * Main Scene - Farm Grid and Gameplay
 */

import Phaser from 'phaser';
import type { FarmPlot, Crop } from '../../api';

interface PlotSprite extends Phaser.GameObjects.Container {
    plotData?: FarmPlot;
    plotBg: Phaser.GameObjects.Image;
    cropSprite?: Phaser.GameObjects.Image;
    wateredIcon?: Phaser.GameObjects.Image;
    progressBar?: Phaser.GameObjects.Graphics;
}

export class MainScene extends Phaser.Scene {
    private plots: PlotSprite[] = [];
    private gridSize = 3;
    private plotSize = 64;
    private plotSpacing = 8;
    private farmData: FarmPlot[] = [];
    private crops: Map<string, Crop> = new Map();

    // Callbacks for Svelte integration
    public onPlotClick?: (plotIndex: number, plotData?: FarmPlot) => void;

    constructor() {
        super({ key: 'MainScene' });
    }

    create() {
        // Farm background
        this.add.rectangle(400, 300, 800, 600, 0x1e293b);

        // Title
        this.add.text(400, 40, '🌾 Harvest Haven 🌾', {
            font: 'bold 28px Outfit',
            color: '#fbbf24',
        }).setOrigin(0.5);

        // Create initial grid
        this.createFarmGrid();

        // Instructions
        this.add.text(400, 560, 'Click a plot to plant, water, or harvest!', {
            font: '16px Outfit',
            color: '#94a3b8',
        }).setOrigin(0.5);
    }

    createFarmGrid() {
        // Clear existing plots
        this.plots.forEach(p => p.destroy());
        this.plots = [];

        const totalWidth = this.gridSize * (this.plotSize + this.plotSpacing) - this.plotSpacing;
        const totalHeight = this.gridSize * (this.plotSize + this.plotSpacing) - this.plotSpacing;
        const startX = 400 - totalWidth / 2 + this.plotSize / 2;
        const startY = 300 - totalHeight / 2 + this.plotSize / 2;

        for (let i = 0; i < this.gridSize * this.gridSize; i++) {
            const row = Math.floor(i / this.gridSize);
            const col = i % this.gridSize;
            const x = startX + col * (this.plotSize + this.plotSpacing);
            const y = startY + row * (this.plotSize + this.plotSpacing);

            const container = this.add.container(x, y) as PlotSprite;

            // Plot background
            const plotBg = this.add.image(0, 0, 'plot');
            plotBg.setDisplaySize(this.plotSize, this.plotSize);
            container.add(plotBg);
            container.plotBg = plotBg;

            // Progress bar (hidden initially)
            const progressBar = this.add.graphics();
            container.add(progressBar);
            container.progressBar = progressBar;

            // Make interactive
            container.setSize(this.plotSize, this.plotSize);
            container.setInteractive({ useHandCursor: true });

            // Hover effects
            container.on('pointerover', () => {
                plotBg.setTexture('plot_hover');
                container.setScale(1.05);
            });

            container.on('pointerout', () => {
                const data = container.plotData;
                if (data?.ready) {
                    plotBg.setTexture('plot_ready');
                } else {
                    plotBg.setTexture('plot');
                }
                container.setScale(1);
            });

            // Click handler
            container.on('pointerdown', () => {
                this.handlePlotClick(i, container);
            });

            this.plots.push(container);
        }
    }

    handlePlotClick(plotIndex: number, container: PlotSprite) {
        // Emit to Svelte
        if (this.onPlotClick) {
            this.onPlotClick(plotIndex, container.plotData);
        }

        // Visual feedback
        this.tweens.add({
            targets: container,
            scale: 0.9,
            duration: 50,
            yoyo: true,
        });
    }

    // Update farm data from API
    updateFarmData(plots: FarmPlot[], allCrops: Crop[] = []) {
        this.farmData = plots;

        // Update crops map
        allCrops.forEach(c => this.crops.set(c.id, c));

        // Resize grid if needed
        const totalPlots = plots.length;
        const newGridSize = Math.ceil(Math.sqrt(totalPlots));

        if (newGridSize !== this.gridSize) {
            this.gridSize = newGridSize;
            this.createFarmGrid();
        }

        // Update each plot
        plots.forEach((plotData, index) => {
            if (index < this.plots.length) {
                this.updatePlot(this.plots[index], plotData);
            }
        });
    }

    updatePlot(container: PlotSprite, plotData: FarmPlot) {
        container.plotData = plotData;

        // Update background based on state
        if (plotData.ready) {
            container.plotBg.setTexture('plot_ready');
        } else {
            container.plotBg.setTexture('plot');
        }

        // Remove old crop sprite
        if (container.cropSprite) {
            container.cropSprite.destroy();
            container.cropSprite = undefined;
        }

        // Add crop sprite if planted
        if (plotData.crop_id) {
            const crop = plotData.crop || this.crops.get(plotData.crop_id);
            let textureKey = 'sprout';

            if (plotData.ready) {
                textureKey = `crop_tier${crop?.tier || 1}`;
            } else if ((plotData.growth_percent || 0) > 50) {
                textureKey = 'growing';
            }

            const cropSprite = this.add.image(0, -8, textureKey);
            cropSprite.setDisplaySize(40, 40);
            container.add(cropSprite);
            container.cropSprite = cropSprite;

            // Bounce animation when ready
            if (plotData.ready) {
                this.tweens.add({
                    targets: cropSprite,
                    y: -12,
                    duration: 500,
                    yoyo: true,
                    repeat: -1,
                    ease: 'Sine.easeInOut',
                });
            }
        }

        // Update watered indicator
        if (container.wateredIcon) {
            container.wateredIcon.destroy();
            container.wateredIcon = undefined;
        }

        if (plotData.watered && plotData.crop_id && !plotData.ready) {
            const wateredIcon = this.add.image(24, -24, 'watered');
            container.add(wateredIcon);
            container.wateredIcon = wateredIcon;
        }

        // Update progress bar
        if (container.progressBar) {
            container.progressBar.clear();

            if (plotData.crop_id && !plotData.ready) {
                const progress = (plotData.growth_percent || 0) / 100;
                const barWidth = this.plotSize - 8;
                const barHeight = 6;
                const x = -barWidth / 2;
                const y = 24;

                // Background
                container.progressBar.fillStyle(0x334155, 0.8);
                container.progressBar.fillRoundedRect(x, y, barWidth, barHeight, 3);

                // Progress
                container.progressBar.fillStyle(0x84cc16, 1);
                container.progressBar.fillRoundedRect(x, y, barWidth * progress, barHeight, 3);
            }
        }
    }

    // Show harvest effect
    showHarvestEffect(plotIndex: number, goldAmount: number) {
        if (plotIndex >= this.plots.length) return;

        const container = this.plots[plotIndex];
        const x = container.x;
        const y = container.y;

        // Gold flying up animation
        const goldText = this.add.text(x, y - 20, `+${goldAmount} 🪙`, {
            font: 'bold 18px Outfit',
            color: '#fbbf24',
        }).setOrigin(0.5);

        this.tweens.add({
            targets: goldText,
            y: y - 80,
            alpha: 0,
            duration: 1500,
            ease: 'Power2',
            onComplete: () => goldText.destroy(),
        });

        // Particles effect (sparkles)
        const particles = this.add.particles(x, y, 'gold', {
            speed: { min: 50, max: 150 },
            angle: { min: 0, max: 360 },
            scale: { start: 0.5, end: 0 },
            lifespan: 800,
            quantity: 10,
            blendMode: 'ADD',
        });

        this.time.delayedCall(1000, () => particles.destroy());
    }

    // Show level up effect
    showLevelUpEffect(newLevel: number) {
        const levelText = this.add.text(400, 300, `🎉 Level ${newLevel}! 🎉`, {
            font: 'bold 36px Outfit',
            color: '#fbbf24',
            stroke: '#000',
            strokeThickness: 4,
        }).setOrigin(0.5).setAlpha(0).setScale(0.5);

        this.tweens.add({
            targets: levelText,
            scale: 1.2,
            alpha: 1,
            duration: 500,
            ease: 'Back.easeOut',
            onComplete: () => {
                this.tweens.add({
                    targets: levelText,
                    alpha: 0,
                    y: 250,
                    delay: 1500,
                    duration: 500,
                    onComplete: () => levelText.destroy(),
                });
            },
        });
    }

    // Show plant effect
    showPlantEffect(plotIndex: number) {
        if (plotIndex >= this.plots.length) return;

        const container = this.plots[plotIndex];

        // Scale pop effect
        this.tweens.add({
            targets: container,
            scale: 1.2,
            duration: 100,
            yoyo: true,
        });
    }
}
