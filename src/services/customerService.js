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

export async function getProfile(token) {
    const response = await fetch(`${CLIENT_BASE_URL}/profile`, {
        headers: { Authorization: `Bearer ${token}` },
    });
    if (!response.ok) throw new Error('Failed to fetch profile');
    return response.json();
}

export async function getTypes(token) {
    const response = await fetch(`${CLIENT_BASE_URL}/types`, {
        headers: { Authorization: `Bearer ${token}` },
    });
    if (!response.ok) throw new Error('Failed to fetch types');
    return response.json(); // { customerTypes: [...], accountTypes: [...] }
}

export async function updateCustomerType(customerTypeId, token) {
    const response = await fetch(`${CLIENT_BASE_URL}/profile`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ customerTypeId }),
    });
    if (!response.ok) throw new Error('Failed to update customer type');
    return response.json().catch(() => null);
}

export async function addAccount(accountTypeId, token) {
    const response = await fetch(`${CLIENT_BASE_URL}/profile/accounts/${accountTypeId}`, {
        method: 'PUT',
        headers: { Authorization: `Bearer ${token}` },
    });
    if (!response.ok) throw new Error('Failed to add account');
}

export async function removeAccount(accountTypeId, token) {
    const response = await fetch(`${CLIENT_BASE_URL}/profile/accounts/${accountTypeId}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
    });
    if (!response.ok) throw new Error('Failed to remove account');
}

export async function getKycBackendStatus(customerId, token) {
    const response = await fetch(`${USER_BASE_URL}/kyc/${customerId}`, {
        headers: { Authorization: `Bearer ${token}` },
    });
    if (response.status === 404) return null;
    if (!response.ok) return null;
    return response.json().catch(() => null);
}

export async function postKycStatus(customerId, { primaryIndicator, secondaryIndicator, taxCompliance }, token) {
    // Guard against duplicates — skip if a record already exists
    const existing = await getKycBackendStatus(customerId, token);
    if (existing) return;

    const response = await fetch(`${USER_BASE_URL}/kyc/${customerId}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ primaryIndicator, secondaryIndicator, taxCompliance }),
    });
    // 204 = success, no body
    if (!response.ok) throw new Error('Failed to update KYC status');
}

export async function seedDhaData(idNumber, token) {
    const headers = { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` };

    // Check each endpoint before posting to avoid duplicates
    const [livingRes, duplicateRes, maritalRes] = await Promise.all([
        fetch(`${USER_BASE_URL}/status/living/${idNumber}`, { headers }),
        fetch(`${USER_BASE_URL}/status/duplicateId/${idNumber}`, { headers }),
        fetch(`${USER_BASE_URL}/status/marital/${idNumber}`, { headers }),
    ]);

    await Promise.all([
        livingRes.ok ? null : fetch(`${USER_BASE_URL}/status/living/${idNumber}`, {
            method: 'POST', headers,
            body: JSON.stringify({ livingStatus: 'alive' }),
        }),
        duplicateRes.ok ? null : fetch(`${USER_BASE_URL}/status/duplicateId/${idNumber}`, {
            method: 'POST', headers,
            body: JSON.stringify({ hasDuplicateId: false }),
        }),
        maritalRes.ok ? null : fetch(`${USER_BASE_URL}/status/marital/${idNumber}`, {
            method: 'POST', headers,
            body: JSON.stringify({ status: 'Single', effectiveFrom: '2000-01-01', effectiveTo: '2099-12-31' }),
        }),
    ]);
}
