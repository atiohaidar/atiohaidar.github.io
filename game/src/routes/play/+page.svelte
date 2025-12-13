<script lang="ts">
    import { onMount, onDestroy } from "svelte";
    import { goto } from "$app/navigation";
    import { browser } from "$app/environment";
    import {
        getAuthToken,
        getProfile,
        getFarmPlots,
        getCrops,
        plantCrop,
        waterPlot,
        harvestPlot,
        harvestAll,
        type FarmPlot,
        type Crop,
    } from "$lib/api";
    import {
        profile,
        farmPlots,
        crops,
        isLoggedIn,
        showToast,
        xpProgress,
        selectedPlot,
        showSeedSelector,
        startGameLoop,
        stopGameLoop,
    } from "$lib/stores";

    let loading = true;

    onMount(async () => {
        // Check auth
        const token = getAuthToken();
        if (!token) {
            goto("/");
            return;
        }

        isLoggedIn.set(true);

        // Load initial data
        await loadGameData();

        // Set loading to false after data is loaded
        loading = false;

        // Start game loop for real-time updates
        startGameLoop(async () => {
            await refreshFarmPlots();
        }, 2000);

        // Keyboard shortcuts (only in browser)
        if (browser) {
            window.addEventListener("keydown", handleKeydown);
        }
    });

    onDestroy(() => {
        stopGameLoop();
        if (browser) {
            window.removeEventListener("keydown", handleKeydown);
        }
    });

    async function loadGameData() {
        const [profileRes, cropsRes, plotsRes] = await Promise.all([
            getProfile(),
            getCrops(),
            getFarmPlots(),
        ]);

        if (profileRes.success && profileRes.data) {
            profile.set(profileRes.data);
        }

        if (cropsRes.success && cropsRes.data) {
            crops.set(cropsRes.data);
        }

        if (plotsRes.success && plotsRes.data) {
            farmPlots.set(plotsRes.data);
        }
    }

    async function refreshFarmPlots() {
        const res = await getFarmPlots();
        if (res.success && res.data) {
            farmPlots.set(res.data);
        }
    }

    async function refreshProfile() {
        const res = await getProfile();
        if (res.success && res.data) {
            profile.set(res.data);
        }
    }

    function handlePlotClick(plotIndex: number, plotData?: FarmPlot) {
        if (!plotData) {
            // Empty plot - show seed selector
            selectedPlot.set(plotIndex);
            showSeedSelector.set(true);
            return;
        }

        if (!plotData.crop_id) {
            // Empty plot
            selectedPlot.set(plotIndex);
            showSeedSelector.set(true);
        } else if (plotData.ready) {
            // Ready to harvest
            handleHarvest(plotIndex);
        } else if (!plotData.watered) {
            // Can water
            handleWater(plotIndex);
        } else {
            // Already watered, just show info
            showToast(`Growing... ${plotData.time_remaining}s left`, "info");
        }
    }

    async function handlePlant(cropId: string) {
        const plotIndex = $selectedPlot;
        if (plotIndex === null) return;

        showSeedSelector.set(false);
        selectedPlot.set(null);

        const result = await plantCrop(plotIndex, cropId);

        if (result.success) {
            const crop = $crops.find((c) => c.id === cropId);
            showToast(`Planted ${crop?.name || "crop"}! 🌱`, "success");
            await refreshFarmPlots();
            await refreshProfile();
        } else {
            showToast(result.error || "Failed to plant", "error");
        }
    }

    async function handleWater(plotIndex: number) {
        const result = await waterPlot(plotIndex);

        if (result.success) {
            showToast("Watered! 💧 Growth +10%", "info");
            await refreshFarmPlots();
        } else {
            showToast(result.error || "Failed to water", "error");
        }
    }

    async function handleHarvest(plotIndex: number) {
        const result = await harvestPlot(plotIndex);

        if (result.success && result.data) {
            const { gold, xp, crop, leveledUp, newLevel } = result.data;

            showToast(`+${gold} gold, +${xp} XP`, "gold");

            if (leveledUp) {
                showToast(`🎉 Level Up! Now level ${newLevel}`, "level");
            }

            await refreshFarmPlots();
            await refreshProfile();
        } else {
            showToast(result.error || "Failed to harvest", "error");
        }
    }

    async function handleHarvestAll() {
        const result = await harvestAll();

        if (result.success && result.data) {
            const {
                total_gold,
                total_xp,
                harvested_count,
                leveled_up,
                new_level,
            } = result.data;

            showToast(
                `Harvested ${harvested_count}! +${total_gold} gold, +${total_xp} XP`,
                "gold",
            );

            if (leveled_up) {
                showToast(`🎉 Level Up! Now level ${new_level}`, "level");
            }

            await refreshFarmPlots();
            await refreshProfile();
        } else {
            showToast(result.error || "No crops ready", "error");
        }
    }

    function handleKeydown(e: KeyboardEvent) {
        if (e.key === "h" || e.key === "H") {
            handleHarvestAll();
        }
        if (e.key === "Escape") {
            showSeedSelector.set(false);
            selectedPlot.set(null);
        }
    }

    function closeSeedSelector() {
        showSeedSelector.set(false);
        selectedPlot.set(null);
    }

    // Get unlocked crops for seed selector
    $: unlockedCrops = $crops.filter(
        (c) => c.unlock_level <= ($profile?.level || 1),
    );
