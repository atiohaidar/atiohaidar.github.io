<script lang="ts">
    import { onMount } from "svelte";
    import { goto } from "$app/navigation";
    import {
        getAuthToken,
        getShopItems,
        getProfile,
        purchaseItem,
        exchangeBalanceToGold,
        exchangeBalanceToGems,
        getGameConstants,
        getCrops,
        type ShopItem,
        type GameConstants,
        type Crop,
    } from "$lib/api";
    import { profile, showToast, isLoggedIn } from "$lib/stores";

    let shopItems: ShopItem[] = [];
    let crops: Crop[] = [];
    let loading = true;
    let selectedCategory = "all";
    let purchaseLoading: string | null = null;
    let topupLoading = false;
    let goldTopupAmount = 10;
    let gemTopupAmount = 100;
    let constants: GameConstants | null = null;
    let userBalance = 0;

    const categories = [
        { id: "all", name: "All", icon: "🛒" },
        { id: "seeds", name: "Seeds", icon: "🌱" },
        { id: "tool", name: "Tools", icon: "🔧" },
        { id: "upgrade", name: "Upgrades", icon: "⬆️" },
        { id: "decoration", name: "Decorations", icon: "🌸" },
        { id: "premium", name: "Premium", icon: "💎" },
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
        const [shopRes, profileRes, constantsRes, cropsRes] = await Promise.all(
            [getShopItems(), getProfile(), getGameConstants(), getCrops()],
        );

        if (shopRes.success && shopRes.data) {
            shopItems = shopRes.data;
        }
        if (profileRes.success && profileRes.data) {
            profile.set(profileRes.data);
        }
        if (constantsRes.success && constantsRes.data) {
            constants = constantsRes.data;
        }
        if (cropsRes.success && cropsRes.data) {
            crops = cropsRes.data;
        }

        // Fetch user balance from /api/users/:username
        try {
            const username = getUsernameFromToken();
            if (username) {
                const res = await fetch(`/api/users/${username}`, {
                    headers: { Authorization: `Bearer ${getAuthToken()}` },
                });
                const data = await res.json();
                console.log(data.user);
                if (data.success && data.user) {
                    userBalance = data.user.balance || 0;
                }
            }
        } catch (e) {
            console.error("Failed to fetch user balance:", e);
        }

        loading = false;
    }

    function getUsernameFromToken(): string {
        const token = getAuthToken();
        if (!token) return "";
        try {
            const payload = JSON.parse(atob(token.split(".")[1]));
            return payload.sub || "";
        } catch {
            return "";
        }
    }

    async function handleTopupGold() {
        if (
            topupLoading ||
            goldTopupAmount < 1 ||
            userBalance < goldTopupAmount
        )
            return;
        topupLoading = true;

        const result = await exchangeBalanceToGold(goldTopupAmount);
        topupLoading = false;

        if (result.success && result.data) {
            showToast(
                `Top up berhasil! +${result.data.gold_received} Gold 🪙`,
                "gold",
            );
            userBalance = result.data.new_balance;
            const profileRes = await getProfile();
            if (profileRes.success && profileRes.data) {
                profile.set(profileRes.data);
            }
        } else {
            showToast(result.error || "Top up gagal", "error");
        }
    }

    async function handleTopupGems() {
        if (
            topupLoading ||
            gemTopupAmount < 100 ||
            userBalance < gemTopupAmount
        )
            return;
        topupLoading = true;

        const result = await exchangeBalanceToGems(gemTopupAmount);
        topupLoading = false;

        if (result.success && result.data) {
            showToast(
                `Top up berhasil! +${result.data.gems_received} Gems 💎`,
                "success",
            );
            userBalance = result.data.new_balance;
            const profileRes = await getProfile();
            if (profileRes.success && profileRes.data) {
                profile.set(profileRes.data);
            }
        } else {
            showToast(result.error || "Top up gagal", "error");
        }
    }

    async function handlePurchase(item: ShopItem) {
        if (purchaseLoading) return;

        purchaseLoading = item.id;
        const result = await purchaseItem(item.id, 1);
        purchaseLoading = null;

        if (result.success && result.data) {
            showToast(`Purchased ${item.name}! 🎉`, "success");
            const profileRes = await getProfile();
            if (profileRes.success && profileRes.data) {
                profile.set(profileRes.data);
            }
        } else {
            showToast(result.error || "Purchase failed", "error");
        }
    }

    function canAfford(item: ShopItem): boolean {
        const gold = $profile?.gold || 0;
        const gems = $profile?.gems || 0;
        return gold >= item.price_gold && gems >= item.price_gems;
    }

    function getTierColor(type: string): string {
        const colors: Record<string, string> = {
            tool: "#3b82f6",
            upgrade: "#22c55e",
            decoration: "#ec4899",
            premium: "#a855f7",
            booster: "#f59e0b",
        };
        return colors[type] || "#64748b";
    }

    function getCropTierColor(tier: number): string {
        const colors: Record<number, string> = {
            1: "#22c55e", // Green - Common
            2: "#3b82f6", // Blue - Uncommon
            3: "#a855f7", // Purple - Rare
            4: "#f59e0b", // Orange - Epic
            5: "#ef4444", // Red - Legendary
        };
        return colors[tier] || "#64748b";
    }

    function getCropProfit(crop: Crop): number {
        return crop.sell_price - crop.seed_price;
    }

    function getCropROI(crop: Crop): number {
        return Math.round((getCropProfit(crop) / crop.seed_price) * 100);
    }

    function canAffordCrop(crop: Crop): boolean {
        return ($profile?.gold || 0) >= crop.seed_price;
    }

    function formatGrowTime(seconds: number): string {
        if (seconds < 60) return `${seconds}s`;
        if (seconds < 3600) return `${Math.floor(seconds / 60)}m`;
        return `${Math.floor(seconds / 3600)}h`;
    }

    $: filteredItems =
        selectedCategory === "all" || selectedCategory === "seeds"
            ? shopItems
            : shopItems.filter((item) => item.type === selectedCategory);
    $: filteredCrops =
        selectedCategory === "all" || selectedCategory === "seeds" ? crops : [];
    $: goldPreview = goldTopupAmount * (constants?.gold_per_balance || 10);
    $: gemsPreview = Math.floor(
        (gemTopupAmount / 100) * (constants?.gems_per_100_balance || 10),
    );
