/**
 * Phaser Game Configuration
 */

import Phaser from 'phaser';
import { BootScene } from './scenes/BootScene';
import { MainScene } from './scenes/MainScene';
import { UIScene } from './scenes/UIScene';

export function createGameConfig(parent: HTMLElement): Phaser.Types.Core.GameConfig {
    return {
        type: Phaser.AUTO,
        parent,
        width: 800,
        height: 600,
        backgroundColor: '#1e293b',
        scale: {
            mode: Phaser.Scale.FIT,
            autoCenter: Phaser.Scale.CENTER_BOTH,
        },
        scene: [BootScene, MainScene, UIScene],
        physics: {
            default: 'arcade',
            arcade: {
                gravity: { x: 0, y: 0 },
                debug: false,
            },
        },
        pixelArt: true, // For crisp pixel art rendering
        roundPixels: true,
    };
}

export function createGame(parent: HTMLElement): Phaser.Game {
    const config = createGameConfig(parent);
    return new Phaser.Game(config);
}
