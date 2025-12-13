<script lang="ts">
  import { createEventDispatcher } from "svelte";
  import type { ShopItem } from "$lib/api";

  export let item: Partial<ShopItem> = {
    type: "decoration",
    max_quantity: 1,
    unlock_level: 1,
    price_gold: 0,
    price_gems: 0,
  };

  const dispatch = createEventDispatcher();

  const itemTypes = [
    "seed",
    "tool",
    "upgrade",
    "decoration",
    "premium",
    "booster",
  ];

  async function handleSubmit() {
    dispatch("submit", item);
  }

  const effectPlaceholder = '{"type":"auto_water","area":9}';
</script>

<form on:submit|preventDefault={handleSubmit} class="space-y-4">
  <div>
    <label class="block text-sm font-medium text-gray-700">ID</label>
    <input
      type="text"
      bind:value={item.id}
      disabled={!!item.id && item.id.length > 0}
      class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
      required
    />
  </div>

  <div>
    <label class="block text-sm font-medium text-gray-700">Nama</label>
    <input
      type="text"
      bind:value={item.name}
      class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
      required
    />
  </div>

  <div>
    <label class="block text-sm font-medium text-gray-700">Tipe</label>
    <select
      bind:value={item.type}
      class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
    >
      {#each itemTypes as type}
        <option value={type}>{type}</option>
      {/each}
    </select>
  </div>

  <div class="grid grid-cols-2 gap-4">
    <div>
      <label class="block text-sm font-medium text-gray-700">Harga (Emas)</label
      >
      <input
        type="number"
        bind:value={item.price_gold}
        class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
        min="0"
      />
    </div>

    <div>
      <label class="block text-sm font-medium text-gray-700"
        >Harga (Permata)</label
      >
      <input
        type="number"
        bind:value={item.price_gems}
        class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
        min="0"
      />
    </div>
  </div>

  <div class="grid grid-cols-2 gap-4">
    <div>
      <label class="block text-sm font-medium text-gray-700"
        >Level Terbuka</label
      >
      <input
        type="number"
        bind:value={item.unlock_level}
        class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
        min="1"
      />
    </div>

    <div>
      <label class="block text-sm font-medium text-gray-700"
        >Kuantitas Maks (-1 untuk tak terbatas)</label
      >
      <input
        type="number"
        bind:value={item.max_quantity}
        class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
      />
    </div>
  </div>

  <div>
    <label class="block text-sm font-medium text-gray-700">Ikon (Emoji)</label>
    <input
      type="text"
      bind:value={item.icon}
      class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
    />
  </div>

  <div>
    <label class="block text-sm font-medium text-gray-700">Deskripsi</label>
    <textarea
      bind:value={item.description}
      class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
    ></textarea>
  </div>

  <div>
    <label class="block text-sm font-medium text-gray-700">Efek (JSON)</label>
    <textarea
      bind:value={item.effect}
      class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
      placeholder={effectPlaceholder}
    ></textarea>
  </div>

  <div class="flex justify-end pt-4">
    <button
      type="submit"
      class="ml-3 inline-flex justify-center rounded-md border border-transparent bg-indigo-600 py-2 px-4 text-sm font-medium text-white shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
    >
      Simpan
    </button>
  </div>
</form>
