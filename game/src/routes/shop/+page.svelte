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
        type GoldExchangeResult,
        type GemsExchangeResult,
    } from "$lib/api";

    import { profile, showToast, isLoggedIn } from "$lib/stores";

    interface ShopPageItem {
        id: string;
        name: string;
        type: string;
        price_gold: number;
        price_gems: number;
        unlock_level: number;
        icon?: string;
        description?: string;
        unlocked?: boolean;

        // Specific to CurrencyPackage
        price_balance?: number;
        reward_amount?: number;
        currencyType?: string;

        // Specific to Crop
        isCrop?: boolean;
        tier?: number;
        grow_time_seconds?: number;
        xp_reward?: number;

        // Specific to ShopItem (optional here to allow compatibility)
        max_quantity?: number;
        effect?: string;
    }

    let shopItems: ShopItem[] = [];
    let crops: Crop[] = [];
    let loading = true;
    let selectedCategory = "all";
    let purchaseLoading: string | null = null;
    let constants: GameConstants | null = null;
    let userBalance = 0;

    let categories = [
        { id: "all", name: "Semua", icon: "🛒" },
        { id: "seeds", name: "Benih", icon: "🌱" },
        { id: "tool", name: "Alat", icon: "🔧" },
        { id: "upgrade", name: "Peningkatan", icon: "⬆️" },
        { id: "decoration", name: "Dekorasi", icon: "🌸" },
        { id: "premium", name: "Premium", icon: "💎" },
        { id: "booster", name: "Booster", icon: "⚡" },
        { id: "currency", name: "Mata Uang", icon: "💰" },
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

    async function handleCurrencyPurchase(item: any) {
        if (purchaseLoading) return;
        purchaseLoading = item.id;

        let result;
        if (item.currencyType === "gold") {
            // Calculate amount based on cost
            // Cost is in Saldo. We need to send amount of Saldo to exchange?
            // The API expects 'balance_amount'.
            result = await exchangeBalanceToGold(item.price_balance);
        } else {
            result = await exchangeBalanceToGems(item.price_balance);
        }

        purchaseLoading = null;

        if (result.success && result.data) {
            const received =
                item.currencyType === "gold"
                    ? (result.data as GoldExchangeResult).gold_received
                    : (result.data as GemsExchangeResult).gems_received;
            const currency =
                item.currencyType === "gold" ? "Gold 🪙" : "Gems 💎";

            showToast(
                `Top up berhasil! +${received} ${currency}`,
                item.currencyType === "gold" ? "gold" : "success",
            );
            userBalance = result.data.new_balance;

            // Refresh profile
            const profileRes = await getProfile();
            if (profileRes.success && profileRes.data) {
                profile.set(profileRes.data);
            }
        } else {
            showToast(result.error || "Top up gagal", "error");
        }
    }

    async function handlePurchase(item: ShopPageItem) {
        if (purchaseLoading) return;

        purchaseLoading = item.id;
        const result = await purchaseItem(item.id, 1);
        purchaseLoading = null;

        if (result.success && result.data) {
            showToast(`Membeli ${item.name}! 🎉`, "success");
            const profileRes = await getProfile();
            if (profileRes.success && profileRes.data) {
                profile.set(profileRes.data);
            }
        } else {
            showToast(result.error || "Pembelian gagal", "error");
        }
    }

    function canAfford(item: ShopPageItem): boolean {
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
            currency: "#fbbf24",
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

    function getSafeCropProfit(item: ShopPageItem): number {
        if (!item.isCrop) return 0;
        return getCropProfit(item as unknown as Crop);
    }

    function getSafeGrowTime(item: ShopPageItem): string {
        return formatGrowTime(item.grow_time_seconds || 0);
    }

    function formatGrowTime(seconds: number): string {
        if (seconds < 60) return `${seconds}s`;
        if (seconds < 3600) return `${Math.floor(seconds / 60)}m`;
        return `${Math.floor(seconds / 3600)}h`;
    }

    // Dynamic Currency Packages
    $: currencyPackages = [
        {
            id: "gold_small",
            name: "Kantung Emas Kecil",
            type: "currency",
            currencyType: "gold",
            price_balance: 10,
            reward_amount: 10 * (constants?.gold_per_balance || 10),
            price_gold: 0,
            price_gems: 0,
            icon: "🪙",
            description: "Kantung kecil berisi emas untuk memulai.",
            unlock_level: 0,
        },
        {
            id: "gold_medium",
            name: "Karung Emas Menengah",
            type: "currency",
            currencyType: "gold",
            price_balance: 50,
            reward_amount: 50 * (constants?.gold_per_balance || 10),
            price_gold: 0,
            price_gems: 0,
            icon: "💰",
            description: "Jumlah emas yang lumayan.",
            unlock_level: 0,
        },
        {
            id: "gold_large",
            name: "Peti Emas Besar",
            type: "currency",
            currencyType: "gold",
            price_balance: 100,
            reward_amount: 100 * (constants?.gold_per_balance || 10),
            price_gold: 0,
            price_gems: 0,
            icon: "🏦",
            description: "Peti yang meluap dengan emas!",
            unlock_level: 0,
        },
        {
            id: "gems_small",
            name: "Segenggam Permata",
            type: "currency",
            currencyType: "gems",
            price_balance: 100,
            reward_amount: Math.floor(
                (100 / 100) * (constants?.gems_per_100_balance || 10),
            ),
            price_gold: 0,
            price_gems: 0,
            icon: "💎",
            description: "Segenggam permata berkilau.",
            unlock_level: 0,
        },
        {
            id: "gems_large",
            name: "Sebakul Permata",
            type: "currency",
            currencyType: "gems",
            price_balance: 500,
            reward_amount: Math.floor(
                (500 / 100) * (constants?.gems_per_100_balance || 10),
            ),
            price_gold: 0,
            price_gems: 0,
            icon: "💠",
            description: "Cukup permata untuk mempercepat kebunmu.",
            unlock_level: 0,
        },
    ];

    $: allItems = [
        ...currencyPackages,
        ...crops.map((c) => ({
            ...c,
            type: "seeds",
            price_gold: c.seed_price,
            price_gems: 0,
            isCrop: true,
        })),
        ...shopItems,
    ] as ShopPageItem[];

    $: filteredItems =
        selectedCategory === "all"
            ? allItems
            : allItems.filter((item) => item.type === selectedCategory);
</script>

<svelte:head>
    <title>Bercocok Tanam - Shop</title>
</svelte:head>

<div class="shop-page">
    <header class="header">
        <div class="header-left">
            <a href="/play" class="back-btn">← Kembali ke Kebun</a>
            <h1>🛒 Toko</h1>
        </div>
        <div class="header-right">
            <div class="currency-display">
                <span class="currency currency-balance"
                    >💵 {userBalance.toLocaleString()} Saldo</span
                >
                <span class="currency currency-gold"
                    >🪙 {$profile?.gold?.toLocaleString() || 0}</span
                >
                <span class="currency currency-gems"
                    >💎 {$profile?.gems || 0}</span
                >
            </div>
        </div>
    </header>

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
            <p>Memuat toko...</p>
        </div>
    {:else}
        <div class="shop-grid">
            {#each filteredItems as item}
                <div
                    class="shop-item"
                    style="--item-color: {item.isCrop
                        ? getCropTierColor(item.tier || 1)
                        : getTierColor(item.type)}"
                >
                    <div class="item-icon">
                        {item.icon || (item.isCrop ? "🌱" : "📦")}
                    </div>
                    <h3 class="item-name">{item.name}</h3>

                    {#if item.isCrop}
                        <div class="item-crop-stats">
                            <div class="stat-row">
                                <span>Untung:</span>
                                <span class="profit"
                                    >+{getSafeCropProfit(
                                        item,
                                    ).toLocaleString()}</span
                                >
                            </div>
                            <div class="stat-row">
                                <span>Waktu:</span>
                                <span>{getSafeGrowTime(item)}</span>
                            </div>
                            <div class="stat-row">
                                <span>XP:</span>
                                <span>{item.xp_reward}</span>
                            </div>
                        </div>
                    {:else if item.type === "currency"}
                        <div class="item-crop-stats">
                            <div class="stat-row">
                                <span>Dapat:</span>
                                <span class="profit">
                                    {item.reward_amount}
                                    {item.currencyType === "gold"
                                        ? "Emas"
                                        : "Permata"}
                                </span>
                            </div>
                        </div>
                        <p class="item-desc">{item.description}</p>
                    {:else}
                        <p class="item-desc">
                            {item.description || "Tidak ada deskripsi"}
                        </p>
                    {/if}

                    <div class="item-type">
                        {item.type.toUpperCase()}
                        {item.isCrop ? `(Tier ${item.tier})` : ""}
                    </div>

                    <div class="item-price">
                        {#if item.type === "currency"}
                            <span class="price-balance"
                                >💵 {item.price_balance} Saldo</span
                            >
                        {:else}
                            {#if item.price_gold > 0}
                                <span class="price-gold"
                                    >🪙 {item.price_gold}</span
                                >
                            {/if}
                            {#if item.price_gems > 0}
                                <span class="price-gems"
                                    >💎 {item.price_gems}</span
                                >
                            {/if}
                        {/if}
                    </div>

                    {#if item.unlock_level > ($profile?.level || 1)}
                        <div class="locked">🔒 Level {item.unlock_level}</div>
                    {:else if item.isCrop}
                        <div class="unlocked-text">✓ Terbuka</div>
                    {:else}
                        <button
                            class="btn btn-primary buy-btn"
                            disabled={(item.type === "currency"
                                ? userBalance < (item.price_balance || 0)
                                : !canAfford(item)) ||
                                purchaseLoading === item.id}
                            on:click={() =>
                                item.type === "currency"
                                    ? handleCurrencyPurchase(item)
                                    : handlePurchase(item)}
                        >
                            {#if purchaseLoading === item.id}
                                {item.type === "currency"
                                    ? "Menukar..."
                                    : "Membeli..."}
                            {:else if item.type === "currency" && userBalance < (item.price_balance || 0)}
                                Saldo Tidak Cukup
                            {:else if item.type !== "currency" && !canAfford(item)}
                                Tidak Cukup
                            {:else}
                                {item.type === "currency"
                                    ? "Isi Ulang"
                                    : "Beli"}
                            {/if}
                        </button>
                    {/if}
                </div>
            {/each}
        </div>

        {#if filteredItems.length === 0}
            <div class="empty-state">
                <p>Tidak ada item di kategori ini</p>
            </div>
        {/if}
    {/if}
</div>

<style>
    .shop-page {
        height: 100vh;
        overflow-y: auto;
        background: var(--bg-primary);
        padding: 0 2rem 2rem 2rem; /* Remove top padding as header has it */
    }

    .header {
        position: sticky;
        top: 0;
        z-index: 100;
        background: rgba(15, 23, 42, 0.95);
        backdrop-filter: blur(10px);
        display: flex;
        align-items: center;
        justify-content: space-between;
        margin-bottom: 2rem;
        flex-wrap: wrap;
        gap: 1rem;
        padding: 1.5rem 0; /* Add padding here for sticky effect */
        border-bottom: 1px solid rgba(255, 255, 255, 0.1);
    }

    .price-balance {
        color: #22c55e;
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

    .header-left,
    .header-right {
        display: flex;
        align-items: center;
        gap: 1rem;
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

    /* Seeds Section Removed */

    @keyframes spin {
        to {
            transform: rotate(360deg);
        }
    }
    .item-crop-stats {
        width: 100%;
        background: rgba(0, 0, 0, 0.1);
        border-radius: 8px;
        padding: 0.5rem;
        margin-bottom: 0.75rem;
        font-size: 0.8rem;
    }

    .stat-row {
        display: flex;
        justify-content: space-between;
        margin-bottom: 0.25rem;
    }

    .stat-row:last-child {
        margin-bottom: 0;
    }

    .profit {
        color: var(--gold);
        font-weight: 600;
    }

    .unlocked-text {
        color: var(--gold);
        font-weight: 600;
        padding: 0.5rem;
        background: rgba(34, 197, 94, 0.1);
        border-radius: 8px;
        width: 100%;
        border: 1px solid rgba(34, 197, 94, 0.3);
    }
</style>
