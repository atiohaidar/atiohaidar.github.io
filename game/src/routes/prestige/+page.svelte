<script lang="ts">
    import { onMount } from "svelte";
    import { goto } from "$app/navigation";
    import { getAuthToken, getProfile, prestigeReset } from "$lib/api";
    import { profile, showToast, isLoggedIn } from "$lib/stores";

    let loading = true;
    let prestigeLoading = false;
    let confirmReset = false;

    onMount(async () => {
        const token = getAuthToken();
        if (!token) {
            goto("/");
            return;
        }
        isLoggedIn.set(true);
        await loadData();
    });

    async function loadData() {
        loading = true;
        const profileRes = await getProfile();
        if (profileRes.success && profileRes.data) {
            profile.set(profileRes.data);
        }
        loading = false;
    }

    async function handlePrestige() {
        if (!confirmReset || prestigeLoading) return;
        prestigeLoading = true;

        try {
            const res = await prestigeReset();

            if (res.success && res.data) {
                showToast(
                    `🎉 Prestige complete! Level ${res.data.new_prestige_level} (+${res.data.bonus_percent}% gold bonus)`,
                    "level",
                );
                confirmReset = false;
                await loadData();
            } else {
                showToast(res.error || "Prestige failed", "error");
            }
        } catch (e) {
            showToast("Failed to prestige", "error");
        }

        prestigeLoading = false;
    }

    $: canPrestige = ($profile?.level || 0) >= 20;
    $: currentBonus = ($profile?.prestige_level || 0) * 10;
    $: nextBonus = (($profile?.prestige_level || 0) + 1) * 10;
</script>

<svelte:head>
    <title>Bercock tanam</title>
</svelte:head>

