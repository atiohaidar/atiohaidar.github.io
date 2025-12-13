<script lang="ts">
    import { base } from "$app/paths";
    import { onMount } from "svelte";
    import { goto } from "$app/navigation";
    import {
        getAuthToken,
        getLeaderboard,
        getProfile,
        type LeaderboardEntry,
    } from "$lib/api";
    import { profile, isLoggedIn } from "$lib/stores";

    let leaderboard: LeaderboardEntry[] = [];
    let loading = true;
    let currentUserRank = 0;

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
        const [leaderboardRes, profileRes] = await Promise.all([
            getLeaderboard(100),
            getProfile(),
        ]);

        if (leaderboardRes.success && leaderboardRes.data) {
            leaderboard = leaderboardRes.data;
            // Find current user rank
            const idx = leaderboard.findIndex(
                (e) => e.user_username === profileRes.data?.user_username,
            );
            currentUserRank = idx >= 0 ? idx + 1 : 0;
        }
        if (profileRes.success && profileRes.data) {
            profile.set(profileRes.data);
        }
        loading = false;
    }

    function getRankBadge(rank: number): string {
        if (rank === 1) return "🥇";
        if (rank === 2) return "🥈";
        if (rank === 3) return "🥉";
        return `#${rank}`;
    }

    function getRankClass(rank: number): string {
        if (rank === 1) return "rank-gold";
        if (rank === 2) return "rank-silver";
        if (rank === 3) return "rank-bronze";
        return "";
    }

    function formatGold(gold: number): string {
        if (gold >= 1000000) return (gold / 1000000).toFixed(1) + "M";
        if (gold >= 1000) return (gold / 1000).toFixed(1) + "K";
        return gold.toString();
    }
</script>

<svelte:head>
    <title>Bercocok Tanam - Leaderboard</title>
</svelte:head>

