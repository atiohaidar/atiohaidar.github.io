/**
 * Game API Client
 * Handles all API communication with the backend
 */

const API_BASE = import.meta.env.DEV ? '/api' : 'https://backend.atiohaidar.workers.dev/api';

interface ApiResponse<T> {
    success: boolean;
    data?: T;
    error?: string;
}

// Auth token management
let authToken: string | null = null;

export function setAuthToken(token: string) {
    authToken = token;
    if (typeof localStorage !== 'undefined') {
        localStorage.setItem('game_token', token);
    }
}

export function getAuthToken(): string | null {
    if (authToken) return authToken;
    if (typeof localStorage !== 'undefined') {
        authToken = localStorage.getItem('game_token');
    }
    return authToken;
}

export function clearAuthToken() {
    authToken = null;
    if (typeof localStorage !== 'undefined') {
        localStorage.removeItem('game_token');
    }
}

async function fetchApi<T>(
    endpoint: string,
    options: RequestInit = {}
): Promise<ApiResponse<T>> {
    const token = getAuthToken();

    const headers: HeadersInit = {
        'Content-Type': 'application/json',
        ...(token && { 'Authorization': `Bearer ${token}` }),
        ...options.headers,
    };

    try {
        const response = await fetch(`${API_BASE}${endpoint}`, {
            ...options,
            headers,
        });

        const data = await response.json();
        return data;
    } catch (error) {
        return {
            success: false,
            error: error instanceof Error ? error.message : 'Unknown error',
        };
    }
}

// ==========================================
// AUTH
// ==========================================
export interface LoginRequest {
    username: string;
    password: string;
}

export interface LoginResponse {
    token: string;
    user: {
        username: string;
        name: string;
        role: string;
    };
}

