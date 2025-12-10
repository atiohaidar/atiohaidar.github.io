<script lang="ts">
  import '../lib/styles/global.css';
  import { onMount } from 'svelte';
  import { getUser, logout, type User } from '$lib/api/auth';

  let { children } = $props();
  let user = $state<User | null>(null);
  let showMenu = $state(false);

  onMount(() => {
    user = getUser();
  });

  function handleLogout() {
    logout();
    user = null;
    showMenu = false;
  }
</script>

<div class="animated-bg"></div>

<header class="header">
  <a href="/" class="logo">
    <span class="logo-icon">🎮</span>
    <span class="logo-text">Color Match</span>
  </a>
  
  <nav class="nav">
    <a href="/shop" class="nav-link shop-link">🛒 Shop</a>
    {#if user}
      <div class="user-menu">
        <button class="user-btn" onclick={() => showMenu = !showMenu}>
          <span class="user-avatar">{user.name.charAt(0).toUpperCase()}</span>
          <span class="user-name">{user.name}</span>
        </button>
        
        {#if showMenu}
          <div class="dropdown">
            <a href="/shop" class="dropdown-item">🛒 Shop</a>
            <button class="dropdown-item" onclick={handleLogout}>
              Logout
            </button>
          </div>
        {/if}
      </div>
    {:else}
      <a href="/login" class="nav-link">Login</a>
    {/if}
  </nav>
</header>

<main class="main">
  {@render children()}
</main>

<style>
  .header {
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: var(--spacing-md) var(--spacing-lg);
    z-index: 100;
    background: rgba(15, 12, 41, 0.8);
    backdrop-filter: blur(10px);
    border-bottom: 1px solid var(--glass-border);
  }

  .logo {
    display: flex;
    align-items: center;
    gap: var(--spacing-sm);
    text-decoration: none;
    color: var(--text-primary);
  }

  .logo-icon {
    font-size: 1.5rem;
  }

  .logo-text {
    font-size: 1.25rem;
    font-weight: 700;
    background: linear-gradient(135deg, var(--primary), var(--accent));
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    background-clip: text;
  }

  .nav {
    display: flex;
    align-items: center;
    gap: var(--spacing-md);
  }

  .nav-link {
    padding: var(--spacing-sm) var(--spacing-md);
    color: var(--text-primary);
    text-decoration: none;
    font-weight: 500;
    border-radius: var(--radius-full);
    transition: background var(--transition-fast);
  }

  .nav-link:hover {
    background: var(--glass-bg);
  }

  .shop-link {
    color: var(--tile-yellow);
    background: rgba(252, 196, 25, 0.1);
    border: 1px solid rgba(252, 196, 25, 0.3);
  }

  .shop-link:hover {
    background: rgba(252, 196, 25, 0.2);
  }

  .user-menu {
    position: relative;
  }

  .user-btn {
    display: flex;
    align-items: center;
    gap: var(--spacing-sm);
    padding: var(--spacing-xs) var(--spacing-md) var(--spacing-xs) var(--spacing-xs);
    background: var(--glass-bg);
    border: 1px solid var(--glass-border);
    border-radius: var(--radius-full);
    color: var(--text-primary);
    font-family: var(--font-family);
    font-size: 0.875rem;
    cursor: pointer;
    transition: background var(--transition-fast);
  }

  .user-btn:hover {
    background: rgba(255, 255, 255, 0.15);
  }

  .user-avatar {
    width: 28px;
    height: 28px;
    display: flex;
    align-items: center;
    justify-content: center;
    background: linear-gradient(135deg, var(--primary), var(--secondary));
    border-radius: 50%;
    font-weight: 600;
    font-size: 0.75rem;
  }

  .user-name {
    font-weight: 500;
  }

  .dropdown {
    position: absolute;
    top: calc(100% + var(--spacing-sm));
    right: 0;
    min-width: 150px;
    background: var(--bg-dark);
    border: 1px solid var(--glass-border);
    border-radius: var(--radius-md);
    overflow: hidden;
    animation: slideDown 150ms ease-out;
  }

  @keyframes slideDown {
    from {
      opacity: 0;
      transform: translateY(-10px);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }

  .dropdown-item {
    width: 100%;
    padding: var(--spacing-md);
    background: none;
    border: none;
    color: var(--text-primary);
    font-family: var(--font-family);
    font-size: 0.875rem;
    text-align: left;
    cursor: pointer;
    transition: background var(--transition-fast);
  }

  .dropdown-item:hover {
    background: var(--glass-bg);
  }

  .main {
    min-height: 100vh;
    padding-top: 60px;
  }
</style>
