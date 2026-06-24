const USER_BASE_URL = '/v1';
const CLIENT_BASE_URL = '/client/v1';

async function readErrorMessage(response, fallback) {
    const text = await response.text().catch(() => '');
    return text ? `${fallback} (${response.status}): ${text}` : `${fallback} (${response.status})`;
}

export async function createUser(username, password) {
    const response = await fetch(`${USER_BASE_URL}/user`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password }),
    });
    if (!response.ok) {
       const err = new Error(await readErrorMessage(response, 'Failed to create user account'));
       err.status = response.status;
       throw err;
    }
    return response.json().catch(() => null);
}

export async function createProfile(profile, token) {
    const response = await fetch(`${CLIENT_BASE_URL}/profile`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(profile),
    });
    if (!response.ok) {
        throw new Error(await readErrorMessage(response, 'Failed to create customer profile'));
    }
    return response.json().catch(() => null);
}