export async function login(credentials: LoginRequest): Promise<ApiResponse<LoginResponse>> {
    try {
        const response = await fetch(`${API_BASE}/auth/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(credentials),
        });

        const data = await response.json();

        // Handle both response formats:
        // Format 1: {success: true, token: "...", user: {...}}
        // Format 2: {success: true, data: {token: "...", user: {...}}}
        if (data.success) {
            const token = data.token || data.data?.token;
            const user = data.user || data.data?.user;

            if (token) {
                setAuthToken(token);
                return {
                    success: true,
                    data: { token, user }
                };
            }
        }

        return {
            success: false,
            error: data.error || 'Login failed'
        };
    } catch (error) {
        return {
            success: false,
            error: error instanceof Error ? error.message : 'Unknown error',
        };
    }
}

// ==========================================
// GAME PROFILE
// ==========================================
export interface GameProfile {
    user_username: string;
    level: number;
    experience: number;
    gold: number;
    gems: number;
    prestige_level: number;
    total_harvests: number;
    total_gold_earned: number;
    plots_unlocked: number;
    last_daily_reward?: string;
    created_at?: string;
    updated_at?: string;
}

export async function getProfile(): Promise<ApiResponse<GameProfile>> {
    return fetchApi<GameProfile>('/game/profile');
}

export async function prestigeReset(): Promise<ApiResponse<{ new_prestige_level: number; bonus_percent: number }>> {
    return fetchApi('/game/profile/reset', { method: 'POST' });
}

// ==========================================
// FARM
// ==========================================
export interface Crop {
    id: string;
    name: string;
    tier: number;
    grow_time_seconds: number;
    sell_price: number;
    seed_price: number;
    unlock_level: number;
    xp_reward: number;
    icon?: string;
    description?: string;
    unlocked?: boolean;
}

export interface FarmPlot {
    id: string;
    user_username: string;
    plot_index: number;
    crop_id?: string;
    placed_item_id?: string;
    planted_at?: string;
    watered: boolean;
    growth_percent: number;
    auto_replant: boolean;
    crop?: Crop;
    ready?: boolean;
    time_remaining?: number;
    x?: number;
    y?: number;
}

export async function getFarmPlots(): Promise<ApiResponse<FarmPlot[]>> {
    return fetchApi<FarmPlot[]>('/game/farm');
}

export async function plantCrop(plotIndex: number | undefined, cropId: string, x?: number, y?: number): Promise<ApiResponse<FarmPlot>> {
    return fetchApi<FarmPlot>('/game/farm/plant', {
        method: 'POST',
        body: JSON.stringify({ plot_index: plotIndex, crop_id: cropId, x, y }),
    });
}

export async function waterPlot(plotIndex: number): Promise<ApiResponse<FarmPlot>> {
    return fetchApi<FarmPlot>('/game/farm/water', {
        method: 'POST',
        body: JSON.stringify({ plot_index: plotIndex }),
    });
}

export async function placeItem(plotIndex: number | undefined, itemId: string, x?: number, y?: number): Promise<ApiResponse<FarmPlot>> {
    return fetchApi<FarmPlot>('/game/farm/place', {
        method: 'POST',
        body: JSON.stringify({ plot_index: plotIndex, item_id: itemId, x, y }),
    });
}

export async function removeItem(plotIndex: number): Promise<ApiResponse<FarmPlot>> {
    return fetchApi<FarmPlot>('/game/farm/remove', {
        method: 'POST',
        body: JSON.stringify({ plot_index: plotIndex }),
    });
}

export async function expandLand(): Promise<ApiResponse<{ new_plots_unlocked: number; gold_spent: number; remaining_gold: number }>> {
    return fetchApi('/game/farm/expand', { method: 'POST' });
}

export async function useItem(itemId: string, targetPlotIndex?: number): Promise<ApiResponse<{ message: string; updatedPlot?: FarmPlot }>> {
    return fetchApi<{ message: string; updatedPlot?: FarmPlot }>('/game/farm/use', {
        method: 'POST',
        body: JSON.stringify({ item_id: itemId, target_plot_index: targetPlotIndex }),
    });
}

export interface HarvestResult {
    gold: number;
    xp: number;
    crop: Crop;
    leveledUp: boolean;
    newLevel: number;
}

export async function harvestPlot(plotIndex: number): Promise<ApiResponse<HarvestResult>> {
    return fetchApi<HarvestResult>('/game/farm/harvest', {
        method: 'POST',
        body: JSON.stringify({ plot_index: plotIndex }),
    });
}

export interface HarvestAllResult {
    total_gold: number;
    total_xp: number;
    harvested_count: number;
    leveled_up: boolean;
    new_level: number;
}

export async function harvestAll(): Promise<ApiResponse<HarvestAllResult>> {
    return fetchApi<HarvestAllResult>('/game/farm/harvest-all', { method: 'POST' });
}

// ==========================================
// CROPS
// ==========================================
export async function getCrops(): Promise<ApiResponse<Crop[]>> {
    return fetchApi<Crop[]>('/game/crops');
}

// ==========================================
// SHOP
// ==========================================
export interface ShopItem {
    id: string;
    name: string;
    type: string;
    price_gold: number;
    price_gems: number;
    unlock_level: number;
    effect?: string;
    max_quantity: number;
    icon?: string;
    description?: string;
    unlocked?: boolean;
}

export async function getShopItems(): Promise<ApiResponse<ShopItem[]>> {
    return fetchApi<ShopItem[]>('/game/shop');
}

export interface PurchaseResult {
    success: boolean;
    newGold: number;
    newGems: number;
    inventoryItem: InventoryItem;
}

export async function purchaseItem(itemId: string, quantity: number = 1): Promise<ApiResponse<PurchaseResult>> {
    return fetchApi<PurchaseResult>('/game/shop/purchase', {
        method: 'POST',
        body: JSON.stringify({ item_id: itemId, quantity }),
    });
}

// ==========================================
// INVENTORY
// ==========================================
export interface InventoryItem {
    id: string;
    user_username: string;
    item_id: string;
    quantity: number;
    equipped: boolean;
    purchased_at?: string;
    item?: ShopItem;
}

export async function getInventory(): Promise<ApiResponse<InventoryItem[]>> {
    return fetchApi<InventoryItem[]>('/game/inventory');
}

// ==========================================
// ACHIEVEMENTS
// ==========================================
export interface Achievement {
    id: string;
    name: string;
    description?: string;
    requirement: string;
    reward_gold: number;
    reward_gems: number;
    icon?: string;
    progress?: number;
    claimed?: boolean;
}

export async function getAchievements(): Promise<ApiResponse<Achievement[]>> {
    return fetchApi<Achievement[]>('/game/achievements');
}

export async function claimAchievement(achievementId: string): Promise<ApiResponse<{ gold: number; gems: number }>> {
    return fetchApi(`/game/achievements/${achievementId}/claim`, { method: 'POST' });
}

// ==========================================
// DAILY QUESTS
// ==========================================
export interface DailyQuest {
    id: string;
    user_username: string;
    quest_type: string;
    target_value: number;
    current_value: number;
    reward_gold: number;
    reward_gems: number;
    completed: boolean;
    quest_date: string;
}

export async function getDailyQuests(): Promise<ApiResponse<DailyQuest[]>> {
    return fetchApi<DailyQuest[]>('/game/quests/daily');
}

export async function claimDailyQuest(questId: string): Promise<ApiResponse<{ gold: number; gems: number }>> {
    return fetchApi(`/game/quests/${questId}/claim`, { method: 'POST' });
}

// ==========================================
// LEADERBOARD
// ==========================================
export interface LeaderboardEntry {
    user_username: string;
    total_gold_earned: number;
    level: number;
    prestige_level: number;
    rank?: number;
}

export async function getLeaderboard(limit: number = 50): Promise<ApiResponse<LeaderboardEntry[]>> {
    return fetchApi<LeaderboardEntry[]>(`/game/leaderboard?limit=${limit}`);
}

// ==========================================
// CURRENCY EXCHANGE
// ==========================================
export interface GemsExchangeResult {
    gems_received: number;
    balance_spent: number;
    new_balance: number;
    new_gems: number;
}

export interface GoldExchangeResult {
    gold_received: number;
    balance_spent: number;
    new_balance: number;
    new_gold: number;
}

export async function exchangeBalanceToGems(amount: number): Promise<ApiResponse<GemsExchangeResult>> {
    return fetchApi<GemsExchangeResult>('/game/exchange/gems', {
        method: 'POST',
        body: JSON.stringify({ balance_amount: amount }),
    });
}

export async function exchangeBalanceToGold(amount: number): Promise<ApiResponse<GoldExchangeResult>> {
    return fetchApi<GoldExchangeResult>('/game/exchange/gold', {
        method: 'POST',
        body: JSON.stringify({ balance_amount: amount }),
    });
}

// ==========================================
// GAME CONSTANTS
// ==========================================
export interface GameConstants {
    initial_gold: number;
    initial_gems: number;
    initial_plots: number;
    max_plots: number;
    gems_per_100_balance: number;
    gold_per_balance: number;
    water_speed_bonus: number;
    prestige_bonus_percent: number;
}

export async function getGameConstants(): Promise<ApiResponse<GameConstants>> {
    return fetchApi<GameConstants>('/game/constants');
}

// ==========================================
// ADMIN
// ==========================================
export interface AdminPlayerListResult {
    profiles: GameProfile[];
    total: number;
}

export async function getAdminPlayers(limit: number = 50, offset: number = 0): Promise<ApiResponse<AdminPlayerListResult>> {
    return fetchApi<AdminPlayerListResult>(`/game/admin/players?limit=${limit}&offset=${offset}`);
}

export async function createAdminItem(item: ShopItem): Promise<ApiResponse<ShopItem>> {
    return fetchApi<ShopItem>('/game/admin/items', {
        method: 'POST',
        body: JSON.stringify(item),
    });
}

export async function updateAdminItem(id: string, item: Partial<ShopItem>): Promise<ApiResponse<ShopItem>> {
    return fetchApi<ShopItem>(`/game/admin/items/${id}`, {
        method: 'PUT',
        body: JSON.stringify(item),
    });
}

export async function deleteAdminItem(id: string): Promise<ApiResponse<{ success: boolean }>> {
    return fetchApi<{ success: boolean }>(`/game/admin/items/${id}`, {
        method: 'DELETE',
    });
}

// ==========================================
// OBSTACLES
// ==========================================
export interface Obstacle {
    id: string;
    user_username: string;
    type: string;
    x: number;
    y: number;
    created_at?: string;
    remove_cost: number;
}

export async function getObstacles(): Promise<ApiResponse<Obstacle[]>> {
    return fetchApi<Obstacle[]>('/game/obstacles');
}

export async function removeObstacle(obstacleId: string): Promise<ApiResponse<{ newGold: number }>> {
    return fetchApi<{ newGold: number }>(`/game/obstacles/${obstacleId}/remove`, {
        method: 'POST',
    });
}
