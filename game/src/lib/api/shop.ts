import { getToken, getAuthHeaders } from './auth';

// API Configuration
const API_BASE_URL = 'https://backend.atiohaidar.workers.dev';

// Types
export interface Item {
    id: string;
    name: string;
    description?: string;
    stock: number;
    price: number;
    attachment_link?: string;
    owner_username: string;
    created_at?: string;
    updated_at?: string;
}

export interface ItemsResponse {
    success: boolean;
    data: Item[];
    message?: string;
}

export interface PurchaseResponse {
    success: boolean;
    item?: Item;
    quantity?: number;
    totalPrice?: number;
    newBalance?: number;
    message?: string;
}

export interface UserBalanceResponse {
    success: boolean;
    user?: {
        username: string;
        name: string;
        role: string;
        balance: number;
    };
    message?: string;
}

/**
 * Get list of items available for purchase
 */
export async function getItems(): Promise<ItemsResponse> {
    try {
        const token = getToken();
        const response = await fetch(`${API_BASE_URL}/api/items`, {
            headers: {
                ...getAuthHeaders(),
            },
        });

        return await response.json();
    } catch (error) {
        console.error('Get items error:', error);
        return {
            success: false,
            data: [],
            message: 'Network error. Please try again.',
        };
    }
}

/**
 * Purchase an item
 */
export async function purchaseItem(
    itemId: string,
    quantity: number = 1
): Promise<PurchaseResponse> {
    try {
        const response = await fetch(`${API_BASE_URL}/api/items/purchase`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                ...getAuthHeaders(),
            },
            body: JSON.stringify({ item_id: itemId, quantity }),
        });

        return await response.json();
    } catch (error) {
        console.error('Purchase error:', error);
        return {
            success: false,
            message: 'Network error. Please try again.',
        };
    }
}

/**
 * Get current user's balance
 */
export async function getUserBalance(username: string): Promise<UserBalanceResponse> {
    try {
        const response = await fetch(`${API_BASE_URL}/api/users/${username}`, {
            headers: {
                ...getAuthHeaders(),
            },
        });

        return await response.json();
    } catch (error) {
        console.error('Get balance error:', error);
        return {
            success: false,
            message: 'Network error. Please try again.',
        };
    }
}
