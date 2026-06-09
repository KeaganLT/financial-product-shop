import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
    Container,
    Box,
    Typography,
    Button,
    CircularProgress,
    Alert,
    Chip,
    Divider,
    Paper,
} from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import ShoppingCartIcon from '@mui/icons-material/ShoppingCart';
import { getProductById } from '../services/productService';

export default function ProductDetailPage() {
    const { id } = useParams();
    const navigate = useNavigate();

    const [product, setProduct] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        getProductById(id)
            .then((data) => setProduct(data))
            .catch((err) => setError(err.message))
            .finally(() => setLoading(false));
    }, [id]);

    if (loading) {
        return (
            <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
                <CircularProgress />
            </Box>
        );
    }

    if (error) {
        return (
            <Container maxWidth="md" sx={{ py: 4 }}>
                <Alert severity="error" sx={{ mb: 2 }}>
                    Could not load product: {error}
                </Alert>
                <Button startIcon={<ArrowBackIcon />} onClick={() => navigate('/products')}>
                    Back to Products
                </Button>
            </Container>
        );
    }

    return (
        <Container maxWidth="md" sx={{ py: 4 }}>
            {/* Back navigation */}
            <Button
                startIcon={<ArrowBackIcon />}
                onClick={() => navigate('/products')}
                sx={{ mb: 3 }}
            >
                Back to Products
            </Button>


            <Box
                component="img"
                src={product.imageUrl || 'https://placehold.co/800x300?text=No+Image'}
                alt={product.name}
                sx={{
                    width: '100%',
                    height: 280,
                    objectFit: 'cover',
                    borderRadius: 2,
                    mb: 3,
                }}
            />

            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
                <Typography variant="h4" fontWeight={700}>
                    {product.name}
                </Typography>
                <Typography variant="h5" fontWeight={600} color="primary" sx={{ ml: 2, whiteSpace: 'nowrap' }}>
                    R {Number(product.price).toFixed(2)}
                </Typography>
            </Box>

            <Divider sx={{ mb: 3 }} />

            <Typography variant="h6" fontWeight={600} gutterBottom>
                About this product
            </Typography>
            <Typography variant="body1" color="text.secondary" sx={{ mb: 3, lineHeight: 1.7 }}>
                {product.description}
            </Typography>

            <Paper variant="outlined" sx={{ p: 2, mb: 3, borderRadius: 2, bgcolor: 'grey.50' }}>
                <Typography variant="body2" color="text.secondary">
                    Eligibility checks are performed when you add this product to your cart.
                    You'll need to be logged in to proceed.
                </Typography>
            </Paper>

            <Button
                variant="contained"
                size="large"
                fullWidth
                startIcon={<ShoppingCartIcon />}
                onClick={() => {
                    navigate('/login');
                }}
            >
                Add to Cart
            </Button>
        </Container>
    );
}