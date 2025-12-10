import Phaser from 'phaser';
import { getUser } from '$lib/api/auth';

/**
 * Game over scene - shows final score and options
 */
export class GameOverScene extends Phaser.Scene {
    private finalScore: number = 0;

    constructor() {
        super({ key: 'GameOverScene' });
    }

    init(data: { score: number }): void {
        this.finalScore = data.score || 0;
    }

    create(): void {
        const width = this.cameras.main.width;
        const height = this.cameras.main.height;
        const user = getUser();

        // Animated particles background
        this.createParticles();

        // Game Over title
        const titleY = height * 0.15;
        const title = this.add.text(width / 2, titleY, 'GAME OVER', {
            fontFamily: 'Outfit',
            fontSize: '40px',
            fontStyle: 'bold',
            color: '#ffffff',
        });
        title.setOrigin(0.5, 0.5);

        // Score card
        const cardY = height * 0.4;
        const card = this.add.graphics();
        card.fillStyle(0x1a1a2e, 0.9);
        card.fillRoundedRect(width / 2 - 120, cardY - 60, 240, 120, 20);
        card.lineStyle(2, 0x667eea, 1);
        card.strokeRoundedRect(width / 2 - 120, cardY - 60, 240, 120, 20);

        this.add.text(width / 2, cardY - 25, 'YOUR SCORE', {
            fontFamily: 'Outfit',
            fontSize: '14px',
            color: 'rgba(255, 255, 255, 0.6)',
        }).setOrigin(0.5, 0.5);

        const scoreText = this.add.text(width / 2, cardY + 15, this.finalScore.toString(), {
            fontFamily: 'Outfit',
            fontSize: '48px',
            fontStyle: 'bold',
            color: '#fcc419',
        });
        scoreText.setOrigin(0.5, 0.5);

        // Animate score counting up
        this.tweens.addCounter({
            from: 0,
            to: this.finalScore,
            duration: 1500,
            ease: 'Cubic.easeOut',
            onUpdate: (tween) => {
                scoreText.setText(Math.floor(tween.getValue()).toString());
            },
        });

        // Show user greeting if logged in
        if (user) {
            this.add.text(width / 2, height * 0.55, `Great game, ${user.name}!`, {
                fontFamily: 'Outfit',
                fontSize: '16px',
                color: '#f093fb',
            }).setOrigin(0.5, 0.5);
        }

        // High score badge for good scores
        if (this.finalScore >= 500) {
            const badgeY = height * 0.62;
            const badge = this.add.graphics();
            badge.fillStyle(0xf093fb, 0.3);
            badge.fillRoundedRect(width / 2 - 80, badgeY - 15, 160, 30, 15);

            this.add.text(width / 2, badgeY, '🏆 AMAZING SCORE!', {
                fontFamily: 'Outfit',
                fontSize: '14px',
                fontStyle: 'bold',
                color: '#f093fb',
            }).setOrigin(0.5, 0.5);
        }

        // Buttons
        const btnY = height * 0.75;

        // Play Again button
        const playAgainBtn = this.createButton(width / 2, btnY, 'PLAY AGAIN', 0x667eea);
        playAgainBtn.on('pointerdown', () => {
            this.scene.start('GameScene');
        });

        // Menu button
        const menuBtn = this.createButton(width / 2, btnY + 60, 'MAIN MENU', 0x764ba2);
        menuBtn.on('pointerdown', () => {
            this.scene.start('MenuScene');
        });

        // Fade in title animation
        title.setAlpha(0);
        this.tweens.add({
            targets: title,
            alpha: 1,
            y: titleY,
            duration: 500,
            ease: 'Back.easeOut',
        });
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

        for (let i = 0; i < 20; i++) {
            const particle = this.add.graphics();
            const color = colors[Math.floor(Math.random() * colors.length)];
            const size = Phaser.Math.Between(3, 10);

            particle.fillStyle(color, 0.4);
            particle.fillCircle(0, 0, size);
            particle.x = Phaser.Math.Between(0, width);
            particle.y = Phaser.Math.Between(0, height);

            this.tweens.add({
                targets: particle,
                y: -50,
                x: particle.x + Phaser.Math.Between(-50, 50),
                alpha: 0,
                duration: Phaser.Math.Between(3000, 6000),
                repeat: -1,
                onRepeat: () => {
                    particle.x = Phaser.Math.Between(0, width);
                    particle.y = height + 50;
                    particle.alpha = 0.4;
                },
            });
        }
    }
}
