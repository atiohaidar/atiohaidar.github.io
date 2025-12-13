<script lang="ts">
  import '../app.css';
  import { onMount } from 'svelte';
  import { getAuthToken } from '$lib/api';
  import { isLoggedIn, toasts } from '$lib/stores';

  onMount(() => {
    // Check if already logged in
    const token = getAuthToken();
    if (token) {
      isLoggedIn.set(true);
    }
  });
</script>

<div class="app">
  <slot />
  
  <!-- Toast notifications -->
  {#each $toasts as toast (toast.id)}
    <div class="toast toast-{toast.type}">
      {toast.message}
    </div>
  {/each}
</div>

<style>
  .app {
    min-height: 100vh;
    display: flex;
    flex-direction: column;
  }

  .toast {
    position: fixed;
    bottom: 2rem;
    left: 50%;
    transform: translateX(-50%);
    padding: 1rem 2rem;
    border-radius: 12px;
    font-weight: 600;
    z-index: 2000;
    animation: slideUp 0.3s ease;
  }

  .toast-success { background: #166534; color: white; }
  .toast-error { background: #991b1b; color: white; }
  .toast-info { background: #1e293b; color: #f8fafc; border: 1px solid #334155; }
  .toast-gold { background: rgba(251, 191, 36, 0.2); color: #fbbf24; border: 1px solid #fbbf24; }
  .toast-xp { background: rgba(34, 197, 94, 0.2); color: #22c55e; border: 1px solid #22c55e; }
  .toast-level { background: linear-gradient(135deg, #fbbf24, #d97706); color: black; }

  @keyframes slideUp {
    from {
      opacity: 0;
      transform: translateX(-50%) translateY(20px);
    }
    to {
      opacity: 1;
      transform: translateX(-50%) translateY(0);
    }
  }
</style>
