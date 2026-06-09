import { Container, Typography, Button } from '@mui/material';
import { useNavigate } from 'react-router-dom';


export default function LoginPage() {
    const navigate = useNavigate();
    return (
        <Container maxWidth="sm" sx={{ py: 8, textAlign: 'center' }}>
            <Typography variant="h5" gutterBottom>
                Login — coming in Milestone 2
            </Typography>
            <Button onClick={() => navigate('/products')}>Back to Products</Button>
        </Container>
    );
}