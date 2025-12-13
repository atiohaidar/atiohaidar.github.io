/**
 * UI Scene - HUD Overlay
 */

import Phaser from 'phaser';
import type { GameProfile } from '../../api';

export class UIScene extends Phaser.Scene {
    private goldText?: Phaser.GameObjects.Text;
    private gemsText?: Phaser.GameObjects.Text;
    private levelText?: Phaser.GameObjects.Text;
    private xpBar?: Phaser.GameObjects.Graphics;
    private xpBarBg?: Phaser.GameObjects.Graphics;

    private currentGold = 0;
    private currentGems = 0;
    private currentLevel = 1;
    private currentXpPercent = 0;

    constructor() {
        super({ key: 'UIScene' });
    }

    create() {
        // Top bar background
        this.add.rectangle(400, 30, 800, 60, 0x0f172a, 0.9);

        // Gold display
        this.add.image(50, 30, 'gold').setDisplaySize(24, 24);
        this.goldText = this.add.text(70, 22, '0', {
            font: 'bold 18px Outfit',
            color: '#fbbf24',
        });

        // Gems display
        this.add.image(180, 30, 'gem').setDisplaySize(24, 24);
        this.gemsText = this.add.text(200, 22, '0', {
            font: 'bold 18px Outfit',
            color: '#a855f7',
        });

        // Level display
        this.levelText = this.add.text(700, 15, 'Lvl 1', {
            font: 'bold 20px Outfit',
            color: '#f8fafc',
        }).setOrigin(0.5, 0);

        // XP Bar background
        this.xpBarBg = this.add.graphics();
        this.xpBarBg.fillStyle(0x334155, 1);
        this.xpBarBg.fillRoundedRect(600, 38, 160, 12, 6);

        // XP Bar fill
        this.xpBar = this.add.graphics();
        this.updateXpBar(0);

        // Instructions text at bottom
        this.add.text(400, 580, 'Press H for Harvest All • S for Shop • I for Inventory', {
            font: '14px Outfit',
            color: '#64748b',
        }).setOrigin(0.5);
    }

    updateProfile(profile: GameProfile | null, xpPercent: number = 0) {
        if (!profile) return;

        // Animate gold change
        if (profile.gold !== this.currentGold) {
            this.animateNumber(this.goldText!, this.currentGold, profile.gold);
            this.currentGold = profile.gold;
        }

        // Animate gems change
        if (profile.gems !== this.currentGems) {
            this.animateNumber(this.gemsText!, this.currentGems, profile.gems);
            this.currentGems = profile.gems;
        }

        // Update level
        if (profile.level !== this.currentLevel) {
            this.currentLevel = profile.level;
            this.levelText!.setText(`Lvl ${profile.level}`);

            // Level up flash
            this.tweens.add({
                targets: this.levelText,
                scale: 1.3,
                duration: 200,
                yoyo: true,
            });
        }

        // Update XP bar
        if (xpPercent !== this.currentXpPercent) {
            this.currentXpPercent = xpPercent;
            this.updateXpBar(xpPercent);
        }
    }

    updateXpBar(percent: number) {
        if (!this.xpBar) return;

        this.xpBar.clear();
        this.xpBar.fillStyle(0x22c55e, 1);
        this.xpBar.fillRoundedRect(600, 38, 160 * (percent / 100), 12, 6);
    }

    animateNumber(textObj: Phaser.GameObjects.Text, from: number, to: number) {
        const duration = 500;
        const steps = 20;
        const diff = to - from;
        const stepValue = diff / steps;
        const stepDuration = duration / steps;

        let current = from;
        let step = 0;

        const timer = this.time.addEvent({
            delay: stepDuration,
            callback: () => {
                step++;
                current = Math.floor(from + stepValue * step);
                textObj.setText(current.toLocaleString());

                if (step >= steps) {
                    textObj.setText(to.toLocaleString());
                    timer.destroy();
                }
            },
            repeat: steps - 1,
        });
    }

    // Show floating text (for rewards, etc.)
    showFloatingText(text: string, x: number, y: number, color: string = '#fbbf24') {
        const floatText = this.add.text(x, y, text, {
            font: 'bold 20px Outfit',
            color,
        }).setOrigin(0.5);

        this.tweens.add({
            targets: floatText,
            y: y - 50,
            alpha: 0,
            duration: 1500,
            ease: 'Power2',
            onComplete: () => floatText.destroy(),
        });
    }
}
