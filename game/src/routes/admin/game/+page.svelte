<script lang="ts">
    import { onMount } from "svelte";
    import { goto } from "$app/navigation";
    import { userRole } from "$lib/stores";

    // Basic role check (can also be handled in layout or hooks)
    /*
  onMount(() => {
     if ($userRole !== 'admin') {
         // handle unauthorized
     }
  });
  */
</script>

<div class="container mx-auto px-4 py-8">
    <h1 class="text-3xl font-bold mb-8">Admin Dashboard Game</h1>

    <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
        <a
            href="/admin/game/players"
            class="block p-6 bg-white rounded-lg border border-gray-200 shadow-md hover:bg-gray-50"
        >
            <h5 class="mb-2 text-2xl font-bold tracking-tight text-gray-900">
                Kelola Pemain
            </h5>
            <p class="font-normal text-gray-700">
                Lihat semua pemain, cek statistik dan progres mereka.
            </p>
        </a>

        <a
            href="/admin/game/items"
            class="block p-6 bg-white rounded-lg border border-gray-200 shadow-md hover:bg-gray-50"
        >
            <h5 class="mb-2 text-2xl font-bold tracking-tight text-gray-900">
                Kelola Item Toko
            </h5>
            <p class="font-normal text-gray-700">
                Tambah item baru, update harga, dan hapus item dari toko.
            </p>
        </a>
    </div>
</div>
