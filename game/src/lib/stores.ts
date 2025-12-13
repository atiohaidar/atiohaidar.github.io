/**
 * Game State Store
 * Centralized state management using Svelte stores
 */

import { writable, derived } from 'svelte/store';
import type { GameProfile, FarmPlot, Crop, ShopItem, InventoryItem, Achievement, DailyQuest } from './api';

// ==========================================
// AUTH STATE
// ==========================================
export const isLoggedIn = writable(false);
export const username = writable<string | null>(null);

// ==========================================
// GAME STATE
// ==========================================
export const profile = writable<GameProfile | null>(null);
export const farmPlots = writable<FarmPlot[]>([]);
export const crops = writable<Crop[]>([]);
export const shopItems = writable<ShopItem[]>([]);
export const inventory = writable<InventoryItem[]>([]);
export const achievements = writable<Achievement[]>([]);
export const dailyQuests = writable<DailyQuest[]>([]);

// ==========================================
// UI STATE
// ==========================================
export const isLoading = writable(false);
export const showShopModal = writable(false);
export const showInventoryModal = writable(false);
export const showAchievementsModal = writable(false);
export const showQuestsModal = writable(false);
export const selectedPlot = writable<number | null>(null);
export const showSeedSelector = writable(false);

// ==========================================
// NOTIFICATIONS
// ==========================================
interface Toast {
    id: number;
    message: string;
    type: 'success' | 'error' | 'info' | 'gold' | 'xp' | 'level';
}

export const toasts = writable<Toast[]>([]);

let toastId = 0;

export function showToast(message: string, type: Toast['type'] = 'info', duration = 3000) {
    const id = ++toastId;
    toasts.update(t => [...t, { id, message, type }]);

    setTimeout(() => {
        toasts.update(t => t.filter(toast => toast.id !== id));
    }, duration);
}

// ==========================================
// DERIVED STORES
// ==========================================
export const unlockedCrops = derived([crops, profile], ([$crops, $profile]) => {
    if (!$profile) return [];
    return $crops.filter(c => c.unlock_level <= $profile.level);
});

export const readyPlots = derived(farmPlots, ($plots) => {
    return $plots.filter(p => p.ready);
});

export const growingPlots = derived(farmPlots, ($plots) => {
    return $plots.filter(p => p.crop_id && !p.ready);
});

export const emptyPlots = derived(farmPlots, ($plots) => {
    return $plots.filter(p => !p.crop_id);
});

export const unclaimedAchievements = derived(achievements, ($achievements) => {
    return $achievements.filter(a => {
        if (a.claimed) return false;
        try {
            const req = JSON.parse(a.requirement);
            return (a.progress || 0) >= req.value;
        } catch {
            return false;
        }
    });
});

export const completedQuests = derived(dailyQuests, ($quests) => {
    return $quests.filter(q => q.completed);
});

// ==========================================
// XP CALCULATIONS
// ==========================================
export function calculateXpForLevel(level: number): number {
    return Math.floor(100 * level * Math.pow(1.5, level - 1));
}

export const xpProgress = derived(profile, ($profile) => {
    if (!$profile) return { current: 0, needed: 100, percent: 0 };

    let totalXp = $profile.experience;
    let level = 1;

    while (true) {
        const xpNeeded = calculateXpForLevel(level);
        if (totalXp < xpNeeded || level >= $profile.level) {
            return {
                current: totalXp,
                needed: xpNeeded,
                percent: Math.floor((totalXp / xpNeeded) * 100),
            };
        }
        totalXp -= xpNeeded;
        level++;
    }
});

// ==========================================
// GAME LOOP
// ==========================================
let gameLoopInterval: ReturnType<typeof setInterval> | null = null;

export function startGameLoop(updateCallback: () => void, intervalMs = 1000) {
    stopGameLoop();
    gameLoopInterval = setInterval(updateCallback, intervalMs);
}

export function stopGameLoop() {
    if (gameLoopInterval) {
        clearInterval(gameLoopInterval);
        gameLoopInterval = null;
    }
}
