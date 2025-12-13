<script lang="ts">
    import { goto } from "$app/navigation";
    import { login, getAuthToken } from "$lib/api";
    import { isLoggedIn, showToast } from "$lib/stores";
    import { onMount } from "svelte";

    let username = "";
    let password = "";
    let loading = false;
    let error = "";

    onMount(() => {
        // If already logged in, go to game
        const token = getAuthToken();
        if (token) {
            isLoggedIn.set(true);
            goto("/play");
        }
    });

    async function handleLogin() {
        if (!username || !password) {
            error = "Please enter username and password";
            return;
        }

        loading = true;
        error = "";

        const result = await login({ username, password });

        loading = false;

        if (result.success && result.data) {
            isLoggedIn.set(true);
            showToast(`Welcome, ${result.data.user.name}!`, "success");
            goto("/play");
        } else {
            error = result.error || "Login failed";
        }
    }

    function handleKeydown(e: KeyboardEvent) {
        if (e.key === "Enter") {
            handleLogin();
        }
    }
</script>

<svelte:head>
    <title>Bercocok Tanam - Login</title>
</svelte:head>

<div class="login-page">
    <div class="login-container">
        <!-- Logo/Title -->
        <div class="logo">
            <span class="emoji">🌾</span>
            <h1>Bercocok Tanam</h1>
            <p class="subtitle">Build your dream farm!</p>
        </div>

        <!-- Login Form -->
        <form class="login-form" on:submit|preventDefault={handleLogin}>
            <div class="input-group">
                <label for="username">Username</label>
                <input
                    type="text"
                    id="username"
                    bind:value={username}
                    placeholder="Enter your username"
                    on:keydown={handleKeydown}
                    disabled={loading}
                />
            </div>

            <div class="input-group">
                <label for="password">Password</label>
                <input
                    type="password"
                    id="password"
                    bind:value={password}
                    placeholder="Enter your password"
                    on:keydown={handleKeydown}
                    disabled={loading}
                />
            </div>

            {#if error}
                <div class="error-message">{error}</div>
            {/if}

            <button
                type="submit"
                class="btn btn-primary w-full"
                disabled={loading}
            >
                {#if loading}
                    <span class="spinner"></span>
                    Loading...
                {:else}
                    🚜 Start Farming!
                {/if}
            </button>
        </form>

        <!-- Info -->
        <div class="info">
            <p>Use your existing account to play.</p>
            <p class="text-muted">
                Don't have an account? Register at the main site.
            </p>
        </div>

        <!-- Features -->
        <div class="features">
            <div class="feature">
                <span>🌱</span>
                <span>Plant Crops</span>
            </div>
            <div class="feature">
                <span>💰</span>
                <span>Earn Gold</span>
            </div>
            <div class="feature">
                <span>🏆</span>
                <span>Level Up</span>
            </div>
            <div class="feature">
                <span>🛒</span>
                <span>Buy Upgrades</span>
            </div>
        </div>
    </div>
</div>

<style>
    .login-page {
        min-height: 100vh;
        display: flex;
        align-items: center;
        justify-content: center;
        background: linear-gradient(
            135deg,
            #0f172a 0%,
            #1e293b 50%,
            #0f172a 100%
        );
        padding: 2rem;
    }

    .login-container {
        background: rgba(30, 41, 59, 0.8);
        backdrop-filter: blur(10px);
        border: 1px solid rgba(255, 255, 255, 0.1);
        border-radius: 24px;
        padding: 3rem;
        max-width: 420px;
        width: 100%;
        box-shadow: 0 20px 40px rgba(0, 0, 0, 0.4);
    }

    .logo {
        text-align: center;
        margin-bottom: 2rem;
    }

    .logo .emoji {
        font-size: 4rem;
        display: block;
        margin-bottom: 0.5rem;
        animation: float 3s ease-in-out infinite;
    }

    .logo h1 {
        font-size: 2rem;
        font-weight: 700;
        background: linear-gradient(135deg, #fbbf24, #f59e0b);
        -webkit-background-clip: text;
        -webkit-text-fill-color: transparent;
        background-clip: text;
        margin: 0;
    }

    .subtitle {
        color: #94a3b8;
        margin-top: 0.5rem;
    }

    .login-form {
        display: flex;
        flex-direction: column;
        gap: 1.25rem;
    }

    .input-group {
        display: flex;
        flex-direction: column;
        gap: 0.5rem;
    }

    .input-group label {
        font-weight: 500;
        color: #94a3b8;
        font-size: 0.9rem;
    }

    .input-group input {
        padding: 0.875rem 1rem;
        font-size: 1rem;
    }

    .error-message {
        background: rgba(239, 68, 68, 0.2);
        color: #ef4444;
        padding: 0.75rem;
        border-radius: 8px;
        font-size: 0.9rem;
        text-align: center;
    }

    .btn {
        padding: 1rem;
        font-size: 1.1rem;
    }

    .spinner {
        display: inline-block;
        width: 16px;
        height: 16px;
        border: 2px solid transparent;
        border-top-color: currentColor;
        border-radius: 50%;
        animation: spin 0.8s linear infinite;
    }

    .info {
        margin-top: 1.5rem;
        text-align: center;
        font-size: 0.9rem;
        color: #64748b;
    }

    .info p {
        margin: 0.25rem 0;
    }

    .features {
        display: grid;
        grid-template-columns: repeat(2, 1fr);
        gap: 1rem;
        margin-top: 2rem;
        padding-top: 2rem;
        border-top: 1px solid rgba(255, 255, 255, 0.1);
    }

    .feature {
        display: flex;
        align-items: center;
        gap: 0.5rem;
        color: #94a3b8;
        font-size: 0.9rem;
    }

    .feature span:first-child {
        font-size: 1.25rem;
    }

    @keyframes float {
        0%,
        100% {
            transform: translateY(0);
        }
        50% {
            transform: translateY(-10px);
        }
    }

    @keyframes spin {
        to {
            transform: rotate(360deg);
        }
    }
</style>