<div class="prestige-page">
    <header class="header">
        <a href="/play" class="back-btn">← Back to Farm</a>
        <h1>✨ Prestige</h1>
        <div class="spacer"></div>
    </header>

    {#if loading}
        <div class="loading">
            <div class="spinner"></div>
            <p>Loading...</p>
        </div>
    {:else}
        <div class="prestige-card">
            <div class="prestige-icon">🔄</div>
            <h2>Prestige Reset</h2>
            <p class="description">
                Reset your farm progress to earn permanent gold bonuses. Higher
                prestige = more gold per harvest!
            </p>

            <div class="stats-grid">
                <div class="stat-item">
                    <span class="label">Current Level</span>
                    <span class="value">{$profile?.level || 1}</span>
                </div>
                <div class="stat-item">
                    <span class="label">Prestige Level</span>
                    <span class="value prestige"
                        >⭐ {$profile?.prestige_level || 0}</span
                    >
                </div>
                <div class="stat-item">
                    <span class="label">Current Bonus</span>
                    <span class="value gold">+{currentBonus}%</span>
                </div>
                <div class="stat-item">
                    <span class="label">Next Bonus</span>
                    <span class="value gold">+{nextBonus}%</span>
                </div>
            </div>

            <div class="requirements">
                <h3>Requirements</h3>
                <div class="req-item" class:met={canPrestige}>
                    {#if canPrestige}✅{:else}❌{/if}
                    Reach Level 20 (Current: {$profile?.level || 1})
                </div>
            </div>

            <div class="warning-box">
                <strong>⚠️ Warning:</strong> Prestige will reset:
                <ul>
                    <li>Your level back to 1</li>
                    <li>Your gold to 100</li>
                    <li>All farm plots (crops cleared)</li>
                </ul>
                <p>You will keep: Gems, Shop items, Achievements</p>
            </div>

            {#if canPrestige}
                {#if !confirmReset}
                    <button
                        class="btn btn-prestige"
                        on:click={() => (confirmReset = true)}
                    >
                        🔄 Prestige Now
                    </button>
                {:else}
                    <div class="confirm-box">
                        <p>Are you sure? This cannot be undone!</p>
                        <div class="confirm-buttons">
                            <button
                                class="btn btn-danger"
                                on:click={handlePrestige}
                                disabled={prestigeLoading}
                            >
                                {prestigeLoading
                                    ? "Processing..."
                                    : "Confirm Prestige"}
                            </button>
                            <button
                                class="btn btn-secondary"
                                on:click={() => (confirmReset = false)}
                            >
                                Cancel
                            </button>
                        </div>
                    </div>
                {/if}
            {:else}
                <button class="btn btn-disabled" disabled>
                    🔒 Reach Level 20 to Prestige
                </button>
            {/if}
        </div>

        <!-- Prestige Rewards Table -->
        <div class="rewards-table">
            <h3>Prestige Rewards</h3>
            <div class="table-grid">
                {#each [1, 2, 3, 4, 5, 6, 7, 8, 9, 10] as level}
                    <div
                        class="reward-row"
                        class:current={level ===
                            ($profile?.prestige_level || 0)}
                    >
                        <span class="level">⭐ {level}</span>
                        <span class="bonus">+{level * 10}% gold</span>
                    </div>
                {/each}
            </div>
        </div>
    {/if}
</div>

<style>
    .prestige-page {
        min-height: 100vh;
        max-height: 100vh;
        overflow-y: auto;
        background: var(--bg-primary);
        padding: 2rem;
    }

    .header {
        display: flex;
        align-items: center;
        justify-content: space-between;
        margin-bottom: 2rem;
    }

    .back-btn {
        color: var(--text-secondary);
        text-decoration: none;
        padding: 0.5rem 1rem;
        border-radius: 8px;
        background: var(--bg-secondary);
        transition: all 0.2s;
    }

    .back-btn:hover {
        background: var(--bg-tertiary);
        color: var(--text-primary);
    }

    .header h1 {
        font-size: 2rem;
        margin: 0;
    }
    .spacer {
        width: 100px;
    }

    .loading {
        display: flex;
        flex-direction: column;
        align-items: center;
        padding: 4rem;
        gap: 1rem;
    }

    .spinner {
        width: 48px;
        height: 48px;
        border: 4px solid var(--bg-tertiary);
        border-top-color: var(--gold);
        border-radius: 50%;
        animation: spin 1s linear infinite;
    }

    .prestige-card {
        background: var(--bg-secondary);
        border-radius: 16px;
        padding: 2rem;
        text-align: center;
        max-width: 600px;
        margin: 0 auto 2rem;
        border: 2px solid #a855f7;
    }

    .prestige-icon {
        font-size: 4rem;
        margin-bottom: 1rem;
    }
    .prestige-card h2 {
        margin: 0 0 0.5rem 0;
        color: #a855f7;
    }
    .description {
        color: var(--text-muted);
        margin: 0 0 2rem 0;
    }

    .stats-grid {
        display: grid;
        grid-template-columns: repeat(2, 1fr);
        gap: 1rem;
        margin-bottom: 2rem;
    }

    .stat-item {
        background: var(--bg-tertiary);
        padding: 1rem;
        border-radius: 12px;
        display: flex;
        flex-direction: column;
        gap: 0.25rem;
    }

    .stat-item .label {
        color: var(--text-muted);
        font-size: 0.85rem;
    }
    .stat-item .value {
        font-size: 1.5rem;
        font-weight: 700;
    }
    .stat-item .prestige {
        color: #a855f7;
    }
    .stat-item .gold {
        color: var(--gold);
    }

    .requirements {
        margin-bottom: 1.5rem;
        text-align: left;
    }
    .requirements h3 {
        margin: 0 0 0.5rem 0;
        font-size: 1rem;
    }
    .req-item {
        padding: 0.5rem;
        border-radius: 6px;
        background: var(--bg-tertiary);
    }
    .req-item.met {
        color: #22c55e;
    }

    .warning-box {
        background: rgba(239, 68, 68, 0.1);
        border: 1px solid rgba(239, 68, 68, 0.3);
        border-radius: 12px;
        padding: 1rem;
        margin-bottom: 1.5rem;
        text-align: left;
    }

    .warning-box ul {
        margin: 0.5rem 0;
        padding-left: 1.5rem;
    }
    .warning-box p {
        margin: 0.5rem 0 0 0;
        color: #22c55e;
        font-size: 0.9rem;
    }

    .btn-prestige {
        background: linear-gradient(135deg, #a855f7, #7c3aed);
        color: white;
        font-weight: 600;
        padding: 1rem 2rem;
        border: none;
        border-radius: 12px;
        cursor: pointer;
        font-size: 1.1rem;
        width: 100%;
        transition: all 0.2s;
    }

    .btn-prestige:hover {
        transform: translateY(-2px);
        box-shadow: 0 4px 12px rgba(168, 85, 247, 0.3);
    }

    .btn-disabled {
        background: var(--bg-tertiary);
        color: var(--text-muted);
        padding: 1rem 2rem;
        border: none;
        border-radius: 12px;
        width: 100%;
    }

    .confirm-box {
        background: rgba(239, 68, 68, 0.1);
        border-radius: 12px;
        padding: 1rem;
    }

    .confirm-buttons {
        display: flex;
        gap: 1rem;
        margin-top: 1rem;
    }
    .btn-danger {
        background: #ef4444;
        color: white;
        padding: 0.75rem 1.5rem;
        border: none;
        border-radius: 8px;
        cursor: pointer;
        flex: 1;
    }

    .btn-secondary {
        background: var(--bg-tertiary);
        color: var(--text-primary);
        padding: 0.75rem 1.5rem;
        border: none;
        border-radius: 8px;
        cursor: pointer;
        flex: 1;
    }

    .rewards-table {
        background: var(--bg-secondary);
        border-radius: 16px;
        padding: 1.5rem;
        max-width: 400px;
        margin: 0 auto;
    }

    .rewards-table h3 {
        margin: 0 0 1rem 0;
        text-align: center;
    }

    .table-grid {
        display: flex;
        flex-direction: column;
        gap: 0.5rem;
    }

    .reward-row {
        display: flex;
        justify-content: space-between;
        padding: 0.75rem 1rem;
        background: var(--bg-tertiary);
        border-radius: 8px;
    }

    .reward-row.current {
        background: rgba(168, 85, 247, 0.2);
        border: 1px solid #a855f7;
    }

    .reward-row .bonus {
        color: var(--gold);
        font-weight: 600;
    }

    @keyframes spin {
        to {
            transform: rotate(360deg);
        }
    }
</style>
