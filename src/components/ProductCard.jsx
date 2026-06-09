import { Card, CardMedia, CardContent, CardActions, Typography, Button, Box } from '@mui/material';
import { useNavigate } from 'react-router-dom';

export default function ProductCard({ product }) {
    const navigate = useNavigate();

    return (
        <Card
            sx={{
                height: '100%',
                display: 'flex',
                flexDirection: 'column',
                cursor: 'pointer',
                transition: 'transform 0.15s ease, box-shadow 0.15s ease',
                '&:hover': {
                    transform: 'translateY(-2px)',
                    boxShadow: 4,
                },
            }}
            onClick={() => navigate(`/products/${product.id}`)}
        >
            <CardMedia
                component="img"
                height="160"
                image={product.imageUrl || 'https://placehold.co/400x160?text=No+Image'}
                alt={product.name}
                sx={{ objectFit: 'cover' }}
            />
            <CardContent sx={{ flexGrow: 1 }}>
                <Typography variant="h6" gutterBottom noWrap>
                    {product.name}
                </Typography>
                <Typography
                    variant="body2"
                    color="text.secondary"
                    sx={{
                        display: '-webkit-box',
                        WebkitLineClamp: 2,
                        WebkitBoxOrient: 'vertical',
                        overflow: 'hidden',
                    }}
                >
                    {product.description}
                </Typography>
            </CardContent>
            <CardActions sx={{ px: 2, pb: 2, justifyContent: 'space-between' }}>
                <Typography variant="subtitle1" fontWeight={600} color="primary">
                    R {Number(product.price).toFixed(2)}
                </Typography>
                <Button
                    size="small"
                    variant="contained"
                    onClick={(e) => {
                        e.stopPropagation();
                        navigate(`/products/${product.id}`);
                    }}
                >
                    View
                </Button>
            </CardActions>
        </Card>
    );
}