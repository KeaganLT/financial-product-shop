import { createContext, useState, useContext, useCallback } from 'react';

const CartContext = createContext(null);

const STORAGE_PREFIX = 'cart_';

function storageKey(customerId) {
    return `${STORAGE_PREFIX}${customerId}`;
}

function loadCart(customerId) {
    if (!customerId) return [];
    try {
        const raw = localStorage.getItem(storageKey(customerId));
        return raw ? JSON.parse(raw) : [];
    } catch {
        return [];
    }
}

function saveCart(customerId, items) {
    if (!customerId) return;
    localStorage.setItem(storageKey(customerId), JSON.stringify(items));
}

export function CartProvider({ children }) {
    const [items, setItems] = useState([]);
    const [customerId, setCustomerId] = useState(null);

    // Called by App when user logs in/out — seeds cart from localStorage
    // for the now-logged-in user, or clears it on logout.
    const initCart = useCallback((id) => {
        setCustomerId(id);
        setItems(id ? loadCart(id) : []);
    }, []);

    function addItem(product) {
        setItems((prev) => {
            if (prev.some((p) => p.id === product.id)) return prev;
            const next = [...prev, product];
            saveCart(customerId, next);
            return next;
        });
    }

    function removeItem(productId) {
        setItems((prev) => {
            const next = prev.filter((p) => p.id !== productId);
            saveCart(customerId, next);
            return next;
        });
    }

    function clearCart() {
        setItems([]);
        saveCart(customerId, []);
    }

    const isInCart = (productId) => items.some((p) => p.id === productId);

    return (
        <CartContext.Provider value={{ items, addItem, removeItem, clearCart, isInCart, initCart }}>
            {children}
        </CartContext.Provider>
    );
}

export function useCart() {
    const context = useContext(CartContext);
    if (!context) throw new Error('useCart must be used inside a CartProvider');
    return context;
}
