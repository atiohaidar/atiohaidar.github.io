<script lang="ts">
    import { onMount } from "svelte";
    import { goto } from "$app/navigation";
    import {
        getAuthToken,
        getInventory,
        getProfile,
        type InventoryItem,
    } from "$lib/api";
    import { profile, showToast, isLoggedIn } from "$lib/stores";

    let inventory: InventoryItem[] = [];
    let loading = true;
    let selectedCategory = "all";

    const categories = [
        { id: "all", name: "All", icon: "📦" },
        { id: "tool", name: "Tools", icon: "🔧" },
        { id: "upgrade", name: "Upgrades", icon: "⬆️" },
        { id: "decoration", name: "Decorations", icon: "🌸" },
        { id: "booster", name: "Boosters", icon: "⚡" },
    ];

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
        const [invRes, profileRes] = await Promise.all([
            getInventory(),
            getProfile(),
        ]);

        if (invRes.success && invRes.data) {
            inventory = invRes.data;
        }
        if (profileRes.success && profileRes.data) {
            profile.set(profileRes.data);
        }
        loading = false;
    }

    function getItemColor(type: string): string {
        const colors: Record<string, string> = {
            tool: "#3b82f6",
            upgrade: "#22c55e",
            decoration: "#ec4899",
            booster: "#f59e0b",
        };
        return colors[type] || "#64748b";
    }

    function getEffectDescription(effect: string | null): string {
        if (!effect) return "No effect";
        try {
            const e = JSON.parse(effect);
            switch (e.type) {
                case "water_all":
                    return `Water ${e.area} plots at once`;
                case "plant_speed":
                    return `Plant ${e.value}x faster`;
                case "harvest_all":
                    return "Harvest all ready crops";
                case "auto_water":
                    return `Auto-water ${e.area} plots`;
                case "auto_harvest":
                    return "Auto-harvest ready crops";
                case "auto_replant":
                    return "Auto-replant after harvest";
                case "growth_speed":
                    return `+${(e.value - 1) * 100}% growth speed`;
                case "double_harvest_chance":
                    return `${e.value * 100}% double harvest`;
                default:
                    return "Special effect";
            }
        } catch {
            return "Special effect";
        }
    }

    $: filteredItems =
        selectedCategory === "all"
            ? inventory
            : inventory.filter((inv) => inv.item?.type === selectedCategory);
    $: equippedItems = inventory.filter((inv) => inv.equipped);
</script>

<svelte:head>
    <title>Bercocok Tanam - Inventory</title>
</svelte:head>