</script>

<svelte:head>
    <title>Harvest Haven - Play</title>
</svelte:head>

<div class="game-page">
    <!-- Game Area -->
    <div class="game-container">
        {#if loading}
            <div class="loading-overlay">
                <div class="loading-spinner"></div>
                <p>Loading farm...</p>
            </div>
        {:else}
            <!-- HTML Farm Grid Overlay for reliable click handling -->
            <div class="html-farm-grid">
                <h2 class="farm-title">🌾 Harvest Haven 🌾</h2>
                <div class="farm-plots-grid">
                    {#each $farmPlots as plot, i}
                        <button
                            class="plot-cell"
                            class:has-crop={plot.crop_id}
                            class:ready={plot.ready}
                            class:watered={plot.watered}
                            on:click={() => handlePlotClick(i, plot)}
                        >
                            {#if plot.crop_id}
                                <span class="crop-icon"
                                    >{plot.crop?.icon || "🌱"}</span
                                >
                                {#if !plot.ready}
                                    <div class="growth-bar">
                                        <div
                                            class="growth-fill"
                                            style="width: {plot.growth_percent ||
                                                0}%"
                                        ></div>
                                    </div>
                                {/if}
                                {#if plot.ready}
                                    <span class="ready-badge">✓</span>
                                {/if}
                                {#if plot.watered && !plot.ready}
                                    <span class="water-badge">💧</span>
                                {/if}
                            {:else}
                                <span class="empty-icon">+</span>
                            {/if}
                        </button>
                    {/each}
                </div>
                <p class="farm-hint">
                    Click a plot to plant, water, or harvest!
                </p>
            </div>
        {/if}
    </div>

    <!-- Side Panel -->
    <div class="side-panel">
        <h3>🌾 Quick Actions</h3>

        <button class="btn btn-primary w-full" on:click={handleHarvestAll}>
            🌾 Harvest All (H)
        </button>

        <!-- Navigation Links -->
        <div class="nav-links">
            <a href="/shop" class="nav-link">🛒 Shop</a>
            <a href="/inventory" class="nav-link">📦 Inventory</a>
            <a href="/profile" class="nav-link">👤 Profile</a>
            <a href="/prestige" class="nav-link">✨ Prestige</a>
            <a href="/leaderboard" class="nav-link">🏆 Leaderboard</a>
        </div>

        <div class="stats">
            <div class="stat">
                <span class="label">Level</span>
                <span class="value">{$profile?.level || 1}</span>
            </div>
            <div class="stat">
                <span class="label">Gold</span>
                <span class="value text-gold"
                    >{$profile?.gold?.toLocaleString() || 0}</span
                >
            </div>
            <div class="stat">
                <span class="label">Gems</span>
                <span class="value text-gems">{$profile?.gems || 0}</span>
            </div>
            <div class="stat">
                <span class="label">Harvests</span>
                <span class="value">{$profile?.total_harvests || 0}</span>
            </div>
        </div>

        <div class="quick-tips">
            <h4>Tips</h4>
            <ul>
                <li>💧 Water crops for 10% faster growth</li>
                <li>🌾 Press H to harvest all ready crops</li>
                <li>⬆️ Higher tier crops = more gold</li>
            </ul>
        </div>
    </div>
</div>

<!-- Seed Selector Modal -->
{#if $showSeedSelector}
    <div
        class="modal-overlay"
        on:click={closeSeedSelector}
        on:keydown={(e) => e.key === "Escape" && closeSeedSelector()}
        role="button"
        tabindex="0"
    >
        <div class="modal seed-selector" on:click|stopPropagation role="dialog">
            <h2>🌱 Select a Seed</h2>
            <p class="text-muted">Choose what to plant in this plot</p>

            <div class="seed-grid">
                {#each unlockedCrops as crop}
                    <button
                        class="seed-item tier-{crop.tier}"
                        on:click={() => handlePlant(crop.id)}
                        disabled={($profile?.gold || 0) < crop.seed_price}
                    >
                        <span class="icon">{crop.icon || "🌱"}</span>
                        <span class="name">{crop.name}</span>
                        <span class="price">
                            <span class="text-gold">{crop.seed_price}</span> 🪙
                        </span>
                        <span class="info">
                            ⏱️ {crop.grow_time_seconds}s → 💰 {crop.sell_price}
                        </span>
                    </button>
                {/each}
            </div>

            <button class="btn btn-secondary" on:click={closeSeedSelector}>
                Cancel
            </button>
        </div>
    </div>
{/if}

<style>
    .game-page {
        display: flex;
        height: 100vh;
        background: var(--bg-primary);
    }

    .game-container {
        flex: 1;
        display: flex;
        align-items: center;
        justify-content: center;
        position: relative;
    }

    .loading-overlay {
        position: absolute;
        inset: 0;
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        background: var(--bg-primary);
        gap: 1rem;
    }

    .loading-spinner {
        width: 48px;
        height: 48px;
        border: 4px solid var(--bg-tertiary);
        border-top-color: var(--gold);
        border-radius: 50%;
        animation: spin 1s linear infinite;
    }

    /* HTML Farm Grid */
    .html-farm-grid {
        display: flex;
        flex-direction: column;
        align-items: center;
        gap: 1.5rem;
    }

    .farm-title {
        font-size: 1.75rem;
        color: var(--gold);
        margin: 0;
    }

    .farm-plots-grid {
        display: grid;
        grid-template-columns: repeat(3, 1fr);
        gap: 8px;
    }

    .plot-cell {
        width: 80px;
        height: 80px;
        background: #8b4513;
        border: 3px solid #654321;
        border-radius: 8px;
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        cursor: pointer;
        position: relative;
        transition: all 0.2s;
    }

    .plot-cell:hover {
        transform: scale(1.05);
        border-color: var(--gold);
    }

    .plot-cell.has-crop {
        background: #5d4037;
    }

    .plot-cell.ready {
        background: #2e7d32;
        border-color: #4caf50;
        animation: pulse 1s infinite;
    }

    .crop-icon {
        font-size: 2rem;
    }

    .empty-icon {
        font-size: 2rem;
        color: rgba(255, 255, 255, 0.3);
    }

    .growth-bar {
        width: 60px;
        height: 6px;
        background: rgba(0, 0, 0, 0.5);
        border-radius: 3px;
        overflow: hidden;
        margin-top: 4px;
    }

    .growth-fill {
        height: 100%;
        background: #8bc34a;
        transition: width 0.3s;
    }

    .ready-badge {
        position: absolute;
        top: 4px;
        right: 4px;
        background: #4caf50;
        color: white;
        width: 18px;
        height: 18px;
        border-radius: 50%;
        font-size: 10px;
        display: flex;
        align-items: center;
        justify-content: center;
    }

    .water-badge {
        position: absolute;
        top: 4px;
        left: 4px;
        font-size: 12px;
    }

    .farm-hint {
        color: var(--text-muted);
        font-size: 0.9rem;
        margin: 0;
    }

    @keyframes pulse {
        0%,
        100% {
            box-shadow: 0 0 0 0 rgba(76, 175, 80, 0.4);
        }
        50% {
            box-shadow: 0 0 0 8px rgba(76, 175, 80, 0);
        }
    }

    .side-panel {
        width: 280px;
        background: var(--bg-secondary);
        padding: 1.5rem;
        display: flex;
        flex-direction: column;
        gap: 1.5rem;
        border-left: 1px solid rgba(255, 255, 255, 0.1);
    }

    .side-panel h3 {
        font-size: 1.25rem;
        margin: 0;
    }

    .nav-links {
        display: flex;
        flex-direction: column;
        gap: 0.5rem;
    }

    .nav-link {
        display: block;
        padding: 0.75rem 1rem;
        background: var(--bg-tertiary);
        border-radius: 8px;
        color: var(--text-secondary);
        text-decoration: none;
        transition: all 0.2s;
    }

    .nav-link:hover {
        background: var(--bg-primary);
        color: var(--gold);
        transform: translateX(4px);
    }

    .stats {
        display: grid;
        grid-template-columns: 1fr 1fr;
        gap: 1rem;
    }

    .stat {
        background: var(--bg-tertiary);
        padding: 0.75rem;
        border-radius: 8px;
        text-align: center;
    }

    .stat .label {
        display: block;
        font-size: 0.75rem;
        color: var(--text-muted);
        margin-bottom: 0.25rem;
    }

    .stat .value {
        font-size: 1.25rem;
        font-weight: 700;
    }

    .quick-tips {
        margin-top: auto;
        padding: 1rem;
        background: rgba(251, 191, 36, 0.1);
        border-radius: 12px;
        border: 1px solid rgba(251, 191, 36, 0.2);
    }

    .quick-tips h4 {
        margin: 0 0 0.5rem 0;
        color: var(--gold);
        font-size: 0.9rem;
    }

    .quick-tips ul {
        list-style: none;
        padding: 0;
        margin: 0;
        font-size: 0.85rem;
        color: var(--text-secondary);
    }

    .quick-tips li {
        margin-bottom: 0.5rem;
    }

    /* Seed Selector Modal */
    .seed-selector {
        max-width: 600px;
        width: 90vw;
    }

    .seed-selector h2 {
        margin: 0 0 0.5rem 0;
    }

    .seed-grid {
        display: grid;
        grid-template-columns: repeat(auto-fill, minmax(140px, 1fr));
        gap: 1rem;
        margin: 1.5rem 0;
        max-height: 400px;
        overflow-y: auto;
    }

    .seed-item {
        display: flex;
        flex-direction: column;
        align-items: center;
        gap: 0.5rem;
        padding: 1rem;
        background: var(--bg-tertiary);
        border: 2px solid transparent;
        border-radius: 12px;
        cursor: pointer;
        transition: all 0.2s ease;
    }

    .seed-item:hover:not(:disabled) {
        transform: translateY(-4px);
        box-shadow: 0 8px 16px rgba(0, 0, 0, 0.3);
    }

    .seed-item:disabled {
        opacity: 0.5;
        cursor: not-allowed;
    }

    .seed-item.tier-1 {
        border-color: var(--tier-1);
    }
    .seed-item.tier-2 {
        border-color: var(--tier-2);
    }
    .seed-item.tier-3 {
        border-color: var(--tier-3);
    }
    .seed-item.tier-4 {
        border-color: var(--tier-4);
    }
    .seed-item.tier-5 {
        border-color: var(--tier-5);
    }

    .seed-item .icon {
        font-size: 2rem;
    }

    .seed-item .name {
        font-weight: 600;
    }

    .seed-item .price {
        font-size: 0.9rem;
    }

    .seed-item .info {
        font-size: 0.75rem;
        color: var(--text-muted);
    }

    @keyframes spin {
        to {
            transform: rotate(360deg);
        }
    }
</style>
