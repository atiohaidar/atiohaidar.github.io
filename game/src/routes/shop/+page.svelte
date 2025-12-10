<script lang="ts">
  import { onMount } from 'svelte';
  import { goto } from '$app/navigation';
  import { getUser, isAuthenticated } from '$lib/api/auth';
  import { getItems, purchaseItem, type Item } from '$lib/api/shop';

  let items = $state<Item[]>([]);
  let loading = $state(true);
  let purchasing = $state<string | null>(null);
  let error = $state('');
  let successMessage = $state('');
  let userBalance = $state(0);

  onMount(async () => {
    if (!isAuthenticated()) {
      goto('/login?redirect=/shop');
      return;
    }

    await loadItems();
  });

  async function loadItems() {
    loading = true;
    error = '';
    
    const result = await getItems();
    
    if (result.success) {
      items = result.data.filter(item => item.stock > 0 && item.price > 0);
    } else {
      error = result.message || 'Failed to load items';
    }
    
    loading = false;
  }

  async function handlePurchase(item: Item) {
    if (purchasing) return;
    
    purchasing = item.id;
    error = '';
    successMessage = '';

    const result = await purchaseItem(item.id, 1);
    
    if (result.success) {
      successMessage = `Berhasil membeli ${item.name}! Saldo sekarang: ${result.newBalance?.toLocaleString()}`;
      userBalance = result.newBalance ?? userBalance;
      // Reload items to update stock
      await loadItems();
    } else {
      error = result.message || 'Purchase failed';
    }
    
    purchasing = null;
  }

  function formatPrice(price: number): string {
    return price.toLocaleString('id-ID');
  }
</script>

<svelte:head>
  <title>Shop - Color Match Frenzy</title>
</svelte:head>

<div class="shop-page">
  <div class="shop-header">
    <h1 class="shop-title">🛒 Item Shop</h1>
    <p class="shop-subtitle">Beli item dengan saldo kamu!</p>
    <a href="/" class="back-btn">← Kembali ke Game</a>
  </div>

  {#if successMessage}
    <div class="alert alert-success">
      ✅ {successMessage}
    </div>
  {/if}

  {#if error}
    <div class="alert alert-error">
      ⚠️ {error}
    </div>
  {/if}

  {#if loading}
    <div class="loader">
      <div class="loader-spinner"></div>
      <p>Loading items...</p>
    </div>
  {:else if items.length === 0}
    <div class="empty-state">
      <p>🏪 Tidak ada item yang tersedia saat ini</p>
      <button class="btn btn-secondary" onclick={loadItems}>Refresh</button>
    </div>
  {:else}
    <div class="items-grid">
      {#each items as item (item.id)}
        <div class="item-card glass-card">
          <div class="item-header">
            <h3 class="item-name">{item.name}</h3>
            <span class="item-stock">{item.stock} tersedia</span>
          </div>
          
          {#if item.description}
            <p class="item-description">{item.description}</p>
          {/if}
          
          <div class="item-footer">
            <div class="item-price">
              <span class="price-label">Harga</span>
              <span class="price-value">💰 {formatPrice(item.price)}</span>
            </div>
            
            <button 
              class="btn btn-accent btn-sm"
              disabled={purchasing === item.id}
              onclick={() => handlePurchase(item)}
            >
              {#if purchasing === item.id}
                <span class="btn-spinner"></span>
                Membeli...
              {:else}
                🛒 Beli
              {/if}
            </button>
          </div>
          
          <div class="item-seller">
            Dijual oleh: {item.owner_username}
          </div>
        </div>
      {/each}
    </div>
  {/if}
</div>

<style>
  .shop-page {
    min-height: calc(100vh - 60px);
    padding: var(--spacing-lg);
    max-width: 1200px;
    margin: 0 auto;
  }

  .shop-header {
    text-align: center;
    margin-bottom: var(--spacing-xl);
  }

  .shop-title {
    font-size: 2rem;
    font-weight: 700;
    margin-bottom: var(--spacing-xs);
    background: linear-gradient(135deg, var(--tile-yellow), var(--tile-orange));
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    background-clip: text;
  }

  .shop-subtitle {
    color: var(--text-secondary);
    margin-bottom: var(--spacing-md);
  }

  .back-btn {
    color: var(--text-muted);
    text-decoration: none;
    font-size: 0.875rem;
  }

  .back-btn:hover {
    color: var(--text-primary);
  }

  .alert {
    padding: var(--spacing-md);
    border-radius: var(--radius-md);
    margin-bottom: var(--spacing-lg);
    text-align: center;
  }

  .alert-success {
    background: rgba(81, 207, 102, 0.1);
    border: 1px solid rgba(81, 207, 102, 0.3);
    color: var(--tile-green);
  }

  .alert-error {
    background: rgba(255, 107, 107, 0.1);
    border: 1px solid rgba(255, 107, 107, 0.3);
    color: var(--tile-red);
  }

  .loader {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: var(--spacing-md);
    color: var(--text-secondary);
    padding: var(--spacing-2xl);
  }

  .empty-state {
    text-align: center;
    padding: var(--spacing-2xl);
    color: var(--text-secondary);
  }

  .items-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
    gap: var(--spacing-lg);
  }

  .item-card {
    padding: var(--spacing-lg);
    display: flex;
    flex-direction: column;
    gap: var(--spacing-md);
    transition: transform var(--transition-normal), box-shadow var(--transition-normal);
  }

  .item-card:hover {
    transform: translateY(-4px);
    box-shadow: 0 12px 40px rgba(0, 0, 0, 0.4);
  }

  .item-header {
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
    gap: var(--spacing-sm);
  }

  .item-name {
    font-size: 1.125rem;
    font-weight: 600;
    color: var(--text-primary);
    margin: 0;
  }

  .item-stock {
    font-size: 0.75rem;
    color: var(--tile-green);
    background: rgba(81, 207, 102, 0.1);
    padding: var(--spacing-xs) var(--spacing-sm);
    border-radius: var(--radius-full);
    white-space: nowrap;
  }

  .item-description {
    font-size: 0.875rem;
    color: var(--text-secondary);
    margin: 0;
    flex-grow: 1;
  }

  .item-footer {
    display: flex;
    justify-content: space-between;
    align-items: center;
    gap: var(--spacing-md);
    padding-top: var(--spacing-sm);
    border-top: 1px solid var(--glass-border);
  }

  .item-price {
    display: flex;
    flex-direction: column;
    gap: 2px;
  }

  .price-label {
    font-size: 0.75rem;
    color: var(--text-muted);
  }

  .price-value {
    font-size: 1.125rem;
    font-weight: 700;
    color: var(--tile-yellow);
  }

  .item-seller {
    font-size: 0.75rem;
    color: var(--text-muted);
  }

  .btn-spinner {
    width: 14px;
    height: 14px;
    border: 2px solid rgba(255, 255, 255, 0.3);
    border-top-color: white;
    border-radius: 50%;
    animation: spin 0.8s linear infinite;
    display: inline-block;
  }

  @keyframes spin {
    to { transform: rotate(360deg); }
  }

  @media (max-width: 640px) {
    .shop-page {
      padding: var(--spacing-md);
    }

    .items-grid {
      grid-template-columns: 1fr;
    }
  }
</style>
