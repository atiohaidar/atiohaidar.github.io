<script lang="ts">
    import { onMount } from "svelte";
    import { goto } from "$app/navigation";
    import {
        getAuthToken,
        getProfile,
        getAchievements,
        getDailyQuests,
        claimAchievement,
        claimDailyQuest,
        type Achievement,
        type DailyQuest,
    } from "$lib/api";
    import { profile, showToast, isLoggedIn, xpProgress } from "$lib/stores";

    let achievements: Achievement[] = [];
    let quests: DailyQuest[] = [];
    let loading = true;
    let claimingAchievement: string | null = null;
    let claimingQuest: string | null = null;

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
        const [profileRes, achievementsRes, questsRes] = await Promise.all([
            getProfile(),
            getAchievements(),
            getDailyQuests(),
        ]);

        if (profileRes.success && profileRes.data) {
            profile.set(profileRes.data);
        }
        if (achievementsRes.success && achievementsRes.data) {
            achievements = achievementsRes.data;
        }
        if (questsRes.success && questsRes.data) {
            quests = questsRes.data;
        }
        loading = false;
    }

    async function handleClaimAchievement(ach: Achievement) {
        if (claimingAchievement) return;
        claimingAchievement = ach.id;

        const result = await claimAchievement(ach.id);
        claimingAchievement = null;

        if (result.success && result.data) {
            showToast(
                `Claimed! +${result.data.gold} gold, +${result.data.gems} gems`,
                "gold",
            );
            await loadData();
        } else {
            showToast(result.error || "Failed to claim", "error");
        }
    }

    async function handleClaimQuest(quest: DailyQuest) {
        if (claimingQuest) return;
        claimingQuest = quest.id;

        const result = await claimDailyQuest(quest.id);
        claimingQuest = null;

        if (result.success && result.data) {
            showToast(
                `Claimed! +${result.data.gold} gold, +${result.data.gems} gems`,
                "gold",
            );
            await loadData();
        } else {
            showToast(result.error || "Failed to claim", "error");
        }
    }

    function getRequirementInfo(requirement: string): {
        type: string;
        value: number;
    } {
        try {
            return JSON.parse(requirement);
        } catch {
            return { type: "unknown", value: 0 };
        }
    }

    function canClaimAchievement(ach: Achievement): boolean {
        if (ach.claimed) return false;
        const req = getRequirementInfo(ach.requirement);
        return (ach.progress || 0) >= req.value;
    }

    function getQuestTypeLabel(type: string): string {
        const labels: Record<string, string> = {
            harvest: "🌾 Harvest crops",
            plant: "🌱 Plant crops",
            water: "💧 Water crops",
            earn: "💰 Earn gold",
        };
        return labels[type] || type;
    }

    function formatPlayTime(minutes: number): string {
        const hours = Math.floor(minutes / 60);
        const mins = minutes % 60;
        if (hours > 0) return `${hours}h ${mins}m`;
        return `${mins}m`;
    }
</script>

<svelte:head>
    <title>Harvest Haven - Profile</title>
</svelte:head>

