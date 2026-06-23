const BASE_URL = '/v1';

function decodeCustomerId(token) {
    const payload = token.split('.')[1];
    const json = atob(payload.replace(/-/g, '+').replace(/_/g, '/'));
    return JSON.parse(json).sub;
}

export async function login(username, password) {
    const response = await fetch(`${BASE_URL}/token`, {
        method: 'POST',
        headers: {
            Authorization: `Basic ${btoa(`${username}:${password}`)}`,
        },
    });

    if (!response.ok) {
        const text = await response.text().catch(() => '');
        throw new Error(text ? `Invalid email or password (${response.status}): ${text}` : `Invalid email or password (${response.status})`);
    }

    const data = await response.json();
    const token = data.loginAccessKey;

    if (!token) {
        throw new Error('Login failed');
    }

    return { token, customerId: decodeCustomerId(token) };
}