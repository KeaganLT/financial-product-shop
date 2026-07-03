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
import CheckoutPage from './pages/CheckoutPage';
import CheckoutResultPage from './pages/CheckoutResultPage';
import SubscribeCheckoutPage from './pages/SubscribeCheckoutPage';
import KycDocumentsPage from './pages/KycDocumentsPage';
import SubscriptionsPage from './pages/SubscriptionsPage';
import Footer from './components/Footer';

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
                            <Route path="/checkout"      element={<CheckoutPage />} />
                            <Route path="/checkout/result" element={<CheckoutResultPage />} />
                            <Route path="/checkout/subscribe/:productId" element={<SubscribeCheckoutPage />} />
                            <Route path="/kyc"           element={<KycDocumentsPage />} />
                            <Route path="/subscriptions" element={<SubscriptionsPage />} />
                            <Route path="*"              element={<Navigate to="/products" replace />} />
                        </Routes>
                        <Footer />
                    </BrowserRouter>
                </CartProvider>
            </AuthProvider>
        </ThemeProvider>
    );
}