<div class="inventory-page">
    <header class="header">
        <a href="/play" class="back-btn">← Back to Farm</a>
        <h1>📦 Inventory</h1>
        <div class="item-count">{inventory.length} items</div>
    </header>

    <!-- Equipped Items -->
    {#if equippedItems.length > 0}
        <div class="equipped-section">
            <h2>⚡ Active Equipment</h2>
            <div class="equipped-grid">
                {#each equippedItems as inv}
                    <div
                        class="equipped-item"
                        style="--item-color: {getItemColor(
                            inv.item?.type || '',
                        )}"
                    >
                        <span class="item-icon">{inv.item?.icon || "📦"}</span>
                        <div class="item-info">
                            <span class="item-name"
                                >{inv.item?.name || "Unknown"}</span
                            >
                            <span class="item-effect"
                                >{getEffectDescription(
                                    inv.item?.effect || null,
                                )}</span
                            >
                        </div>
                    </div>
                {/each}
            </div>
        </div>
    {/if}

    <div class="categories">
        {#each categories as cat}
            <button
                class="category-btn"
                class:active={selectedCategory === cat.id}
                on:click={() => (selectedCategory = cat.id)}
            >
                <span>{cat.icon}</span>
                <span>{cat.name}</span>
            </button>
        {/each}
    </div>

    {#if loading}
        <div class="loading">
            <div class="spinner"></div>
            <p>Loading inventory...</p>
        </div>
    {:else}
        <div class="inventory-grid">
            {#each filteredItems as inv}
                <div
                    class="inventory-item"
                    style="--item-color: {getItemColor(inv.item?.type || '')}"
                >
                    <div class="item-icon-lg">{inv.item?.icon || "📦"}</div>
                    <h3 class="item-name">{inv.item?.name || "Unknown"}</h3>
                    <div class="item-type">
                        {(inv.item?.type || "item").toUpperCase()}
                    </div>
                    <p class="item-effect">
                        {getEffectDescription(inv.item?.effect || null)}
                    </p>
                    <div class="item-quantity">x{inv.quantity}</div>
                    {#if inv.equipped}
                        <div class="equipped-badge">✓ Equipped</div>
                    {/if}
                </div>
            {/each}
        </div>

        {#if filteredItems.length === 0}
            <div class="empty-state">
                <p>No items in this category</p>
                <a href="/shop" class="shop-link">Visit Shop →</a>
            </div>
        {/if}
    {/if}
</div>

<style>
    .inventory-page {
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
        flex-wrap: wrap;
        gap: 1rem;
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
    .item-count {
        color: var(--text-muted);
    }

    .equipped-section {
        background: var(--bg-secondary);
        border-radius: 16px;
        padding: 1.5rem;
        margin-bottom: 2rem;
        border: 2px solid var(--gold);
    }

    .equipped-section h2 {
        margin: 0 0 1rem 0;
        font-size: 1.25rem;
    }

    .equipped-grid {
        display: flex;
        flex-wrap: wrap;
        gap: 1rem;
    }

    .equipped-item {
        display: flex;
        align-items: center;
        gap: 0.75rem;
        background: var(--bg-tertiary);
        padding: 0.75rem 1rem;
        border-radius: 12px;
        border-left: 4px solid var(--item-color);
    }

    .equipped-item .item-icon {
        font-size: 1.5rem;
    }
    .equipped-item .item-name {
        font-weight: 600;
    }
    .equipped-item .item-effect {
        color: var(--text-muted);
        font-size: 0.8rem;
    }

    .categories {
        display: flex;
        gap: 0.75rem;
        margin-bottom: 2rem;
        flex-wrap: wrap;
    }

    .category-btn {
        display: flex;
        align-items: center;
        gap: 0.5rem;
        padding: 0.75rem 1.25rem;
        background: var(--bg-secondary);
        border: 2px solid transparent;
        border-radius: 12px;
        color: var(--text-secondary);
        cursor: pointer;
        transition: all 0.2s;
    }

    .category-btn:hover {
        background: var(--bg-tertiary);
        color: var(--text-primary);
    }

    .category-btn.active {
        border-color: var(--gold);
        color: var(--gold);
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

    .inventory-grid {
        display: grid;
        grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
        gap: 1.5rem;
    }

    .inventory-item {
        background: var(--bg-secondary);
        border-radius: 16px;
        padding: 1.5rem;
        display: flex;
        flex-direction: column;
        align-items: center;
        text-align: center;
        border: 2px solid var(--item-color);
        position: relative;
        transition: all 0.2s;
    }

    .inventory-item:hover {
        transform: translateY(-4px);
        box-shadow: 0 8px 24px rgba(0, 0, 0, 0.3);
    }

    .item-icon-lg {
        font-size: 3rem;
        margin-bottom: 0.5rem;
    }
    .item-name {
        margin: 0 0 0.5rem 0;
        font-size: 1.1rem;
    }
    .item-type {
        font-size: 0.7rem;
        padding: 0.25rem 0.75rem;
        background: var(--item-color);
        color: white;
        border-radius: 999px;
        margin-bottom: 0.5rem;
    }
    .item-effect {
        color: var(--text-muted);
        font-size: 0.85rem;
        margin: 0;
    }
    .item-quantity {
        position: absolute;
        top: 0.75rem;
        right: 0.75rem;
        background: var(--bg-tertiary);
        padding: 0.25rem 0.5rem;
        border-radius: 6px;
        font-weight: 600;
        font-size: 0.8rem;
    }

    .equipped-badge {
        margin-top: 0.75rem;
        padding: 0.35rem 0.75rem;
        background: rgba(34, 197, 94, 0.2);
        color: #22c55e;
        border-radius: 6px;
        font-size: 0.8rem;
        font-weight: 600;
    }

    .empty-state {
        text-align: center;
        padding: 4rem;
        color: var(--text-muted);
    }

    .shop-link {
        color: var(--gold);
        text-decoration: none;
        display: inline-block;
        margin-top: 1rem;
    }

    @keyframes spin {
        to {
            transform: rotate(360deg);
        }
    }
</style>
