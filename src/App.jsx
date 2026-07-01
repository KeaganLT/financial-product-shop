// src/App.jsx
import { useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext.jsx';
import { CartProvider, useCart } from './context/CartContext.jsx';
import { ThemeProvider } from './context/ThemeContext.jsx';
import ProductsPage from './pages/ProductsPage';
import ProductDetailPage from './pages/ProductDetailPage';
import LoginPage from './pages/LoginPage';
import SignUpPage from './pages/SignUpPage';
import AccountPage from './pages/AccountPage';
import CartPage from './pages/CartPage';

// Syncs cart state with the currently logged-in user.
// Sits inside both providers so it can read both contexts without coupling them.
function AuthCartBridge() {
    const { auth } = useAuth();
    const { initCart } = useCart();

    useEffect(() => {
        initCart(auth?.customerId ?? null);
    }, [auth, initCart]);

    return null;
}

export default function App() {
    return (
        <ThemeProvider>
            <AuthProvider>
                <CartProvider>
                    <BrowserRouter>
                        <AuthCartBridge />
                        <Routes>
                            <Route path="/"              element={<Navigate to="/login" replace />} />
                            <Route path="/products"      element={<ProductsPage />} />
                            <Route path="/products/:id"  element={<ProductDetailPage />} />
                            <Route path="/login"         element={<LoginPage />} />
                            <Route path="/signup"        element={<SignUpPage />} />
                            <Route path="/account"       element={<AccountPage />} />
                            <Route path="/cart"          element={<CartPage />} />
                            <Route path="*"              element={<Navigate to="/products" replace />} />
                        </Routes>
                    </BrowserRouter>
                </CartProvider>
            </AuthProvider>
        </ThemeProvider>
    );
}