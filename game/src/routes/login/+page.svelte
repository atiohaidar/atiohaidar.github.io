<script lang="ts">
  import { goto } from '$app/navigation';
  import { login } from '$lib/api/auth';

  let username = $state('');
  let password = $state('');
  let error = $state('');
  let isLoading = $state(false);

  async function handleSubmit(e: Event) {
    e.preventDefault();
    
    if (!username || !password) {
      error = 'Please fill in all fields';
      return;
    }

    isLoading = true;
    error = '';

    const result = await login(username, password);
    
    isLoading = false;

    if (result.success) {
      goto('/');
    } else {
      error = result.message || 'Login failed';
    }
  }
</script>

<svelte:head>
  <title>Login - Color Match Frenzy</title>
</svelte:head>

<div class="auth-page">
  <div class="auth-card glass-card">
    <div class="auth-header">
      <h1 class="auth-title">Welcome Back!</h1>
      <p class="auth-subtitle">Login to save your scores</p>
    </div>

    <form class="auth-form" onsubmit={handleSubmit}>
      {#if error}
        <div class="error-message">
          {error}
        </div>
      {/if}

      <div class="input-group">
        <label class="input-label" for="username">Username</label>
        <input
          type="text"
          id="username"
          class="input"
          placeholder="Enter your username"
          bind:value={username}
          disabled={isLoading}
        />
      </div>

      <div class="input-group">
        <label class="input-label" for="password">Password</label>
        <input
          type="password"
          id="password"
          class="input"
          placeholder="Enter your password"
          bind:value={password}
          disabled={isLoading}
        />
      </div>

      <button type="submit" class="btn btn-primary btn-lg w-full" disabled={isLoading}>
        {#if isLoading}
          <span class="btn-spinner"></span>
          Logging in...
        {:else}
          Login
        {/if}
      </button>
    </form>

    <div class="auth-footer">
      <p>Don't have an account? <a href="/register">Register</a></p>
      <a href="/" class="back-link">← Back to game</a>
    </div>
  </div>
</div>

<style>
  .auth-page {
    display: flex;
    align-items: center;
    justify-content: center;
    min-height: calc(100vh - 60px);
    padding: var(--spacing-lg);
  }

  .auth-card {
    width: 100%;
    max-width: 400px;
    padding: var(--spacing-xl);
  }

  .auth-header {
    text-align: center;
    margin-bottom: var(--spacing-xl);
  }

  .auth-title {
    font-size: 1.75rem;
    font-weight: 700;
    color: var(--text-primary);
    margin-bottom: var(--spacing-xs);
  }

  .auth-subtitle {
    color: var(--text-secondary);
    font-size: 0.875rem;
  }

  .auth-form {
    display: flex;
    flex-direction: column;
    gap: var(--spacing-md);
  }

  .error-message {
    padding: var(--spacing-md);
    background: rgba(255, 107, 107, 0.1);
    border: 1px solid rgba(255, 107, 107, 0.3);
    border-radius: var(--radius-md);
    color: var(--tile-red);
    font-size: 0.875rem;
    text-align: center;
  }

  .auth-footer {
    margin-top: var(--spacing-xl);
    text-align: center;
    font-size: 0.875rem;
    color: var(--text-secondary);
  }

  .auth-footer a {
    color: var(--primary);
    text-decoration: none;
    font-weight: 500;
  }

  .auth-footer a:hover {
    text-decoration: underline;
  }

  .back-link {
    display: block;
    margin-top: var(--spacing-md);
    color: var(--text-muted) !important;
  }

  .btn-spinner {
    width: 16px;
    height: 16px;
    border: 2px solid rgba(255, 255, 255, 0.3);
    border-top-color: white;
    border-radius: 50%;
    animation: spin 0.8s linear infinite;
  }

  @keyframes spin {
    to { transform: rotate(360deg); }
  }
</style>
