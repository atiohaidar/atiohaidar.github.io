<script lang="ts">
    import { onMount, onDestroy } from "svelte";
    import { get } from "svelte/store";
    import { goto } from "$app/navigation";
    import { base } from "$app/paths";
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

    // Import new API functions
    import {
        placeItem,
        removeItem,
        useItem,
        getInventory,
        type InventoryItem,
        getShopItems,
        type ShopItem,
        expandLand,
        clearAuthToken,
    } from "$lib/api";

    let loading = true;
    let isBuildMode = false; // Sekarang bertindak sebagai "Inventaris/Mode Bangun"
    let inventoryItems: InventoryItem[] = [];

    let selectedBuildItem: InventoryItem | null = null;
    let allShopItems: ShopItem[] = [];

    let showBuildSelector = false;
    let isoMode = true; // Toggle for debug if needed, default true

    let localGameLoopInterval: ReturnType<typeof setInterval> | null = null;

    const MAX_PLOTS = 30; // Limit total plots to prevent clutter

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
        loadAllShopItems(); // Load background data

        // Set loading to false after data is loaded
        loading = false;

        // Start game loop for real-time updates (server sync every 60s)
        startGameLoop(async () => {
            await refreshGameData();
        }, 60000);

        // Start local loop for smooth animations (every 1s)
        startLocalGameLoop();

        // Keyboard shortcuts (only in browser)
        if (browser) {
            window.addEventListener("keydown", handleKeydown);
        }
    });

    onDestroy(() => {
        stopGameLoop();
        stopLocalGameLoop();
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

        if (plotsRes.success && plotsRes.data) {
            farmPlots.set(plotsRes.data);
        }
    }

    async function refreshGameData() {
        const [plotsRes] = await Promise.all([getFarmPlots()]);

        if (plotsRes.success && plotsRes.data) {
            farmPlots.set(plotsRes.data);
        }
    }

    async function refreshProfile() {
        const res = await getProfile();
        if (res.success && res.data) {
            profile.set(res.data);
        }
    }

    function handlePlotClick(plotIndex: number, plotData?: FarmPlot) {
        if (isBuildMode) {
            handleBuildModeClick(plotIndex, plotData);
            return;
        }

        if (!plotData) {
            // Empty plot - show seed selector
            selectedPlot.set(plotIndex);
            showSeedSelector.set(true);
            return;
        }

        if (plotData.placed_item_id) {
            // Can't interact with decorations in normal mode yet (maybe later implement 'use')
            showToast(
                "Beralih ke Mode Bangun untuk memindahkan item ini",
                "info",
            );
            return;
        }

        if (!plotData.crop_id) {
            // Empty plot (no crop)
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

    async function handleBuildModeClick(
        plotIndex: number,
        plotData?: FarmPlot,
    ) {
        // If removing
        if (plotData?.placed_item_id) {
            const result = await removeItem(plotIndex);
            if (result.success) {
                showToast("Item dihapus! 📦", "success");
                await refreshGameData();
                await loadInventory(); // Refresh inventory count
            } else {
                showToast(result.error || "Gagal menghapus", "error");
            }
            return;
        }

        // If placing
        if (selectedBuildItem) {
            // Check if plot is empty
            if (plotData?.crop_id) {
                showToast("Tidak dapat meletakkan di atas tanaman!", "error");
                return;
            }

            const result = await placeItem(
                plotIndex,
                selectedBuildItem.item_id,
            );
            if (result.success) {
                showToast("Item diletakkan! 🏗️", "success");
                await refreshGameData();
                await loadInventory(); // Refresh inventory count

                // Check if we still have this item
                if (selectedBuildItem.quantity <= 1) {
                    selectedBuildItem = null; // Deselect if ran out
                } else {
                    selectedBuildItem.quantity--; // Visually decrement
                }
            } else {
                showToast(result.error || "Gagal meletakkan", "error");
            }
            return;
        }

        showToast("Pilih item untuk diletakkan terlebih dahulu!", "info");
        showBuildSelector = true;
    }

    async function loadInventory() {
        const res = await getInventory();
        if (res.success && res.data) {
            // Filter only placeable items (decorations and upgrades)
            inventoryItems = res.data.filter(
                (i) =>
                    i.quantity > 0 &&
                    ["decoration", "upgrade"].includes(i.item?.type || ""),
            );
        }
    }

    function toggleBuildMode() {
        isBuildMode = !isBuildMode;
        if (isBuildMode) {
            loadInventory();
            showBuildSelector = true;
        } else {
            selectedBuildItem = null;
            showBuildSelector = false;
        }
    }

    function selectBuildItem(item: InventoryItem) {
        selectedBuildItem = item;
        showBuildSelector = false;
        showToast(
            `Dipilih ${item.item?.name}. Klik petak untuk meletakkan.`,
            "info",
        );
    }

    async function handleWater(plotIndex: number) {
        const result = await waterPlot(plotIndex);

        if (result.success) {
            showToast("Disiram! 💧 Pertumbuhan +10%", "info");
            await refreshGameData();
        } else {
            showToast(result.error || "Gagal menyiram", "error");
        }
    }

    async function handleHarvest(plotIndex: number) {
        const result = await harvestPlot(plotIndex);

        if (result.success && result.data) {
            const { gold, xp, crop, leveledUp, newLevel } = result.data;

            showToast(`+${gold} gold, +${xp} XP`, "gold");

            if (leveledUp) {
                showToast(`🎉 Naik Level! Sekarang level ${newLevel}`, "level");
            }

            await refreshGameData();
            await refreshProfile();
        } else {
            showToast(result.error || "Gagal memanen", "error");
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
                `Dipanen ${harvested_count}! +${total_gold} emas, +${total_xp} XP`,
                "gold",
            );

            if (leveled_up) {
                showToast(
                    `🎉 Naik Level! Sekarang level ${new_level}`,
                    "level",
                );
            }

            await refreshGameData();
            await refreshProfile();
        } else {
            showToast(result.error || "Tidak ada tanaman siap panen", "error");
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

    // Helper to find icon for placed item ID
    // We might need to fetch all shop items to have this mapping if not in inventory
    // Currently we only load Profile, Crops, Plots. We should probably load Shop Items too or store them.
    // Ideally we store a map of itemId -> icon.
    // For now, let's try to find it in inventoryItems (if loaded) or fallback.
    // Better yet, let's load all shop items on mount so we have the metadata.

    // Quick fix: Add shop items to loadGameData
    async function loadAllShopItems() {
        const res = await getShopItems();
        if (res.success && res.data) {
            allShopItems = res.data;
        }
    }

    // Call this in onMount

    function getIconForItemId(itemId: string): string {
        const item = allShopItems.find((i) => i.id === itemId);
        return item?.icon || "📦";
    }

    // Land Expansion
    let plotsUnlocked = 9;
    $: plotsUnlocked = $profile?.plots_unlocked || 9;

    let nextExpansionCost = 500;
    $: nextExpansionCost = Math.floor(
        500 * Math.pow(1.5, Math.max(0, plotsUnlocked - 9)),
    );

    async function handleExpandLand() {
        if (($profile?.gold || 0) < nextExpansionCost) {
            showToast(
                `Butuh ${nextExpansionCost} emas untuk memperluas!`,
                "error",
            );
            return;
        }

        const result = await expandLand();
        if (result.success && result.data) {
            showToast(
                `Lahan diperluas! Anda sekarang memiliki ${result.data.new_plots_unlocked} petak.`,
                "success",
            );
            await refreshProfile();
        } else {
            showToast(result.error || "Gagal memperluas", "error");
        }
    }

    async function handleLandClick(e: MouseEvent) {
        if (!isBuildMode && $selectedPlot === null) {
            // If not specialized mode, maybe show info?
            return;
        }

        if (isBuildMode && selectedBuildItem) {
            // Calculate percentage coordinates
            // Assuming .farm-land is the target or currentTarget
            const rect = (
                e.currentTarget as HTMLElement
            ).getBoundingClientRect();
            const x = Math.min(
                100,
                Math.max(0, ((e.clientX - rect.left) / rect.width) * 100),
            );
            const y = Math.min(
                100,
                Math.max(0, ((e.clientY - rect.top) / rect.height) * 100),
            );

            // Place item at x, y
            // We pass undefined as plotIndex to create new plot
            const result = await placeItem(
                undefined,
                selectedBuildItem.item_id,
                x,
                y,
            );
            if (result.success) {
                showToast("Item diletakkan! 🏗️", "success");
                await refreshGameData();
                await loadInventory();

                if (selectedBuildItem.quantity <= 1) {
                    selectedBuildItem = null;
                } else {
                    selectedBuildItem.quantity--;
                }
            } else {
                showToast(result.error || "Gagal", "error");
            }
        }
    }

    // Function to handle planting on empty ground click?
    // Usually planting requires selecting a plot.
    // In free placement, clicking IS creating a plot.
    // But we need to distinguish "Planting Mode" vs "Building Mode".
    // For now, let's say "Clicking Empty Land" opens Seed Selector if NOT in Build Mode?
    // And selecting seed then asks "Where to plant?" or we click Land to Plant directly?
    // "Click Land -> Open Selector -> Plant" is standard.
    // The "handleLandClick" handles the click location.

    // We need to store the clicked coordinates if we open selector.
    let pendingClick: { x: number; y: number } | null = null;

    function onLandClick(e: MouseEvent) {
        // Ignore if clicking on existing plot or obstacle (handled by stopPropagation usually)
        if (e.target !== e.currentTarget) return;

        const rect = (e.currentTarget as HTMLElement).getBoundingClientRect();
        const x = Math.min(
            100,
            Math.max(0, ((e.clientX - rect.left) / rect.width) * 100),
        );
        const y = Math.min(
            100,
            Math.max(0, ((e.clientY - rect.top) / rect.height) * 100),
        );

        if (isBuildMode && selectedBuildItem) {
            placeItemAt(x, y);
            return;
        }

        if (!isBuildMode) {
            // Check max plots based on unlocked
            // Use local plotsUnlocked variable which is reactive
            if ($farmPlots.length >= plotsUnlocked) {
                showToast(
                    `Lahan penuh! (${$farmPlots.length}/${plotsUnlocked}) Perluas lahan Anda untuk menanam lebih banyak.`,
                    "error",
                );
                return;
            }

            // Open seed selector for new crop
            pendingClick = { x, y };
            showSeedSelector.set(true);
        }
    }

    async function placeItemAt(x: number, y: number) {
        if (!selectedBuildItem) return;
        const result = await placeItem(
            undefined,
            selectedBuildItem.item_id,
            x,
            y,
        );
        if (result.success) {
            showToast("Item diletakkan! 🏗️", "success");
            await refreshGameData();
            await loadInventory();
            if (selectedBuildItem.quantity <= 1) selectedBuildItem = null;
            else selectedBuildItem.quantity--;
        } else {
            showToast(result.error || "Gagal", "error");
        }
    }

    // Override handlePlant to use pendingClick if available
    async function handlePlant(cropId: string) {
        // If we have a pending click (new plot)
        if (pendingClick) {
            showSeedSelector.set(false);
            const { x, y } = pendingClick;
            pendingClick = null;

            const result = await plantCrop(undefined, cropId, x, y);
            if (result.success) {
                showToast("Ditanam! 🌱", "success");
                await refreshGameData();
                await refreshProfile();
            } else {
                showToast(result.error || "Gagal", "error");
            }
            return;
        }

        // Existing plot logic
        const plotIndex = $selectedPlot;
        if (plotIndex === null) return;

        showSeedSelector.set(false);
        selectedPlot.set(null);

        const result = await plantCrop(plotIndex, cropId); // x,y undefined

        if (result.success) {
            const crop = $crops.find((c) => c.id === cropId);
            showToast(`Menanam ${crop?.name || "tanaman"}! 🌱`, "success");
            await refreshGameData();
            await refreshProfile();
        } else {
            showToast(result.error || "Gagal menanam", "error");
        }
    }

    // Helper for visual fallback of legacy plots
    function getPlotStyle(plot: FarmPlot) {
        let x = plot.x;
        let y = plot.y;

        // Fallback if no coordinates (legacy data being 0 or undefined)
        if (!x && !y) {
            const i = plot.plot_index ?? 0;
            // Create a 4-column grid layout fallback
            const cols = 4;
            const col = i % cols;
            const row = Math.floor(i / cols);

            // Percentage spacing
            x = 15 + col * 20; // Starts at 15%, steps 20%
            y = 15 + row * 20; // Starts at 15%, steps 20%
        }

        return `position: absolute; left: ${x}%; top: ${y}%; z-index: ${Math.floor(y || 0)};`;
    }

    // ==========================================
    // CLIENT SIDE SIMULATION
    // ==========================================
    function startLocalGameLoop() {
        stopLocalGameLoop();
        localGameLoopInterval = setInterval(updateCropsLocal, 1000);
    }

    function stopLocalGameLoop() {
        if (localGameLoopInterval) {
            clearInterval(localGameLoopInterval);
            localGameLoopInterval = null;
        }
    }

    function updateCropsLocal() {
        // Run simulation to update progress bars without hitting server
        const now = Date.now();
        const allCrops = get(crops);

        farmPlots.update((currentPlots) => {
            return currentPlots.map((plot) => {
                // Skip if no crop or already ready (unless we want to verify locally)
                if (!plot.crop_id || !plot.planted_at || plot.ready)
                    return plot;

                // Find crop details (either embedded or from store)
                const crop =
                    plot.crop || allCrops.find((c) => c.id === plot.crop_id);
                if (!crop) return plot;

                const plantedTime = new Date(plot.planted_at).getTime();
                const durationMs = crop.grow_time_seconds * 1000;

                // Apply water bonus logic (10% faster = / 1.1 duration)
                // This MUST match backend logic
                const effectiveDuration = plot.watered
                    ? durationMs / 1.1
                    : durationMs;

                const elapsed = now - plantedTime;

                // Calculate new state
                let newPercent = (elapsed / effectiveDuration) * 100;
                let newRemaining = Math.max(
                    0,
                    Math.ceil((effectiveDuration - elapsed) / 1000),
                );

                // Cap at 100%
                if (newPercent >= 100) {
                    newPercent = 100;
                    newRemaining = 0;
                    // Optimistically mark ready so UI turns green
                    // Backend will verify on harvest
                    return {
                        ...plot,
                        growth_percent: 100,
                        time_remaining: 0,
                        ready: true,
                    };
                }

                return {
                    ...plot,
                    growth_percent: newPercent,
                    time_remaining: newRemaining,
                };
            });
        });
    }

    function handleLogout() {
        clearAuthToken();
        isLoggedIn.set(false);
        goto("/");
    }
</script>

<svelte:head>
    <title>Mulai Bercocok tanam</title>
</svelte:head>

<div class="game-page">
    <!-- Game Area -->
    <div class="game-container">
        {#if loading}
            <div class="loading-overlay">
                <div class="loading-spinner"></div>
                <p>Memuat kebun...</p>
            </div>
        {:else}
            <!-- HTML Farm Grid Overlay for reliable click handling -->
            <!-- Isometric Farm Land -->
            <div class="farm-land-container">
                <h2 class="farm-title absolute-top">🌾 Bercocok tanam 🌾</h2>
                <div class="land-usage-badge top-right">
                    <span
                        >Tanaman: {$farmPlots.filter((p) => p.crop_id).length} /
                        {plotsUnlocked}</span
                    >
                </div>

                <!-- Farm Land Area -->
                <div
                    class="farm-land"
                    on:click={onLandClick}
                    on:keydown={() => {}}
                    role="button"
                    tabindex="0"
                >
                    <!-- Background / Grass -->

                    <!-- Plots -->
                    {#each $farmPlots as plot (plot.id || plot.plot_index)}
                        <button
                            class="map-object plot-cell"
                            class:has-crop={plot.crop_id}
                            class:ready={plot.ready}
                            class:watered={plot.watered}
                            style={getPlotStyle(plot)}
                            on:click|stopPropagation={() =>
                                handlePlotClick(plot.plot_index, plot)}
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
                            {:else if plot.placed_item_id}
                                <span class="crop-icon"
                                    >{getIconForItemId(
                                        plot.placed_item_id,
                                    )}</span
                                >
                                {#if isBuildMode}
                                    <span class="remove-badge">❌</span>
                                {/if}
                            {:else}
                                <!-- Empty plot (hoed ground) -->
                                <!-- Empty plot (invisible unless in build mode) -->
                                <div
                                    class="soil-patch"
                                    style="opacity: {isBuildMode ? 0.7 : 0.4};"
                                ></div>
                            {/if}
                        </button>
                    {/each}
                </div>

                <p class="farm-hint">
                    {#if isBuildMode}
                        Pilih item dan klik di mana saja untuk membangun!
                    {:else}
                        Klik lahan kosong untuk menanam. Klik tanaman untuk
                        memanen/menyiram.
                    {/if}
                </p>

                <div class="land-usage-badge">
                    <span
                        >Tanaman: {$farmPlots.filter((p) => p.crop_id).length} /
                        {plotsUnlocked}</span
                    >
                </div>
            </div>
        {/if}
    </div>

    <!-- Side Panel -->
    <div class="side-panel">
        <h3>🌾 Aksi Cepat</h3>

        <button
            class="btn w-full"
            class:btn-primary={!isBuildMode}
            class:btn-warning={isBuildMode}
            on:click={toggleBuildMode}
        >
            {isBuildMode ? "❌ Keluar Mode Bangun" : "🔨 Mode Bangun"}
        </button>

        {#if !isBuildMode}
            <button class="btn btn-primary w-full" on:click={handleHarvestAll}>
                🌾 Panen Semua (H)
            </button>
        {:else}
            <div class="build-controls">
                {#if selectedBuildItem}
                    <div class="selected-item">
                        <span>Dipilih: {selectedBuildItem.item?.name}</span>
                        <button
                            class="btn-xs"
                            on:click={() => (showBuildSelector = true)}
                            >Ganti</button
                        >
                    </div>
                {:else}
                    <button
                        class="btn btn-secondary w-full"
                        on:click={() => (showBuildSelector = true)}
                    >
                        Pilih Item untuk Diletakkan
                    </button>
                {/if}
            </div>
        {/if}

        <!-- Navigation Links -->
        <div class="nav-links">
            <a href="{base}/shop" class="nav-link">🛒 Toko</a>
            <a href="{base}/inventory" class="nav-link">📦 Inventaris</a>
            <a href="{base}/profile" class="nav-link">👤 Profil</a>
            <a href="{base}/prestige" class="nav-link">✨ Prestise</a>
            <a href="{base}/leaderboard" class="nav-link">🏆 Peringkat</a>
            <button class="nav-link logout-link" on:click={handleLogout}
                >🚪 Keluar</button
            >
        </div>

        <div class="stats">
            <div class="stat">
                <span class="label">Level</span>
                <span class="value">{$profile?.level || 1}</span>
            </div>
            <div class="stat">
                <span class="label">Emas</span>
                <span class="value text-gold"
                    >{$profile?.gold?.toLocaleString() || 0}</span
                >
            </div>
            <div class="stat">
                <span class="label">Permata</span>
                <span class="value text-gems">{$profile?.gems || 0}</span>
            </div>
            <div class="stat">
                <span class="label">Panen</span>
                <span class="value">{$profile?.total_harvests || 0}</span>
            </div>
            <div class="stat">
                <span class="label">Petak</span>
                <span class="value"
                    >{$farmPlots.filter((p) => p.crop_id).length} / {plotsUnlocked}</span
                >
            </div>

            <button
                class="btn btn-secondary w-full mt-2"
                on:click={handleExpandLand}
                disabled={($profile?.gold || 0) < nextExpansionCost}
            >
                Perluas Lahan ({nextExpansionCost}g)
            </button>
        </div>

        <div class="quick-tips">
            <h4>Tips</h4>
            <ul>
                <li>💧 Siram tanaman agar tumbuh 10% lebih cepat</li>
                <li>🌾 Tekan H untuk memanen semua tanaman siap panen</li>
                <li>⬆️ Tanaman tingkat tinggi = lebih banyak emas</li>
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
            <h2>🌱 Pilih Benih</h2>
            <p class="text-muted">Pilih apa yang ingin ditanam di petak ini</p>

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
                Batal
            </button>
        </div>
    </div>
{/if}

<!-- Build Item Selector Modal -->
{#if showBuildSelector && isBuildMode}
    <div
        class="modal-overlay"
        on:click={() => (showBuildSelector = false)}
        role="button"
        tabindex="0"
    >
        <div class="modal seed-selector" on:click|stopPropagation role="dialog">
            <h2>🔨 Pilih Item untuk Dibangun</h2>
            <p class="text-muted">Dekorasi & Peningkatan</p>

            {#if inventoryItems.length === 0}
                <div class="empty-state">
                    <p>Tidak ada item yang dapat diletakkan.</p>
                    <a
                        href="/shop"
                        class="btn btn-primary"
                        on:click={() => (isBuildMode = false)}>Pergi ke Toko</a
                    >
                </div>
            {:else}
                <div class="seed-grid">
                    {#each inventoryItems as inv}
                        <button
                            class="seed-item"
                            on:click={() => selectBuildItem(inv)}
                        >
                            <span class="icon">{inv.item?.icon || "📦"}</span>
                            <span class="name">{inv.item?.name}</span>
                            <span class="info">Dimiliki: {inv.quantity}</span>
                        </button>
                    {/each}
                </div>
            {/if}

            <button
                class="btn btn-secondary"
                on:click={() => (showBuildSelector = false)}
            >
                Batal
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

    /* Farm Land */
    .farm-land-container {
        display: flex;
        flex-direction: column;
        align-items: center;
        width: 100%;
        height: 100%;
        overflow: hidden;
    }

    .farm-land {
        width: 80%;
        height: 60%;
        background: #5d4037; /* Soil color */
        border: 4px solid #3e2723;
        border-radius: 16px;
        position: relative;
        box-shadow: inset 0 0 50px rgba(0, 0, 0, 0.5);
        margin-top: 1rem;
        cursor: crosshair;
    }

    .absolute-top {
        margin-bottom: 1rem;
        z-index: 1000;
    }

    .map-object {
        position: absolute;
        width: 64px;
        height: 64px;
        transform: translate(-50%, -50%); /* Center on coordinate */
        display: flex;
        align-items: center;
        justify-content: center;
        background: transparent;
        border: none;
        cursor: pointer;
        transition: transform 0.1s;
    }

    .map-object:hover {
        transform: translate(-50%, -50%) scale(1.1);
        z-index: 1000 !important; /* Pop to front on hover */
    }

    .plot-cell {
        /* Override previous plot-cell styles for map objects */
        background: rgba(255, 255, 255, 0.1);
        border: 2px dashed rgba(255, 255, 255, 0.2);
        border-radius: 12px;
    }

    .plot-cell.has-crop {
        background: transparent;
        border: none;
    }

    .obstacle {
        font-size: 2.5rem;
    }

    .obj-icon {
        font-size: 2.5rem;
        filter: drop-shadow(0 4px 4px rgba(0, 0, 0, 0.3));
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
        overflow-y: auto;
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

    .remove-badge {
        position: absolute;
        top: -8px;
        right: -8px;
        background: #ff4444;
        border-radius: 50%;
        width: 20px;
        height: 20px;
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 12px;
        border: 2px solid white;
        z-index: 10;
        animation: pulse-red 1s infinite;
    }

    @keyframes pulse-red {
        0% {
            transform: scale(1);
        }
        50% {
            transform: scale(1.1);
        }
        100% {
            transform: scale(1);
        }
    }

    .btn-warning {
        background: #ff9800;
        color: white;
    }
    .btn-warning:hover {
        background: #f57c00;
    }

    .land-usage-badge {
        position: absolute;
        bottom: 5%;
        left: 50%;
        transform: translateX(-50%);
        background: rgba(0, 0, 0, 0.7);
        color: white;
        padding: 8px 16px;
        border-radius: 20px;
        font-weight: bold;
        backdrop-filter: blur(4px);
        border: 1px solid rgba(255, 255, 255, 0.2);
        z-index: 1000; /* Ensure above farm-land */
        font-size: 1rem;
        box-shadow: 0 4px 6px rgba(0, 0, 0, 0.3);
        pointer-events: none; /* Let clicks pass through if needed */
    }

    .build-controls {
        background: var(--bg-tertiary);
        padding: 1rem;
        border-radius: 8px;
        border: 1px solid rgba(255, 255, 255, 0.1);
    }

    .selected-item {
        display: flex;
        flex-direction: column;
        gap: 0.5rem;
        align-items: center;
        text-align: center;
        font-size: 0.9rem;
        color: var(--gold);
    }

    .btn-xs {
        padding: 0.25rem 0.5rem;
        font-size: 0.8rem;
        background: rgba(255, 255, 255, 0.1);
        border: none;
        border-radius: 4px;
        color: white;
        cursor: pointer;
    }

    .empty-state {
        text-align: center;
        padding: 2rem;
        color: var(--text-muted);
    }

    /* Farm Land */
    .farm-land-container {
        display: flex;
        flex-direction: column;
        align-items: center;
        width: 100%;
        height: 100%;
        overflow: hidden;
    }

    .farm-land {
        width: 80%;
        height: 60%;
        background: #5d4037; /* Soil color */
        border: 4px solid #3e2723;
        border-radius: 16px;
        position: relative;
        box-shadow: inset 0 0 50px rgba(0, 0, 0, 0.5);
        margin-top: 1rem;
        cursor: crosshair;
    }

    .absolute-top {
        margin-bottom: 1rem;
        z-index: 1000;
        pointer-events: none;
    }

    .map-object {
        position: absolute;
        width: 64px;
        height: 64px;
        transform: translate(-50%, -50%); /* Center on coordinate */
        display: flex;
        align-items: center;
        justify-content: center;
        background: transparent;
        border: none;
        cursor: pointer;
        transition: transform 0.1s;
    }

    .map-object:hover {
        transform: translate(-50%, -50%) scale(1.1);
        z-index: 1000 !important; /* Pop to front on hover */
    }

    .plot-cell {
        /* Transparent by default */
        background: transparent;
        border: none;
        border-radius: 12px;
    }

    .plot-cell:hover {
        /* Subtle highlight on hover */
        background: rgba(255, 255, 255, 0.1);
        border: 2px dashed rgba(255, 255, 255, 0.2);
    }

    .plot-cell.has-crop {
        background: transparent;
        border: none;
    }

    .obstacle {
        font-size: 2.5rem;
    }

    .obj-icon {
        font-size: 2.5rem;
        filter: drop-shadow(0 4px 4px rgba(0, 0, 0, 0.3));
    }
    .soil-patch {
        width: 100%;
        height: 100%;
        background: #4e342e;
        border-radius: 8px;
        opacity: 0.5;
    }
</style>