<div class="leaderboard-page">
    <header class="header">
        <a href="{base}/play" class="back-btn">← Kembali ke Kebun</a>
        <h1>🏆 Peringkat</h1>
        <div class="spacer"></div>
    </header>

    {#if loading}
        <div class="loading">
            <div class="spinner"></div>
            <p>Memuat peringkat...</p>
        </div>
    {:else}
        <!-- Current User Rank Card -->
        {#if currentUserRank > 0}
            <div class="your-rank-card">
                <span class="your-rank-label">Peringkat Anda</span>
                <span class="your-rank-value"
                    >{getRankBadge(currentUserRank)}</span
                >
                <span class="your-rank-stats">
                    Level {$profile?.level} • {formatGold(
                        $profile?.total_gold_earned || 0,
                    )} emas didapat
                </span>
            </div>
        {/if}

        <!-- Top 3 Podium -->
        <div class="podium">
            {#if leaderboard[1]}
                <div class="podium-place second">
                    <div class="podium-avatar">🥈</div>
                    <div class="podium-name">
                        {leaderboard[1].user_username}
                    </div>
                    <div class="podium-stats">Lvl {leaderboard[1].level}</div>
                    <div class="podium-gold">
                        {formatGold(leaderboard[1].total_gold_earned)}
                    </div>
                    <div class="podium-stand second-stand">2</div>
                </div>
            {/if}
            {#if leaderboard[0]}
                <div class="podium-place first">
                    <div class="podium-avatar">🥇</div>
                    <div class="podium-name">
                        {leaderboard[0].user_username}
                    </div>
                    <div class="podium-stats">Lvl {leaderboard[0].level}</div>
                    <div class="podium-gold">
                        {formatGold(leaderboard[0].total_gold_earned)}
                    </div>
                    <div class="podium-stand first-stand">1</div>
                </div>
            {/if}
            {#if leaderboard[2]}
                <div class="podium-place third">
                    <div class="podium-avatar">🥉</div>
                    <div class="podium-name">
                        {leaderboard[2].user_username}
                    </div>
                    <div class="podium-stats">Lvl {leaderboard[2].level}</div>
                    <div class="podium-gold">
                        {formatGold(leaderboard[2].total_gold_earned)}
                    </div>
                    <div class="podium-stand third-stand">3</div>
                </div>
            {/if}
        </div>

        <!-- Full Leaderboard Table -->
        <div class="leaderboard-table">
            <div class="table-header">
                <span class="col-rank">Peringkat</span>
                <span class="col-player">Pemain</span>
                <span class="col-level">Level</span>
                <span class="col-prestige">Prestise</span>
                <span class="col-gold">Total Emas</span>
            </div>

            {#each leaderboard as entry, i}
                <div
                    class="table-row {getRankClass(i + 1)}"
                    class:current-user={entry.user_username ===
                        $profile?.user_username}
                >
                    <span class="col-rank">{getRankBadge(i + 1)}</span>
                    <span class="col-player">{entry.user_username}</span>
                    <span class="col-level">{entry.level}</span>
                    <span class="col-prestige">
                        {#if entry.prestige_level > 0}
                            ⭐ {entry.prestige_level}
                        {:else}
                            -
                        {/if}
                    </span>
                    <span class="col-gold"
                        >🪙 {formatGold(entry.total_gold_earned)}</span
                    >
                </div>
            {/each}

            {#if leaderboard.length === 0}
                <div class="empty-state">
                    <p>Belum ada pemain di peringkat!</p>
                    <p>Jadilah yang pertama bertani dan dapatkan emas.</p>
                </div>
            {/if}
        </div>
    {/if}
</div>

<style>
    .leaderboard-page {
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

    /* Your Rank Card */
    .your-rank-card {
        background: linear-gradient(
            135deg,
            var(--bg-secondary),
            var(--bg-tertiary)
        );
        border: 2px solid var(--gold);
        border-radius: 16px;
        padding: 1.5rem;
        display: flex;
        align-items: center;
        gap: 1.5rem;
        margin-bottom: 2rem;
    }

    .your-rank-label {
        color: var(--text-muted);
        font-size: 0.9rem;
    }

    .your-rank-value {
        font-size: 2rem;
        font-weight: 700;
    }

    .your-rank-stats {
        color: var(--text-secondary);
        margin-left: auto;
    }

    /* Podium */
    .podium {
        display: flex;
        justify-content: center;
        align-items: flex-end;
        gap: 1rem;
        margin-bottom: 3rem;
        padding: 2rem 0;
    }

    .podium-place {
        display: flex;
        flex-direction: column;
        align-items: center;
        text-align: center;
    }

    .podium-avatar {
        font-size: 3rem;
        margin-bottom: 0.5rem;
    }

    .podium-name {
        font-weight: 600;
        font-size: 1.1rem;
        margin-bottom: 0.25rem;
    }

    .podium-stats {
        color: var(--text-muted);
        font-size: 0.85rem;
    }

    .podium-gold {
        color: var(--gold);
        font-weight: 600;
        margin-bottom: 0.5rem;
    }

    .podium-stand {
        width: 80px;
        display: flex;
        align-items: flex-end;
        justify-content: center;
        font-size: 1.5rem;
        font-weight: 700;
        color: var(--text-primary);
        border-radius: 8px 8px 0 0;
    }

    .first .podium-avatar {
        font-size: 4rem;
    }
    .first-stand {
        height: 120px;
        background: linear-gradient(180deg, #fbbf24, #d97706);
    }
    .second-stand {
        height: 90px;
        background: linear-gradient(180deg, #9ca3af, #6b7280);
    }
    .third-stand {
        height: 60px;
        background: linear-gradient(180deg, #cd7f32, #8b4513);
    }

    /* Table */
    .leaderboard-table {
        background: var(--bg-secondary);
        border-radius: 16px;
        overflow: hidden;
    }

    .table-header {
        display: grid;
        grid-template-columns: 80px 1fr 80px 100px 120px;
        padding: 1rem 1.5rem;
        background: var(--bg-tertiary);
        font-weight: 600;
        color: var(--text-muted);
        font-size: 0.85rem;
    }

    .table-row {
        display: grid;
        grid-template-columns: 80px 1fr 80px 100px 120px;
        padding: 1rem 1.5rem;
        border-bottom: 1px solid rgba(255, 255, 255, 0.05);
        transition: background 0.2s;
    }

    .table-row:hover {
        background: rgba(255, 255, 255, 0.03);
    }

    .table-row.current-user {
        background: rgba(251, 191, 36, 0.1);
        border-left: 3px solid var(--gold);
    }

    .table-row.rank-gold {
        color: var(--gold);
    }
    .table-row.rank-silver {
        color: #9ca3af;
    }
    .table-row.rank-bronze {
        color: #cd7f32;
    }

    .col-rank {
        font-weight: 600;
    }
    .col-player {
        font-weight: 500;
    }
    .col-gold {
        color: var(--gold);
    }

    .empty-state {
        text-align: center;
        padding: 3rem;
        color: var(--text-muted);
    }

    @keyframes spin {
        to {
            transform: rotate(360deg);
        }
    }

    @media (max-width: 768px) {
        .table-header,
        .table-row {
            grid-template-columns: 60px 1fr 60px 100px;
        }
        .col-prestige {
            display: none;
        }
        .podium-stand {
            width: 60px;
        }
    }
</style>
