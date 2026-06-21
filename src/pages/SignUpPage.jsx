import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const [stage, setStage] = useState('email');

return (
     <divSign Up>
     <button onClick={() => setStage('verify')}>Next</button>

);

