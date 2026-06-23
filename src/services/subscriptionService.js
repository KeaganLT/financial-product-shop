const BASE_URL = '/client/v1';

export async function getEligibility(productIds, token) {
    const response = await fetch(`${BASE_URL}/subscriptions/eligibility`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ productIds }),
    });
    if (!response.ok) {
        throw new Error('Failed to check eligibility');
    }
    return response.json();
}

export async function getSubscription(id, token) {
    const response = await fetch(`${BASE_URL}/subscriptions/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
    });
    if (!response.ok) {
        throw new Error('Failed to fetch subscription');
    }
    return response.json();
}