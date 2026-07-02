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

export async function takeUpProducts(productIds, token) {
    const response = await fetch(`${BASE_URL}/subscriptions`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ productIds }),
    });
    const data = await response.json();
    if (response.status === 422) return { success: false, fulfilmentResultList: data.fulfilmentResultList };
    if (!response.ok) throw new Error(data?.message || 'Take-up failed');
    return { success: true, fulfilmentResultList: data.fulfilmentResultList ?? [] };
}

export async function getSubscriptions(token) {
    const response = await fetch(`${BASE_URL}/subscriptions`, {
        headers: { Authorization: `Bearer ${token}` },
    });
    if (!response.ok) throw new Error('Failed to fetch subscriptions');
    const data = await response.json();
    return data.subscriptions ?? data ?? [];
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

export async function deleteSubscription(id, token) {
    const response = await fetch(`${BASE_URL}/subscriptions/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
    });
    if (!response.ok) throw new Error('Failed to cancel subscription');
}