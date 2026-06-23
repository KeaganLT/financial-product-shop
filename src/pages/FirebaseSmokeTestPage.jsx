import { useState } from 'react';
import { ref, uploadString, getDownloadURL } from 'firebase/storage';
import { storage } from '../services/firebase';

// Temporary page to confirm Firebase Storage is wired up correctly.
// Delete this file once the upload succeeds.
export default function FirebaseSmokeTestPage() {
    const [status, setStatus] = useState('idle');
    const [url, setUrl] = useState('');
    const [error, setError] = useState('');

    async function handleTestUpload() {
        setStatus('uploading');
        setError('');
        try {
            const testRef = ref(storage, `smoke-test/${Date.now()}.txt`);
            await uploadString(testRef, 'hello from financial-product-shop');
            const downloadUrl = await getDownloadURL(testRef);
            setUrl(downloadUrl);
            setStatus('done');
        } catch (err) {
            setError(err.message);
            setStatus('error');
        }
    }

    return (
        <div style={{ padding: 24 }}>
            <h1>Firebase Storage Smoke Test</h1>
            <button onClick={handleTestUpload}>Upload test file</button>
            <p>Status: {status}</p>
            {url && <p>Uploaded! URL: <a href={url} target="_blank" rel="noreferrer">{url}</a></p>}
            {error && <p style={{ color: 'red' }}>Error: {error}</p>}
        </div>
    );
}