</script>

<svelte:head>
    <title>Harvest Haven - Shop</title>
</svelte:head>

<div class="shop-page">
    <header class="header">
        <a href="/play" class="back-btn">← Back to Farm</a>
        <h1>🛒 Shop</h1>
        <div class="currency-display">
            <span class="currency currency-balance"
                >💵 {userBalance.toLocaleString()} Saldo</span
            >
            <span class="currency currency-gold"
                >🪙 {$profile?.gold?.toLocaleString() || 0}</span
            >
            <span class="currency currency-gems">💎 {$profile?.gems || 0}</span>
        </div>
    </header>

    <!-- Top Up Section -->
    <div class="topup-section">
        <h2>💰 Top Up Currency</h2>
        <p class="topup-hint">Tukar saldo akun menjadi mata uang game</p>

        <div class="topup-cards">
            <!-- Gold Top Up -->
            <div class="topup-card gold-card">
                <h3>🪙 Top Up Gold</h3>
                <p class="rate">
                    1 Saldo = {constants?.gold_per_balance || 10} Gold
                </p>
                <div class="topup-input-group">
                    <input
                        type="number"
                        bind:value={goldTopupAmount}
                        min="1"
                        max={userBalance}
                        placeholder="Jumlah saldo"
                    />
                    <span class="preview"
                        >= {goldPreview.toLocaleString()} Gold</span
                    >
                </div>
                <button
                    class="btn btn-gold"
                    disabled={topupLoading ||
                        goldTopupAmount < 1 ||
                        userBalance < goldTopupAmount}
                    on:click={handleTopupGold}
                >
                    {topupLoading ? "Processing..." : "Top Up Gold"}
                </button>
            </div>

            <!-- Gems Top Up -->
            <div class="topup-card gems-card">
                <h3>💎 Top Up Gems</h3>
                <p class="rate">
                    100 Saldo = {constants?.gems_per_100_balance || 10} Gems
                </p>
                <div class="topup-input-group">
                    <input
                        type="number"
                        bind:value={gemTopupAmount}
                        min="100"
                        max={userBalance}
                        step="100"
                        placeholder="Jumlah saldo"
                    />
                    <span class="preview">= {gemsPreview} Gems</span>
                </div>
                <button
                    class="btn btn-gems"
                    disabled={topupLoading ||
                        gemTopupAmount < 100 ||
                        userBalance < gemTopupAmount}
                    on:click={handleTopupGems}
                >
                    {topupLoading ? "Processing..." : "Top Up Gems"}
                </button>
            </div>
        </div>
    </div>

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
            <p>Loading shop...</p>
        </div>
    {:else}
        <!-- Seeds Section -->
        {#if filteredCrops.length > 0}
            <div class="seeds-section">
                <h2>🌱 Seeds</h2>
                <p class="seeds-hint">
                    Buy seeds to plant on your farm. Higher tier = more profit!
                </p>
                <div class="seeds-grid">
                    {#each filteredCrops.sort((a, b) => a.tier - b.tier) as crop}
                        <div
                            class="seed-card"
                            style="--tier-color: {getCropTierColor(crop.tier)}"
                            class:locked={crop.unlock_level >
                                ($profile?.level || 1)}
                        >
                            <span class="seed-icon">{crop.icon || "🌱"}</span>
                            <div class="seed-info">
                                <h3>{crop.name}</h3>
                                <div class="seed-tier">Tier {crop.tier}</div>
                            </div>
                            <div class="seed-stats">
                                <div class="stat">
                                    <span class="label">Cost</span>
                                    <span class="value"
                                        >🪙 {crop.seed_price.toLocaleString()}</span
                                    >
                                </div>
                                <div class="stat">
                                    <span class="label">Sell</span>
                                    <span class="value"
                                        >🪙 {crop.sell_price.toLocaleString()}</span
                                    >
                                </div>
                                <div class="stat">
                                    <span class="label">Profit</span>
                                    <span class="value profit"
                                        >+{getCropProfit(crop).toLocaleString()}
                                        ({getCropROI(crop)}%)</span
                                    >
                                </div>
                                <div class="stat">
                                    <span class="label">Time</span>
                                    <span class="value"
                                        >⏱️ {formatGrowTime(
                                            crop.grow_time_seconds,
                                        )}</span
                                    >
                                </div>
                                <div class="stat">
                                    <span class="label">XP</span>
                                    <span class="value"
                                        >⭐ {crop.xp_reward}</span
                                    >
                                </div>
                            </div>
                            {#if crop.unlock_level > ($profile?.level || 1)}
                                <div class="locked-overlay">
                                    🔒 Level {crop.unlock_level}
                                </div>
                            {:else}
                                <div
                                    class="seed-status"
                                    class:affordable={canAffordCrop(crop)}
                                >
                                    {canAffordCrop(crop)
                                        ? "✓ Unlocked"
                                        : "💰 Need Gold"}
                                </div>
                            {/if}
                        </div>
                    {/each}
                </div>
            </div>
        {/if}

        <div class="shop-grid">
            {#each filteredItems as item}
                <div
                    class="shop-item"
                    style="--item-color: {getTierColor(item.type)}"
                >
                    <div class="item-icon">{item.icon || "📦"}</div>
                    <h3 class="item-name">{item.name}</h3>
                    <p class="item-desc">
                        {item.description || "No description"}
                    </p>
                    <div class="item-type">{item.type.toUpperCase()}</div>

                    <div class="item-price">
                        {#if item.price_gold > 0}
                            <span class="price-gold">🪙 {item.price_gold}</span>
                        {/if}
                        {#if item.price_gems > 0}
                            <span class="price-gems">💎 {item.price_gems}</span>
                        {/if}
                    </div>

                    {#if item.unlock_level > ($profile?.level || 1)}
                        <div class="locked">🔒 Level {item.unlock_level}</div>
                    {:else}
                        <button
                            class="btn btn-primary buy-btn"
                            disabled={!canAfford(item) ||
                                purchaseLoading === item.id}
                            on:click={() => handlePurchase(item)}
                        >
                            {#if purchaseLoading === item.id}
                                Buying...
                            {:else if !canAfford(item)}
                                Not Enough
                            {:else}
                                Buy
                            {/if}
                        </button>
                    {/if}
                </div>
            {/each}
        </div>

        {#if filteredItems.length === 0}
            <div class="empty-state">
                <p>No items in this category</p>
            </div>
        {/if}
    {/if}
</div>

<style>
    .shop-page {
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

    .currency-display {
        display: flex;
        gap: 1rem;
    }

    .currency {
        padding: 0.5rem 1rem;
        border-radius: 999px;
        font-weight: 600;
    }

    .currency-gold {
        background: rgba(251, 191, 36, 0.2);
        color: var(--gold);
    }

    .currency-gems {
        background: rgba(168, 85, 247, 0.2);
        color: var(--gems);
    }

    .currency-balance {
        background: rgba(34, 197, 94, 0.2);
        color: #22c55e;
    }

    /* Top Up Section */
    .topup-section {
        background: var(--bg-secondary);
        border-radius: 16px;
        padding: 1.5rem;
        margin-bottom: 2rem;
    }

    .topup-section h2 {
        margin: 0 0 0.5rem 0;
        font-size: 1.5rem;
    }

    .topup-hint {
        color: var(--text-muted);
        margin: 0 0 1.5rem 0;
    }

    .topup-cards {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
        gap: 1.5rem;
    }

    .topup-card {
        background: var(--bg-tertiary);
        border-radius: 12px;
        padding: 1.5rem;
        border: 2px solid transparent;
    }

    .gold-card {
        border-color: rgba(251, 191, 36, 0.3);
    }

    .gems-card {
        border-color: rgba(168, 85, 247, 0.3);
    }

    .topup-card h3 {
        margin: 0 0 0.5rem 0;
        font-size: 1.25rem;
    }

    .topup-card .rate {
        color: var(--text-muted);
        margin: 0 0 1rem 0;
        font-size: 0.9rem;
    }

    .topup-input-group {
        display: flex;
        align-items: center;
        gap: 1rem;
        margin-bottom: 1rem;
    }

    .topup-input-group input {
        flex: 1;
        padding: 0.75rem;
        background: var(--bg-primary);
        border: 1px solid rgba(255, 255, 255, 0.1);
        border-radius: 8px;
        color: var(--text-primary);
        font-size: 1rem;
    }

    .topup-input-group .preview {
        color: var(--text-muted);
        font-size: 0.9rem;
        white-space: nowrap;
    }

    .btn-gold {
        background: linear-gradient(135deg, #fbbf24, #d97706);
        color: #1f2937;
        font-weight: 600;
        padding: 0.75rem 1.5rem;
        border: none;
        border-radius: 8px;
        cursor: pointer;
        transition: all 0.2s;
        width: 100%;
    }

    .btn-gold:hover:not(:disabled) {
        transform: translateY(-2px);
        box-shadow: 0 4px 12px rgba(251, 191, 36, 0.3);
    }

    .btn-gold:disabled {
        opacity: 0.5;
        cursor: not-allowed;
    }

    .btn-gems {
        background: linear-gradient(135deg, #a855f7, #7c3aed);
        color: white;
        font-weight: 600;
        padding: 0.75rem 1.5rem;
        border: none;
        border-radius: 8px;
        cursor: pointer;
        transition: all 0.2s;
        width: 100%;
    }

    .btn-gems:hover:not(:disabled) {
        transform: translateY(-2px);
        box-shadow: 0 4px 12px rgba(168, 85, 247, 0.3);
    }

    .btn-gems:disabled {
        opacity: 0.5;
        cursor: not-allowed;
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
        justify-content: center;
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

    .shop-grid {
        display: grid;
        grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
        gap: 1.5rem;
    }

    .shop-item {
        background: var(--bg-secondary);
        border-radius: 16px;
        padding: 1.5rem;
        display: flex;
        flex-direction: column;
        align-items: center;
        text-align: center;
        border: 2px solid var(--item-color, var(--bg-tertiary));
        transition: all 0.2s;
    }

    .shop-item:hover {
        transform: translateY(-4px);
        box-shadow: 0 8px 24px rgba(0, 0, 0, 0.3);
    }

    .item-icon {
        font-size: 3rem;
        margin-bottom: 0.5rem;
    }

    .item-name {
        margin: 0 0 0.5rem 0;
        font-size: 1.25rem;
    }

    .item-desc {
        color: var(--text-muted);
        font-size: 0.85rem;
        margin: 0 0 0.75rem 0;
        min-height: 40px;
    }

    .item-type {
        font-size: 0.7rem;
        padding: 0.25rem 0.75rem;
        background: var(--item-color);
        color: white;
        border-radius: 999px;
        margin-bottom: 1rem;
    }

    .item-price {
        display: flex;
        gap: 0.75rem;
        margin-bottom: 1rem;
        font-weight: 600;
    }

    .price-gold {
        color: var(--gold);
    }

    .price-gems {
        color: var(--gems);
    }

    .locked {
        color: var(--text-muted);
        padding: 0.5rem 1rem;
        background: var(--bg-tertiary);
        border-radius: 8px;
    }

    .buy-btn {
        width: 100%;
    }

    .empty-state {
        text-align: center;
        padding: 4rem;
        color: var(--text-muted);
    }

    /* Seeds Section */
    .seeds-section {
        background: var(--bg-secondary);
        border-radius: 16px;
        padding: 1.5rem;
        margin-bottom: 2rem;
    }

    .seeds-section h2 {
        margin: 0 0 0.5rem 0;
        font-size: 1.5rem;
    }

    .seeds-hint {
        color: var(--text-muted);
        margin: 0 0 1.5rem 0;
    }

    .seeds-grid {
        display: grid;
        grid-template-columns: repeat(auto-fill, minmax(220px, 1fr));
        gap: 1rem;
    }

    .seed-card {
        background: var(--bg-tertiary);
        border-radius: 12px;
        padding: 1rem;
        display: flex;
        flex-direction: column;
        gap: 0.75rem;
        border-left: 4px solid var(--tier-color);
        position: relative;
        transition: all 0.2s;
    }

    .seed-card:hover {
        transform: translateY(-2px);
        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
    }

    .seed-card.locked {
        opacity: 0.6;
    }

    .seed-icon {
        font-size: 2rem;
    }

    .seed-info h3 {
        margin: 0;
        font-size: 1rem;
        color: var(--tier-color);
    }

    .seed-tier {
        font-size: 0.75rem;
        color: var(--text-muted);
    }

    .seed-stats {
        display: flex;
        flex-wrap: wrap;
        gap: 0.5rem;
    }

    .seed-stats .stat {
        display: flex;
        flex-direction: column;
        background: var(--bg-primary);
        padding: 0.35rem 0.5rem;
        border-radius: 6px;
        font-size: 0.75rem;
    }

    .seed-stats .label {
        color: var(--text-muted);
        font-size: 0.65rem;
    }

    .seed-stats .value {
        font-weight: 600;
    }

    .seed-stats .profit {
        color: #22c55e;
    }

    .seed-status {
        text-align: center;
        padding: 0.35rem;
        border-radius: 6px;
        font-size: 0.8rem;
        background: rgba(100, 100, 100, 0.3);
        color: var(--text-muted);
    }

    .seed-status.affordable {
        background: rgba(34, 197, 94, 0.2);
        color: #22c55e;
    }

    .locked-overlay {
        position: absolute;
        inset: 0;
        background: rgba(0, 0, 0, 0.5);
        border-radius: 12px;
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 0.9rem;
        font-weight: 600;
    }

    @keyframes spin {
        to {
            transform: rotate(360deg);
        }
    }
</style>