<div class="profile-page">
    <header class="header">
        <a href="/play" class="back-btn">← Back to Farm</a>
        <h1>👤 Profile</h1>
        <div class="spacer"></div>
    </header>

    {#if loading}
        <div class="loading">
            <div class="spinner"></div>
            <p>Loading profile...</p>
        </div>
    {:else}
        <!-- Profile Stats -->
        <section class="profile-section">
            <div class="profile-card">
                <div class="avatar">🧑‍🌾</div>
                <div class="profile-info">
                    <h2>{$profile?.user_username}</h2>
                    <div class="level-badge">Level {$profile?.level || 1}</div>
                </div>
            </div>

            <div class="stats-grid">
                <div class="stat-card">
                    <span class="stat-icon">💰</span>
                    <span class="stat-value"
                        >{$profile?.gold?.toLocaleString() || 0}</span
                    >
                    <span class="stat-label">Gold</span>
                </div>
                <div class="stat-card">
                    <span class="stat-icon">💎</span>
                    <span class="stat-value">{$profile?.gems || 0}</span>
                    <span class="stat-label">Gems</span>
                </div>
                <div class="stat-card">
                    <span class="stat-icon">🌾</span>
                    <span class="stat-value"
                        >{$profile?.total_harvests || 0}</span
                    >
                    <span class="stat-label">Harvests</span>
                </div>
                <div class="stat-card">
                    <span class="stat-icon">⭐</span>
                    <span class="stat-value"
                        >{$profile?.prestige_level || 0}</span
                    >
                    <span class="stat-label">Prestige</span>
                </div>
            </div>

            <div class="xp-section">
                <div class="xp-label">
                    <span>XP Progress</span>
                    <span>{$xpProgress.current} / {$xpProgress.needed}</span>
                </div>
                <div class="xp-bar">
                    <div
                        class="xp-fill"
                        style="width: {$xpProgress.percent}%"
                    ></div>
                </div>
            </div>
        </section>

        <!-- Daily Quests -->
        <section class="quests-section">
            <h2>📋 Daily Quests</h2>
            {#if quests.length === 0}
                <p class="empty-text">No quests available today</p>
            {:else}
                <div class="quests-list">
                    {#each quests as quest}
                        <div
                            class="quest-card"
                            class:completed={quest.completed}
                        >
                            <div class="quest-info">
                                <h3>{getQuestTypeLabel(quest.quest_type)}</h3>
                                <div class="quest-progress">
                                    <div class="progress-bar">
                                        <div
                                            class="progress-fill"
                                            style="width: {Math.min(
                                                100,
                                                (quest.current_value /
                                                    quest.target_value) *
                                                    100,
                                            )}%"
                                        ></div>
                                    </div>
                                    <span
                                        >{quest.current_value} / {quest.target_value}</span
                                    >
                                </div>
                            </div>
                            <div class="quest-reward">
                                {#if quest.reward_gold > 0}
                                    <span class="reward"
                                        >🪙 {quest.reward_gold}</span
                                    >
                                {/if}
                                {#if quest.reward_gems > 0}
                                    <span class="reward"
                                        >💎 {quest.reward_gems}</span
                                    >
                                {/if}
                            </div>
                            {#if quest.completed}
                                <button
                                    class="btn btn-success claim-btn"
                                    disabled={claimingQuest === quest.id}
                                    on:click={() => handleClaimQuest(quest)}
                                >
                                    {claimingQuest === quest.id
                                        ? "..."
                                        : "Claim"}
                                </button>
                            {/if}
                        </div>
                    {/each}
                </div>
            {/if}
        </section>

        <!-- Achievements -->
        <section class="achievements-section">
            <h2>🏆 Achievements</h2>
            <div class="achievements-grid">
                {#each achievements as ach}
                    {@const req = getRequirementInfo(ach.requirement)}
                    <div
                        class="achievement-card"
                        class:claimed={ach.claimed}
                        class:claimable={canClaimAchievement(ach)}
                    >
                        <div class="ach-icon">{ach.icon || "🏅"}</div>
                        <div class="ach-info">
                            <h3>{ach.name}</h3>
                            <p>{ach.description}</p>
                            <div class="ach-progress">
                                <div class="progress-bar">
                                    <div
                                        class="progress-fill"
                                        style="width: {Math.min(
                                            100,
                                            ((ach.progress || 0) / req.value) *
                                                100,
                                        )}%"
                                    ></div>
                                </div>
                                <span>{ach.progress || 0} / {req.value}</span>
                            </div>
                        </div>
                        <div class="ach-reward">
                            {#if ach.reward_gold > 0}
                                <span>🪙 {ach.reward_gold}</span>
                            {/if}
                            {#if ach.reward_gems > 0}
                                <span>💎 {ach.reward_gems}</span>
                            {/if}
                        </div>
                        {#if ach.claimed}
                            <div class="claimed-badge">✓ Claimed</div>
                        {:else if canClaimAchievement(ach)}
                            <button
                                class="btn btn-success claim-btn"
                                disabled={claimingAchievement === ach.id}
                                on:click={() => handleClaimAchievement(ach)}
                            >
                                {claimingAchievement === ach.id
                                    ? "..."
                                    : "Claim"}
                            </button>
                        {/if}
                    </div>
                {/each}
            </div>
        </section>
    {/if}
</div>

<style>
    .profile-page {
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

    /* Profile Section */
    .profile-section {
        background: var(--bg-secondary);
        border-radius: 16px;
        padding: 2rem;
        margin-bottom: 2rem;
    }

    .profile-card {
        display: flex;
        align-items: center;
        gap: 1.5rem;
        margin-bottom: 2rem;
    }

    .avatar {
        font-size: 4rem;
        background: var(--bg-tertiary);
        border-radius: 50%;
        width: 100px;
        height: 100px;
        display: flex;
        align-items: center;
        justify-content: center;
    }

    .profile-info h2 {
        margin: 0 0 0.5rem 0;
        font-size: 1.5rem;
    }

    .level-badge {
        display: inline-block;
        background: linear-gradient(135deg, var(--gold), var(--gold-dark));
        color: black;
        padding: 0.25rem 0.75rem;
        border-radius: 999px;
        font-weight: 600;
    }

    .stats-grid {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(120px, 1fr));
        gap: 1rem;
        margin-bottom: 2rem;
    }

    .stat-card {
        background: var(--bg-tertiary);
        border-radius: 12px;
        padding: 1rem;
        display: flex;
        flex-direction: column;
        align-items: center;
        text-align: center;
    }

    .stat-icon {
        font-size: 1.5rem;
        margin-bottom: 0.5rem;
    }

    .stat-value {
        font-size: 1.5rem;
        font-weight: 700;
    }

    .stat-label {
        color: var(--text-muted);
        font-size: 0.85rem;
    }

    .xp-section {
        margin-top: 1rem;
    }

    .xp-label {
        display: flex;
        justify-content: space-between;
        margin-bottom: 0.5rem;
        color: var(--text-secondary);
        font-size: 0.9rem;
    }

    .xp-bar {
        height: 12px;
        background: var(--bg-tertiary);
        border-radius: 999px;
        overflow: hidden;
    }

    .xp-fill {
        height: 100%;
        background: linear-gradient(90deg, var(--xp), var(--xp-dark));
        border-radius: 999px;
        transition: width 0.3s ease;
    }

    /* Quests Section */
    .quests-section,
    .achievements-section {
        margin-bottom: 2rem;
    }

    .quests-section h2,
    .achievements-section h2 {
        margin-bottom: 1rem;
    }

    .empty-text {
        color: var(--text-muted);
        text-align: center;
        padding: 2rem;
    }

    .quests-list {
        display: flex;
        flex-direction: column;
        gap: 1rem;
    }

    .quest-card {
        background: var(--bg-secondary);
        border-radius: 12px;
        padding: 1rem 1.5rem;
        display: flex;
        align-items: center;
        gap: 1.5rem;
    }

    .quest-card.completed {
        border: 2px solid var(--xp);
    }

    .quest-info {
        flex: 1;
    }

    .quest-info h3 {
        margin: 0 0 0.5rem 0;
        font-size: 1rem;
    }

    .quest-progress {
        display: flex;
        align-items: center;
        gap: 0.75rem;
    }

    .progress-bar {
        flex: 1;
        height: 8px;
        background: var(--bg-tertiary);
        border-radius: 999px;
        overflow: hidden;
        max-width: 200px;
    }

    .progress-fill {
        height: 100%;
        background: var(--xp);
        border-radius: 999px;
        transition: width 0.3s;
    }

    .quest-reward {
        display: flex;
        flex-direction: column;
        gap: 0.25rem;
        font-weight: 600;
    }

    .claim-btn {
        padding: 0.5rem 1rem;
    }

    /* Achievements Section */
    .achievements-grid {
        display: grid;
        grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
        gap: 1rem;
    }

    .achievement-card {
        background: var(--bg-secondary);
        border-radius: 12px;
        padding: 1rem;
        display: flex;
        align-items: center;
        gap: 1rem;
        opacity: 0.7;
    }

    .achievement-card.claimable {
        opacity: 1;
        border: 2px solid var(--gold);
    }

    .achievement-card.claimed {
        opacity: 0.5;
    }

    .ach-icon {
        font-size: 2rem;
    }

    .ach-info {
        flex: 1;
    }

    .ach-info h3 {
        margin: 0 0 0.25rem 0;
        font-size: 1rem;
    }

    .ach-info p {
        color: var(--text-muted);
        font-size: 0.8rem;
        margin: 0 0 0.5rem 0;
    }

    .ach-progress {
        display: flex;
        align-items: center;
        gap: 0.5rem;
        font-size: 0.8rem;
    }

    .ach-reward {
        display: flex;
        flex-direction: column;
        gap: 0.25rem;
        font-size: 0.85rem;
        font-weight: 600;
        color: var(--gold);
    }

    .claimed-badge {
        color: var(--xp);
        font-size: 0.85rem;
    }

    @keyframes spin {
        to {
            transform: rotate(360deg);
        }
    }
</style>
