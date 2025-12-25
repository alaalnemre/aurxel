'use client';

import React, { createContext, useContext, useReducer, useEffect } from 'react';
import type { CartItem } from '@/lib/types/database';

interface CartState {
    items: CartItem[];
    sellerId: string | null;
    sellerName: string | null;
}

type CartAction =
    | { type: 'ADD_ITEM'; item: CartItem }
    | { type: 'UPDATE_QUANTITY'; productId: string; quantity: number }
    | { type: 'REMOVE_ITEM'; productId: string }
    | { type: 'CLEAR_CART' }
    | { type: 'LOAD_CART'; state: CartState };

interface CartContextType {
    state: CartState;
    addItem: (item: CartItem) => boolean;
    updateQuantity: (productId: string, quantity: number) => void;
    removeItem: (productId: string) => void;
    clearCart: () => void;
    getTotal: () => number;
    getItemCount: () => number;
}

const CartContext = createContext<CartContextType | null>(null);

const CART_STORAGE_KEY = 'jordanmarket_cart';

const initialState: CartState = {
    items: [],
    sellerId: null,
    sellerName: null,
};

function cartReducer(state: CartState, action: CartAction): CartState {
    switch (action.type) {
        case 'ADD_ITEM': {
            const existingItem = state.items.find(
                (item) => item.productId === action.item.productId
            );

            if (existingItem) {
                // Update quantity
                return {
                    ...state,
                    items: state.items.map((item) =>
                        item.productId === action.item.productId
                            ? { ...item, quantity: Math.min(item.quantity + action.item.quantity, item.stock) }
                            : item
                    ),
                };
            }

            // Add new item
            return {
                ...state,
                items: [...state.items, action.item],
                sellerId: state.sellerId || action.item.sellerId,
                sellerName: state.sellerName || action.item.sellerName,
            };
        }

        case 'UPDATE_QUANTITY': {
            if (action.quantity <= 0) {
                return cartReducer(state, { type: 'REMOVE_ITEM', productId: action.productId });
            }

            return {
                ...state,
                items: state.items.map((item) =>
                    item.productId === action.productId
                        ? { ...item, quantity: Math.min(action.quantity, item.stock) }
                        : item
                ),
            };
        }

        case 'REMOVE_ITEM': {
            const newItems = state.items.filter((item) => item.productId !== action.productId);

            // Clear seller if cart is empty
            if (newItems.length === 0) {
                return initialState;
            }

            return { ...state, items: newItems };
        }

        case 'CLEAR_CART':
            return initialState;

        case 'LOAD_CART':
            return action.state;

        default:
            return state;
    }
}

export function CartProvider({ children }: { children: React.ReactNode }) {
    const [state, dispatch] = useReducer(cartReducer, initialState);

    // Load cart from localStorage on mount
    useEffect(() => {
        try {
            const saved = localStorage.getItem(CART_STORAGE_KEY);
            if (saved) {
                const parsed = JSON.parse(saved);
                dispatch({ type: 'LOAD_CART', state: parsed });
            }
        } catch (e) {
            console.error('Failed to load cart:', e);
        }
    }, []);

    // Save cart to localStorage on change
    useEffect(() => {
        try {
            localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(state));
        } catch (e) {
            console.error('Failed to save cart:', e);
        }
    }, [state]);

    // Add item - returns false if from different seller
    function addItem(item: CartItem): boolean {
        // Check if cart has items from a different seller
        if (state.sellerId && state.sellerId !== item.sellerId) {
            return false;
        }

        dispatch({ type: 'ADD_ITEM', item });
        return true;
    }

    function updateQuantity(productId: string, quantity: number) {
        dispatch({ type: 'UPDATE_QUANTITY', productId, quantity });
    }

    function removeItem(productId: string) {
        dispatch({ type: 'REMOVE_ITEM', productId });
    }

    function clearCart() {
        dispatch({ type: 'CLEAR_CART' });
    }

    function getTotal(): number {
        return state.items.reduce(
            (total, item) => total + item.price * item.quantity,
            0
        );
    }

    function getItemCount(): number {
        return state.items.reduce((count, item) => count + item.quantity, 0);
    }

    return (
        <CartContext.Provider
            value={{
                state,
                addItem,
                updateQuantity,
                removeItem,
                clearCart,
                getTotal,
                getItemCount,
            }}
        >
            {children}
        </CartContext.Provider>
    );
}

export function useCart() {
    const context = useContext(CartContext);
    if (!context) {
        throw new Error('useCart must be used within a CartProvider');
    }
    return context;
}
