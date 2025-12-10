import Phaser from 'phaser';

/**
 * Menu scene - main menu with start game button
 */
export class MenuScene extends Phaser.Scene {
    private particles!: Phaser.GameObjects.Graphics[];

    constructor() {
        super({ key: 'MenuScene' });
        this.particles = [];
    }

    create(): void {
        const width = this.cameras.main.width;
        const height = this.cameras.main.height;

        // Animated background particles
        this.createParticles();

        // Title with gradient effect
        const titleY = height * 0.2;

        const title = this.add.text(width / 2, titleY, 'COLOR MATCH', {
            fontFamily: 'Outfit',
            fontSize: '42px',
            fontStyle: 'bold',
            color: '#ffffff',
        });
        title.setOrigin(0.5, 0.5);

        const subtitle = this.add.text(width / 2, titleY + 50, 'FRENZY', {
            fontFamily: 'Outfit',
            fontSize: '36px',
            fontStyle: 'bold',
            color: '#f093fb',
        });
        subtitle.setOrigin(0.5, 0.5);

        // Pulsing animation for title
        this.tweens.add({
            targets: [title, subtitle],
            scale: { from: 1, to: 1.05 },
            duration: 1500,
            yoyo: true,
            repeat: -1,
            ease: 'Sine.easeInOut',
        });

        // Start button
        const startBtn = this.createButton(width / 2, height * 0.5, 'START GAME', 0x667eea);
        startBtn.on('pointerdown', () => {
            this.scene.start('GameScene');
        });

        // How to play button
        const helpBtn = this.createButton(width / 2, height * 0.65, 'HOW TO PLAY', 0x764ba2);
        helpBtn.on('pointerdown', () => {
            this.showHowToPlay();
        });

        // Instructions text
        const instructionText = this.add.text(width / 2, height * 0.85, 'Match 3 or more tiles to score!', {
            fontFamily: 'Outfit',
            fontSize: '16px',
            color: 'rgba(255, 255, 255, 0.6)',
        });
        instructionText.setOrigin(0.5, 0.5);

        // Floating tile preview
        this.createFloatingTiles();
    }

    private createButton(x: number, y: number, text: string, color: number): Phaser.GameObjects.Container {
        const container = this.add.container(x, y);

        const bg = this.add.graphics();
        bg.fillStyle(color, 1);
        bg.fillRoundedRect(-100, -25, 200, 50, 25);

        const label = this.add.text(0, 0, text, {
            fontFamily: 'Outfit',
            fontSize: '18px',
            fontStyle: 'bold',
            color: '#ffffff',
        });
        label.setOrigin(0.5, 0.5);

        container.add([bg, label]);
        container.setSize(200, 50);
        container.setInteractive({ useHandCursor: true });

        // Hover effect
        container.on('pointerover', () => {
            this.tweens.add({
                targets: container,
                scale: 1.1,
                duration: 150,
                ease: 'Back.easeOut',
            });
        });

        container.on('pointerout', () => {
            this.tweens.add({
                targets: container,
                scale: 1,
                duration: 150,
                ease: 'Back.easeIn',
            });
        });

        return container;
    }

    private createParticles(): void {
        const width = this.cameras.main.width;
        const height = this.cameras.main.height;
        const colors = [0xff6b6b, 0x51cf66, 0x339af0, 0xfcc419, 0xbe4bdb, 0xff922b];

        for (let i = 0; i < 15; i++) {
            const particle = this.add.graphics();
            const color = colors[Math.floor(Math.random() * colors.length)];
            const size = Phaser.Math.Between(5, 15);

            particle.fillStyle(color, 0.3);
            particle.fillCircle(0, 0, size);
            particle.x = Phaser.Math.Between(0, width);
            particle.y = Phaser.Math.Between(0, height);

            this.particles.push(particle);

            // Animate particles floating up
            this.tweens.add({
                targets: particle,
                y: -50,
                x: particle.x + Phaser.Math.Between(-100, 100),
                duration: Phaser.Math.Between(5000, 10000),
                repeat: -1,
                onRepeat: () => {
                    particle.x = Phaser.Math.Between(0, width);
                    particle.y = height + 50;
                },
            });
        }
    }

    private createFloatingTiles(): void {
        const width = this.cameras.main.width;
        const colors = [0xff6b6b, 0x51cf66, 0x339af0, 0xfcc419, 0xbe4bdb, 0xff922b];
        const tileSize = 40;
        const startX = (width - (colors.length * (tileSize + 10))) / 2;

        colors.forEach((color, i) => {
            const tile = this.add.graphics();
            tile.fillStyle(color, 1);
            tile.fillRoundedRect(-tileSize / 2, -tileSize / 2, tileSize, tileSize, 8);
            tile.x = startX + i * (tileSize + 10) + tileSize / 2;
            tile.y = this.cameras.main.height * 0.35;

            // Floating animation with delay
            this.tweens.add({
                targets: tile,
                y: tile.y - 10,
                duration: 1000,
                yoyo: true,
                repeat: -1,
                ease: 'Sine.easeInOut',
                delay: i * 100,
            });
        });
    }

    private showHowToPlay(): void {
        const width = this.cameras.main.width;
        const height = this.cameras.main.height;

        // Overlay
        const overlay = this.add.graphics();
        overlay.fillStyle(0x000000, 0.8);
        overlay.fillRect(0, 0, width, height);

        // Modal
        const modal = this.add.graphics();
        modal.fillStyle(0x1a1a2e, 1);
        modal.fillRoundedRect(20, height * 0.15, width - 40, height * 0.7, 20);
        modal.lineStyle(2, 0x667eea, 1);
        modal.strokeRoundedRect(20, height * 0.15, width - 40, height * 0.7, 20);

        const titleText = this.add.text(width / 2, height * 0.22, 'HOW TO PLAY', {
            fontFamily: 'Outfit',
            fontSize: '24px',
            fontStyle: 'bold',
            color: '#ffffff',
        });
        titleText.setOrigin(0.5, 0.5);

        const instructions = [
            '🎮 Swap adjacent tiles to match',
            '💎 Match 3+ same colors to score',
            '⚡ Chain combos for bonus points',
            '⏱️ Beat the clock - 60 seconds!',
            '🏆 Aim for the highest score!',
        ];

        instructions.forEach((text, i) => {
            const instrText = this.add.text(width / 2, height * 0.35 + i * 40, text, {
                fontFamily: 'Outfit',
                fontSize: '16px',
                color: '#ffffff',
            });
            instrText.setOrigin(0.5, 0.5);
        });

        // Close button
        const closeBtn = this.add.text(width / 2, height * 0.75, '✕ CLOSE', {
            fontFamily: 'Outfit',
            fontSize: '18px',
            fontStyle: 'bold',
            color: '#f093fb',
        });
        closeBtn.setOrigin(0.5, 0.5);
        closeBtn.setInteractive({ useHandCursor: true });

        closeBtn.on('pointerdown', () => {
            overlay.destroy();
            modal.destroy();
            titleText.destroy();
            closeBtn.destroy();
            this.children.each((child) => {
                if (child instanceof Phaser.GameObjects.Text && instructions.some(i => i === child.text)) {
                    child.destroy();
                }
            });
        });
    }
}
