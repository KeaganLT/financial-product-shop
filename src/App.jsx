// src/App.jsx
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext.jsx';
import ProductsPage from './pages/ProductsPage';
import ProductDetailPage from './pages/ProductDetailPage';
import LoginPage from './pages/LoginPage';

export default function App() {
    return (
        <AuthProvider>
            <BrowserRouter>
                <Routes>
                    <Route path="/"           element={<Navigate to="/login" replace />} />
                    <Route path="/products"   element={<ProductsPage />} />
                    <Route path="/products/:id" element={<ProductDetailPage />} />
                    <Route path="/login"      element={<LoginPage />} />
                    <Route path="*"           element={<Navigate to="/products" replace />} />
                </Routes>
            </BrowserRouter>
        </AuthProvider>
    );
}