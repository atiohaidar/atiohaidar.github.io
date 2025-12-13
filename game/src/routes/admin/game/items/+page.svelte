<script lang="ts">
    import { onMount } from "svelte";
    import {
        getShopItems,
        createAdminItem,
        updateAdminItem,
        deleteAdminItem,
        type ShopItem,
    } from "$lib/api";
    import { showToast } from "$lib/stores";
    import ItemForm from "$lib/components/admin/ItemForm.svelte";

    let items: ShopItem[] = [];
    let loading = true;
    let showModal = false;
    let editingItem: Partial<ShopItem> | null = null;
    let isEditing = false;

    async function loadItems() {
        loading = true;
        const res = await getShopItems();
        if (res.success && res.data) {
            items = res.data;
        } else {
            showToast(res.error || "Failed to load items", "error");
        }
        loading = false;
    }

    function openCreateModal() {
        editingItem = {
            type: "decoration",
            max_quantity: 1,
            unlock_level: 1,
            price_gold: 0,
            price_gems: 0,
        };
        isEditing = false;
        showModal = true;
    }

    function openEditModal(item: ShopItem) {
        editingItem = { ...item };
        isEditing = true;
        showModal = true;
    }

    async function handleDelete(id: string) {
        if (!confirm("Are you sure you want to delete this item?")) return;

        const res = await deleteAdminItem(id);
        if (res.success) {
            showToast("Item deleted successfully", "success");
            loadItems();
        } else {
            showToast(res.error || "Failed to delete item", "error");
        }
    }

    async function handleSave(event: CustomEvent<Partial<ShopItem>>) {
        const item = event.detail;
        if (!item.id || !item.name) {
            showToast("ID and Name are required", "error");
            return;
        }

        let res;
        if (isEditing) {
            res = await updateAdminItem(item.id, item);
        } else {
            res = await createAdminItem(item as ShopItem);
        }

        if (res.success) {
            showToast(
                `Item ${isEditing ? "updated" : "created"} successfully`,
                "success",
            );
            showModal = false;
            loadItems();
        } else {
            showToast(res.error || "Operation failed", "error");
        }
    }

    onMount(() => {
        loadItems();
    });
</script>

<div class="container mx-auto px-4 py-8">
    <div class="flex justify-between items-center mb-6">
        <h1 class="text-2xl font-bold">Shop Items</h1>
        <div class="flex gap-4">
            <a
                href="/admin/game"
                class="text-indigo-600 hover:text-indigo-900 py-2"
                >Back to Dashboard</a
            >
            <button
                on:click={openCreateModal}
                class="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700"
            >
                Add New Item
            </button>
        </div>
    </div>

    {#if loading}
        <div class="flex justify-center p-8">
            <div
                class="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"
            ></div>
        </div>
    {:else}
        <div class="bg-white shadow overflow-hidden rounded-lg">
            <table class="min-w-full divide-y divide-gray-200">
                <thead class="bg-gray-50">
                    <tr>
                        <th
                            class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                            >Icon</th
                        >
                        <th
                            class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                            >Name</th
                        >
                        <th
                            class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                            >Type</th
                        >
                        <th
                            class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                            >Price</th
                        >
                        <th
                            class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                            >Level</th
                        >
                        <th
                            class="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider"
                            >Actions</th
                        >
                    </tr>
                </thead>
                <tbody class="bg-white divide-y divide-gray-200">
                    {#each items as item}
                        <tr>
                            <td class="px-6 py-4 whitespace-nowrap text-2xl"
                                >{item.icon || ""}</td
                            >
                            <td
                                class="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900"
                                >{item.name}</td
                            >
                            <td
                                class="px-6 py-4 whitespace-nowrap text-sm text-gray-500 badge badge-{item.type}"
                                >{item.type}</td
                            >
                            <td
                                class="px-6 py-4 whitespace-nowrap text-sm text-gray-500"
                            >
                                {#if item.price_gold > 0}
                                    <span class="text-yellow-600 font-bold"
                                        >{item.price_gold} G</span
                                    >
                                {/if}
                                {#if item.price_gems > 0}
                                    <span class="ml-2 text-purple-600 font-bold"
                                        >{item.price_gems} 💎</span
                                    >
                                {/if}
                            </td>
                            <td
                                class="px-6 py-4 whitespace-nowrap text-sm text-gray-500"
                                >{item.unlock_level}</td
                            >
                            <td
                                class="px-6 py-4 whitespace-nowrap text-right text-sm font-medium"
                            >
                                <button
                                    on:click={() => openEditModal(item)}
                                    class="text-indigo-600 hover:text-indigo-900 mr-4"
                                    >Edit</button
                                >
                                <button
                                    on:click={() => handleDelete(item.id)}
                                    class="text-red-600 hover:text-red-900"
                                    >Delete</button
                                >
                            </td>
                        </tr>
                    {/each}
                </tbody>
            </table>
        </div>
    {/if}

    {#if showModal}
        <div
            class="fixed inset-0 bg-gray-500 bg-opacity-75 flex items-center justify-center p-4 z-50"
        >
            <div
                class="bg-white rounded-lg p-6 max-w-lg w-full max-h-[90vh] overflow-y-auto"
            >
                <div class="flex justify-between items-center mb-4">
                    <h3 class="text-lg font-medium text-gray-900">
                        {isEditing ? "Edit Item" : "New Item"}
                    </h3>
                    <button
                        on:click={() => (showModal = false)}
                        class="text-gray-400 hover:text-gray-500"
                    >
                        <span class="sr-only">Close</span>
                        <svg
                            class="h-6 w-6"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                        >
                            <path
                                stroke-linecap="round"
                                stroke-linejoin="round"
                                stroke-width="2"
                                d="M6 18L18 6M6 6l12 12"
                            />
                        </svg>
                    </button>
                </div>
                {#if editingItem}
                    <ItemForm item={editingItem} on:submit={handleSave} />
                {/if}
            </div>
        </div>
    {/if}
</div>

<style>
    .badge-seed {
        @apply bg-green-100 text-green-800 px-2 py-1 rounded-full text-xs;
    }
    .badge-tool {
        @apply bg-blue-100 text-blue-800 px-2 py-1 rounded-full text-xs;
    }
    .badge-upgrade {
        @apply bg-purple-100 text-purple-800 px-2 py-1 rounded-full text-xs;
    }
    .badge-decoration {
        @apply bg-pink-100 text-pink-800 px-2 py-1 rounded-full text-xs;
    }
    .badge-premium {
        @apply bg-yellow-100 text-yellow-800 px-2 py-1 rounded-full text-xs;
    }
    .badge-booster {
        @apply bg-red-100 text-red-800 px-2 py-1 rounded-full text-xs;
    }
</style>
