<script lang="ts">
  import { onMount } from 'svelte';
  import { browser } from '$app/environment';

  let gameContainer = $state<HTMLDivElement | null>(null);
  let game = $state<any>(null);
  let isLoading = $state(true);

  onMount(async () => {
    if (!browser || !gameContainer) return;

    // Dynamically import Phaser and scenes to avoid SSR issues
    const Phaser = (await import('phaser')).default;
    const { BootScene } = await import('$lib/game/scenes/BootScene');
    const { MenuScene } = await import('$lib/game/scenes/MenuScene');
    const { GameScene } = await import('$lib/game/scenes/GameScene');
    const { GameOverScene } = await import('$lib/game/scenes/GameOverScene');

    const width = Math.min(500, window.innerWidth - 32);
    const height = Math.min(600, window.innerHeight - 200);

    const config: Phaser.Types.Core.GameConfig = {
      type: Phaser.AUTO,
      parent: gameContainer!,
      width,
      height,
      backgroundColor: '#1a1a2e',
      scale: {
        mode: Phaser.Scale.FIT,
        autoCenter: Phaser.Scale.CENTER_BOTH,
      },
      scene: [BootScene, MenuScene, GameScene, GameOverScene],
    };

    game = new Phaser.Game(config);
    isLoading = false;

    return () => {
      if (game) {
        game.destroy(true);
      }
    };
  });
</script>

<svelte:head>
  <title>Color Match Frenzy - Puzzle Game</title>
  <meta name="description" content="Match colorful tiles in this addictive puzzle game. Score big with combos!">
</svelte:head>

<div class="game-page">
  {#if isLoading}
    <div class="loader">
      <div class="loader-spinner"></div>
      <p>Loading game...</p>
    </div>
  {/if}
  
  <div 
    class="game-canvas-wrapper" 
    class:hidden={isLoading}
    bind:this={gameContainer}
  ></div>
  
  <div class="game-footer">
    <p>🎮 Match 3+ tiles • ⚡ Chain combos for bonus • ⏱️ Beat the clock!</p>
  </div>
</div>

<style>
  .game-page {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    min-height: calc(100vh - 60px);
    padding: var(--spacing-lg);
    gap: var(--spacing-lg);
  }

  .game-canvas-wrapper {
    border-radius: var(--radius-lg);
    overflow: hidden;
    box-shadow: 
      0 0 60px rgba(102, 126, 234, 0.3),
      0 20px 60px rgba(0, 0, 0, 0.4);
  }

  .game-canvas-wrapper.hidden {
    display: none;
  }

  .loader {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: var(--spacing-md);
    color: var(--text-secondary);
  }

  .game-footer {
    text-align: center;
    color: var(--text-muted);
    font-size: 0.875rem;
  }

  @media (max-width: 640px) {
    .game-page {
      padding: var(--spacing-md);
    }
  }
</style>
