<script lang="ts">
    import { onMount } from "svelte";
    import { getAdminPlayers, type GameProfile } from "$lib/api";
    import { showToast } from "$lib/stores";

    let players: GameProfile[] = [];
    let total = 0;
    let loading = true;
    let limit = 50;
    let offset = 0;

    async function loadPlayers() {
        loading = true;
        const res = await getAdminPlayers(limit, offset);
        if (res.success && res.data) {
            players = res.data.profiles;
            total = res.data.total;
        } else {
            showToast(res.error || "Gagal memuat pemain", "error");
        }
        loading = false;
    }

    function nextPage() {
        if (offset + limit < total) {
            offset += limit;
            loadPlayers();
        }
    }

    function prevPage() {
        if (offset - limit >= 0) {
            offset -= limit;
            loadPlayers();
        }
    }

    onMount(() => {
        loadPlayers();
    });
</script>

<div class="container mx-auto px-4 py-8">
    <div class="flex justify-between items-center mb-6">
        <h1 class="text-2xl font-bold">Pemain ({total})</h1>
        <a href="/admin/game" class="text-indigo-600 hover:text-indigo-900"
            >Kembali ke Dashboard</a
        >
    </div>

    {#if loading}
        <div class="flex justify-center p-8">
            <div
                class="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"
            ></div>
        </div>
    {:else}
        <div class="bg-white shadow overflow-x-auto rounded-lg">
            <table class="min-w-full divide-y divide-gray-200">
                <thead class="bg-gray-50">
                    <tr>
                        <th
                            class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                            >Username</th
                        >
                        <th
                            class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                            >Level</th
                        >
                        <th
                            class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                            >Emas</th
                        >
                        <th
                            class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                            >Permata</th
                        >
                        <th
                            class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                            >Total Didapat</th
                        >
                        <th
                            class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                            >Prestise</th
                        >
                    </tr>
                </thead>
                <tbody class="bg-white divide-y divide-gray-200">
                    {#each players as player}
                        <tr>
                            <td
                                class="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900"
                                >{player.user_username}</td
                            >
                            <td
                                class="px-6 py-4 whitespace-nowrap text-sm text-gray-500"
                                >{player.level}</td
                            >
                            <td
                                class="px-6 py-4 whitespace-nowrap text-sm text-yellow-600 font-bold"
                                >{player.gold}</td
                            >
                            <td
                                class="px-6 py-4 whitespace-nowrap text-sm text-purple-600 font-bold"
                                >{player.gems}</td
                            >
                            <td
                                class="px-6 py-4 whitespace-nowrap text-sm text-gray-500"
                                >{player.total_gold_earned}</td
                            >
                            <td
                                class="px-6 py-4 whitespace-nowrap text-sm text-indigo-500"
                                >{player.prestige_level}</td
                            >
                        </tr>
                    {/each}
                </tbody>
            </table>
        </div>

        <div class="flex justify-between items-center mt-4">
            <button
                on:click={prevPage}
                disabled={offset === 0}
                class="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50"
            >
                Sebelumnya
            </button>
            <span class="text-sm text-gray-500">
                Menampilkan {offset + 1} sampai {Math.min(
                    offset + limit,
                    total,
                )} dari {total}
            </span>
            <button
                on:click={nextPage}
                disabled={offset + limit >= total}
                class="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50"
            >
                Berikutnya
            </button>
        </div>
    {/if}
</div>
