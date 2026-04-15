"use client";

import { createContext, useContext, useState, useEffect, useCallback, type ReactNode } from "react";

interface CartContextValue {
    /** Number of items currently in the cart */
    count: number;
    /** Re-fetch the cart count from the API */
    refreshCart: () => Promise<void>;
}

const CartContext = createContext<CartContextValue>({
    count: 0,
    refreshCart: async () => { },
});

export function useCart() {
    return useContext(CartContext);
}

export function CartProvider({ children }: { children: ReactNode }) {
    const [count, setCount] = useState(0);

    const refreshCart = useCallback(async () => {
        try {
            const res = await fetch("/api/cart");
            if (res.ok) {
                const data = await res.json();
                setCount(Array.isArray(data) ? data.length : 0);
            }
        } catch {
            // silently fail — badge just stays at current count
        }
    }, []);

    useEffect(() => {
        refreshCart();
    }, [refreshCart]);

    return (
        <CartContext.Provider value={{ count, refreshCart }}>
            {children}
        </CartContext.Provider>
    );
}
